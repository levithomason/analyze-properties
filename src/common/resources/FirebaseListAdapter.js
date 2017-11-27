import { makeDebugger } from '../lib'
import { firebase } from '../modules/firebase'
import { snapshotToValueOrModel } from './firebaseUtils'

const debug = makeDebugger('resources:FirebaseListAdapter')

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
  }

  // ----------------------------------------
  // Requests
  // ----------------------------------------

  /**
   * Create a new firebase child from JSON.
   * Resolves with the child from the server as a model.
   */
  create = json => {
    debug('create', this._ref.key, json)
    const { id, ...data } = json

    if (id) {
      console.error(
        'Warning: FirebaseListAdapter.create() disregarding `id`, one will be assigned.',
        json,
      )
    }

    return this._ref.push(data).then(ref => ref.once('value').then(snapshotToValueOrModel))
  }

  /** Fetch a single child as a model. */
  read = id => {
    debug('read', this._ref.key, id)
    return this._ref
      .child(id)
      .once('value')
      .then(snapshotToValueOrModel)
  }

  /** Update the child model by `id`. */
  update = (id, model) => {
    debug('update', this._ref.key, model)
    // ensure we don't persist an id in the model
    // we are keying by id on firebase
    const update = { ...model, id: null }

    return this._ref
      .child(id)
      .update(update)
      .then(snapshotToValueOrModel)
  }

  /** Delete a child by `id`. */
  delete = id => {
    debug('delete', this._ref.key, id)
    return this._ref.child(id).remove()
  }

  /** Get all children as an array of records. */
  list = () => {
    debug('list', this._ref.key)
    return this._ref.once('value').then(snapshot => {
      if (!snapshot) return snapshot

      const records = []

      // https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot#forEach
      snapshot.forEach(childSnapshot => {
        records.push(snapshotToValueOrModel(childSnapshot))
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
      debug('onChange', this._ref.key, id)
      cb(snapshotToValueOrModel(snapshot))
    })

    return () => ref.off('value', cb)
  }

  /** Listen for the addition of a child model. */
  onChildAdded = cb => {
    this._ref.on('child_added', snapshot => {
      debug('onChildAdded', this._ref.key, cb)
      cb(snapshotToValueOrModel(snapshot))
    })

    return () => this._ref.off('child_added', cb)
  }

  /** Listen for updates to child records. */
  onChildChanged = cb => {
    this._ref.on('child_changed', snapshot => {
      debug('onChildChanged', this._ref.key, cb)
      cb(snapshotToValueOrModel(snapshot))
    })

    return () => this._ref.off('child_changed', cb)
  }

  /** Listen for the removal of a child model. */
  onChildRemoved = cb => {
    this._ref.on('child_removed', snapshot => {
      debug('onChildRemoved', this._ref.key, cb)
      cb(snapshotToValueOrModel(snapshot))
    })

    return () => this._ref.off('child_removed', cb)
  }
}

export default FirebaseListAdapter
