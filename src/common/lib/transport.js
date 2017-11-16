import { firebase } from '../../common/modules/firebase'

export const query = obj =>
  Object.keys(obj)
    .map(key => `${key}=${encodeURIComponent(obj[key])}`)
    .join('&')

export const request = (url, params = {}) => {
  return fetch(url + '?' + query(params))
    .then(res => res.json())
    .catch(err => {
      throw err
    })
}

// ============================================================
// Firebase
// ============================================================

/** Converts a firebase snapshot value to a "record" (object with an id). */
const snapshotToRecord = snapshot => {
  return snapshot ? { id: snapshot.key, ...snapshot.toJSON() } : null
}

/**
 * A class for working with lists of firebase records.
 * Firebase keys objects by id. FirebaseRecordList adds/removes an `id` key to each object on request.
 * Each firebase child is converted to/from an object with an `id` equal to the firebase `key`.
 */
class FirebaseRecordList {
  constructor(path) {
    this._ref = firebase.database().ref(path)
  }

  // ----------------------------------------
  // Requests
  // ----------------------------------------

  /**
   * Create a new firebase child from JSON.
   * Resolves with the child from the server as a record.
   */
  create = json => {
    console.debug('FirebaseRecordList.create', this._ref.key, json)
    const { id, ...data } = json

    if (id) {
      console.error(
        'Warning: transport Users.create() disregarding `id`, one will be assigned.',
        json,
      )
    }

    return this._ref.push(data).then(ref => ref.once('value').then(snapshotToRecord))
  }

  /** Fetch a single child as a record. */
  read = id => {
    console.debug('FirebaseRecordList.read', this._ref.key, id)
    return this._ref
      .child(id)
      .once('value')
      .then(snapshotToRecord)
  }

  /** Update the child record by `id`. */
  update = (id, record) => {
    console.debug('FirebaseRecordList.update', this._ref.key, record)
    // ensure we don't persist an id in the record
    // we are keying by id on firebase
    const update = { ...record, id: null }

    return this._ref
      .child(id)
      .update(update)
      .then(snapshotToRecord)
  }

  /** Delete a child by `id`. */
  delete = id => {
    console.debug('FirebaseRecordList.delete', this._ref.key, id)
    return this._ref.child(id).remove()
  }

  /** Get all children at this `path` as an array of records. */
  list = () => {
    console.debug('FirebaseRecordList.list', this._ref.key)
    return this._ref.once('value').then(snapshot => {
      if (!snapshot) return snapshot

      const records = []

      // https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot#forEach
      snapshot.forEach(childSnapshot => {
        records.push(snapshotToRecord(childSnapshot))
      })

      return records
    })
  }

  // ----------------------------------------
  // Subscriptions
  // ----------------------------------------

  /** Listen for updates to a single record. */
  onChange = (id, cb) => {
    let isInit = true
    const ref = this._ref.child(id)

    ref.on('value', snapshot => {
      if (isInit) {
        isInit = false
        return
      }
      console.debug('FirebaseRecordList.onChange', this._ref.key, id)
      cb(snapshotToRecord(snapshot))
    })

    return () => ref.off('value', cb)
  }

  /** Listen for the addition of a child record. */
  onChildAdded = cb => {
    this._ref.on('child_added', snapshot => {
      console.debug('FirebaseRecordList.onChildAdded', this._ref.key, cb)
      cb(snapshotToRecord(snapshot))
    })

    return () => this._ref.off('child_added', cb)
  }

  /** Listen for updates to child records. */
  onChildChanged = cb => {
    this._ref.on('child_changed', snapshot => {
      console.debug('FirebaseRecordList.onChildChanged', this._ref.key, cb)
      cb(snapshotToRecord(snapshot))
    })

    return () => this._ref.off('child_changed', cb)
  }

  /** Listen for the removal of a child record. */
  onChildRemoved = cb => {
    this._ref.on('child_removed', snapshot => {
      console.debug('FirebaseRecordList.onChildRemoved', this._ref.key, cb)
      cb(snapshotToRecord(snapshot))
    })

    return () => this._ref.off('child_removed', cb)
  }
}

export const users = new FirebaseRecordList('/users')
export const roles = new FirebaseRecordList('/roles')
