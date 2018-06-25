import _ from 'lodash/fp'
import { action, computed, observable, ObservableMap, runInAction, toJS } from 'mobx'

import { firebase } from '../modules/firebase'
import { makeDebugger } from '../lib'
import FirebaseMapAdapter from './FirebaseMapAdapter'
import { getPath } from './firebaseUtils'

/**
 * Creates a MobX store (observable Map) that mirrors the firebase data at a path or ref.
 * Can push/pull changes to/from the server.
 * Can start/stop syncing to/from the server on change.
 */
class FirebaseListAdapter {
  childClassName: string
  protected key: string
  protected path: string
  private readonly _debug: Function
  private readonly _ref: firebase.database.Reference
  ItemAdapter: FirebaseMapAdapter

  @observable isPulling = false
  @observable isPushing = false
  @observable protected readonly _map = new Map()

  constructor(ItemAdapter = FirebaseMapAdapter, pathOrRef) {
    this.childClassName = this.constructor.name
    this._debug = makeDebugger(`transport:FirebaseListAdapter:(${this.childClassName})`)

    this._ref = typeof pathOrRef === 'string' ? firebase.database().ref(pathOrRef) : pathOrRef
    this.key = this._ref.key
    this.path = getPath(this._ref)

    this.ItemAdapter = ItemAdapter
  }

  @computed
  get asJS() {
    return toJS(this._map)
  }

  @action
  addItem = (key, value) => {
    this._debug('addItem', key, value)
    const itemAdapter = new this.ItemAdapter(`${this.path}/${key}`, value)

    this._map.set(key, itemAdapter)
  }

  @action
  removeItem = (key) => {
    this._debug('removeItem')
    this._map.delete(key)
  }

  /** Fetch the list from the server and replace item adapters for each child. */
  reset = () => {
    this._debug('reset')

    return this._ref
      .once('value')
      .then(snapshot => {
        runInAction(() => {
          const json = snapshot.toJSON()
          const keys = Object.keys(json)

          this._map.clear()

          keys.forEach(key => {
            this.addItem(key, json[key])
          })
        })
      })
      .catch(err => {
        console.error(this.childClassName, 'Failed to sync:', err)
      })
  }

  /** Fetch the list from the server and create/update item adapters for each child. */
  pullOnce = () => {
    if (this.isPulling) return
    this._debug('pullOnce')

    return this._ref
      .once('value')
      .then(snapshot => {
        runInAction(() => {
          const json = snapshot.toJSON()

          Object.keys(json).forEach(key => {
            const value = json[key]
            const itemAdapter = this._map.get(key)

            if (itemAdapter) {
              itemAdapter._map.merge(value)
            } else {
              this.addItem(key, value)
            }
          })
        })
      })
      .catch(err => {
        console.error('Failed to pullOnce:', err)
      })
  }

  startPulling = () => {
    if (this.isPulling) return
    this._debug('startPulling')

    return this.pullOnce()
      .then(() => {
        this._ref.on('child_added', this._handleServerChildAdded)
        this._ref.on('child_removed', this._handleServerChildRemoved)

        runInAction(() => {
          this.isPulling = true
        })
      })
      .catch(err => {
        throw new Error('Failed to start syncing from server: ' + err)
      })
  }

  stopPulling = () => {
    if (!this.isPulling) return
    this._debug('stopPulling')

    this._ref.off('child_added', this._handleServerChildAdded)
    this._ref.off('child_removed', this._handleServerChildRemoved)

    runInAction(() => {
      this.isPulling = false
    })
  }

  _handleServerChildAdded = snapshot => {
    const key = snapshot.key
    const json = snapshot.toJSON()

    const itemAdapter = this._map.get(key)

    if (_.isEqual(itemAdapter.asJS, json)) return

    this._debug('_handleServerChildAdded', key, json)

    this.addItem(key, json)
  }

  _handleServerChildRemoved = snapshot => {
    const key = snapshot.key

    if (!this._map.has(key)) return

    this._debug('_handleServerChildRemoved', key)

    this.removeItem(key)
  }
}

export default FirebaseListAdapter
