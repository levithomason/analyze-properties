import _ from 'lodash/fp'
import { computed, observable, runInAction, toJS } from 'mobx'

import { firebase } from '../modules/firebase'
import { makeDebugger } from '../lib/index'
import { getPath } from './firebaseUtils'

/**
 * Creates a MobX store (observable Map) that mirrors the firebase data at a path or ref.
 * Can push/pull changes to/from the server.
 * Can start/stop syncing to/from the server on change.
 */
class FirebaseMapAdapter {
  @observable isPulling = false
  @observable isPushing = false

  @computed
  get asJS() {
    return toJS(this._map)
  }

  _lastChangeFromServer = { type: null, key: null, value: null }
  _localObserver = null

  constructor(pathOrRef, initialMap) {
    if (!pathOrRef) {
      throw new Error('FirebaseListAdapter requires a `pathOrRef`, got: ' + pathOrRef)
    }

    this._ref = _.isString(pathOrRef) ? firebase.database().ref(pathOrRef) : pathOrRef
    this._debug = makeDebugger(`transport:FirebaseMapAdapter(${this._ref.key})`)
    this.path = getPath(this._ref)
    this.key = this._ref.key
    this._map = observable(new Map(initialMap))
  }

  /** Persist the map to the server. */
  pushOnce = () => {
    if (this.isPushing) return

    return this._ref.set(this.asJS).catch(err => {
      console.error('Failed to pushOnce:', err)
    })
  }

  /** Fetch the map from the server. */
  pullOnce = () => {
    if (this.isPulling) return

    return this._ref
      .once('value')
      .then(snapshot => {
        runInAction(() => {
          this._map.merge(snapshot.toJSON())
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
        this._ref.on('child_changed', this._handleServerChildChanged)

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
    this._ref.off('child_changed', this._handleServerChildChanged)

    runInAction(() => {
      this.isPulling = false
    })
  }

  startPushing = () => {
    if (this.isPushing) return
    this._debug('startPushing')

    return this.pushOnce()
      .then(() => {
        this._localObserver = this._map.observe(_.debounce(300, this._handleLocalChange))
        runInAction(() => {
          this.isPushing = true
        })
      })
      .catch(err => {
        throw new Error('Failed to start syncing to server: ' + err)
      })
  }

  stopPushing = () => {
    if (!this.isPushing) return
    this._debug('stopPushing')

    this._localObserver()

    runInAction(() => {
      this.isPushing = false
    })
  }

  _handleLocalChange = change => {
    const { name, newValue = null, oldValue, type } = change

    // don't reciprocate received changes back to the server
    if (_.isMatch(this._lastChangeFromServer, change)) return

    this._debug('_handleLocalChange', change)

    switch (type) {
      case 'add':
        this._ref
          .child(name)
          .set(newValue)
          .catch(err => {
            console.error(err)
            runInAction('rollback local add', () => {
              this._map.set(name, oldValue)
            })
          })
        break

      case 'update':
        this._ref
          .child(name)
          .set(newValue)
          .catch(err => {
            console.error(err)
            runInAction('rollback local update', () => {
              this._map.set(name, oldValue)
            })
          })
        break

      case 'delete':
        this._ref
          .child(name)
          .remove()
          .catch(err => {
            console.error(err)
            runInAction('rollback local delete', () => {
              this._map.set(name, oldValue)
            })
          })
        break

      default:
        throw new Error(`Unhandled local map change.type "${change.type}"`)
    }
  }

  _handleServerChildAdded = snapshot => {
    const key = snapshot.key
    const json = snapshot.toJSON()

    if (_.isEqual(this._map.get(key), json)) return

    this._debug('_handleServerChildAdded', key, json)

    this._lastChangeFromServer = { type: 'add', name: key, newValue: json }
    runInAction(() => {
      this._map.set(key, json)
    })
  }

  _handleServerChildChanged = snapshot => {
    const key = snapshot.key
    const json = snapshot.toJSON()

    if (_.isEqual(this._map.get(key), json)) return

    this._debug('_handleServerChildChanged', key, json)

    this._lastChangeFromServer = { type: 'update', name: key, newValue: json }
    runInAction(() => {
      this._map.set(key, json)
    })
  }

  _handleServerChildRemoved = snapshot => {
    const key = snapshot.key

    if (!this._map.has(key)) return

    this._debug('_handleServerChildRemoved', key)

    this._lastChangeFromServer = { type: 'delete', name: key }
    runInAction(() => {
      this._map.delete(key)
    })
  }
}

export default FirebaseMapAdapter
