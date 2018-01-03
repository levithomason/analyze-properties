import { makeDebugger } from '../lib/index'
import { snapshotToValueOrMap } from './firebaseUtils'
import { firebase } from '../modules/firebase'

/**
 * A class for working with lists of firebase records.
 *
 * Firebase keys objects by id.
 * FirebaseListAdapter adds/removes an `id` key to each object on request.
 * Each firebase child is converted to/from an object with an `id` equal to the firebase `key`.
 */
class FirebaseListAdapter {
  constructor(path) {
    this._ref = firebase.database().ref(path)
    this._debug = makeDebugger(`transport:FirebaseListAdapter(${path})`)
  }

  // ----------------------------------------
  // Requests
  // ----------------------------------------

  /**
   * Create a new firebase child from JSON.
   * Resolves with the child from the server as a model.
   */
  create = json => {
    this._debug('create', this._ref.key, json)
    const { id, ...data } = json

    if (id) {
      console.error(
        'Warning: FirebaseListAdapter.create() disregarding `id`, one will be assigned.',
        json,
      )
    }

    return this._ref.push(data).then(ref => ref.once('value').then(snapshotToValueOrMap))
  }

  /** Fetch a single child as a model. */
  read = id => {
    this._debug('read', this._ref.key, id)
    return this._ref
      .child(id)
      .once('value')
      .then(snapshotToValueOrMap)
  }

  /** Update the child model by `id`. */
  update = (id, model) => {
    this._debug('update', this._ref.key, model)
    // ensure we don't persist an id in the model
    // we are keying by id on firebase
    const update = { ...model, id: null }

    return this._ref
      .child(id)
      .update(update)
      .then(snapshotToValueOrMap)
  }

  /** Delete a child by `id`. */
  delete = id => {
    this._debug('delete', this._ref.key, id)
    return this._ref.child(id).remove()
  }

  /** Get all children as an array of records. */
  list = () => {
    this._debug('list', this._ref.key)
    return this._ref.once('value').then(snapshot => {
      if (!snapshot) return snapshot

      const records = []

      // https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot#forEach
      snapshot.forEach(childSnapshot => {
        records.push(snapshotToValueOrMap(childSnapshot))
      })

      return records
    })
  }

  // ----------------------------------------
  // Subscriptions
  // ----------------------------------------

  /** Listen for updates to a single model. */
  onChange = (id, cb) => {
    let isInit = true
    const ref = this._ref.child(id)

    ref.on('value', snapshot => {
      if (isInit) {
        isInit = false
        return
      }
      this._debug('onChange', this._ref.key, id)
      cb(snapshotToValueOrMap(snapshot))
    })

    return () => ref.off('value', cb)
  }

  /** Listen for the addition of a child model. */
  onChildAdded = cb => {
    this._ref.on('child_added', snapshot => {
      this._debug('onChildAdded', this._ref.key, cb)
      cb(snapshotToValueOrMap(snapshot))
    })

    return () => this._ref.off('child_added', cb)
  }

  /** Listen for updates to child records. */
  onChildChanged = cb => {
    this._ref.on('child_changed', snapshot => {
      this._debug('onChildChanged', this._ref.key, cb)
      cb(snapshotToValueOrMap(snapshot))
    })

    return () => this._ref.off('child_changed', cb)
  }

  /** Listen for the removal of a child model. */
  onChildRemoved = cb => {
    this._ref.on('child_removed', snapshot => {
      this._debug('onChildRemoved', this._ref.key, cb)
      cb(snapshotToValueOrMap(snapshot))
    })

    return () => this._ref.off('child_removed', cb)
  }
}

export default FirebaseListAdapter
