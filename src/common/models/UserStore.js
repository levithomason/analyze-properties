import _ from 'lodash/fp'
import { action, computed, extendObservable, observable, reaction } from 'mobx'
import * as transport from '../../common/lib'

export class UserStore {
  /** Array of individual instance */
  @observable records = []

  /** Array of listener disposers to be called when the store is disposed. */
  listeners = []

  constructor() {
    transport.users.list().then(_.map(this.add))
  }

  /**
   * Creates a new record on the client.
   * It needs to startSyncing() to persist to the server.
   */
  create = json => {
    new User(this, json)
  }

  /** Add a record to the store. The record can either be JSON or a model instance. */
  add = record => {
    if (_.find({ id: record.id }, this.records)) return
    console.log('UserStore.add', record)

    const recordToAdd = record.asJSON ? record : new User(this, record)

    this.records.push(recordToAdd)
  }

  /** Remove a record from the store. */
  remove = record => {
    const index = _.findIndex({ id: record.id }, this.records)
    console.log('UserStore.remove', record)

    if (index === -1) return

    this.records.splice(index, 1)
  }

  @computed
  get asJSON() {
    return _.map(instance => instance.asJSON, this.records)
  }

  addListeners = () => {
    this.listeners = [
      transport.users.onChildAdded(this.add),
      transport.users.onChildRemoved(this.remove),
    ]
  }

  removeListeners = () => {
    while (this.listeners.length) {
      const listener = this.listeners.pop()
      listener()
    }
  }
}

export class User {
  /** unique id of this user, immutable. */
  id = null
  @observable avatarUrl = ''
  @observable displayName = ''
  @observable email = ''
  @observable roles = {}
  @observable providerData = {}

  /**
   * A reference to the store for this instance
   * @type UserStore
   */
  store = null

  /** Array of listener disposers to be called when the instance is disposed. */
  syncHandlers = []

  constructor(store, json) {
    console.log('User new', json)
    this.fromJSON(json)
    this.store = store
  }

  @computed
  get asJSON() {
    return {
      id: this.id,
      avatarUrl: this.avatarUrl,
      displayName: this.displayName,
      email: this.email,
      providerData: this.providerData,
      roles: this.roles,
    }
  }

  /** Update this user with information from the server. */
  fromJSON = json => {
    console.log('User.fromJSON', json)

    // don't reciprocate changes back to the server
    this.withoutSyncing(restore => {
      this.id = json.id
      this.avatarUrl = json.avatarUrl
      this.displayName = json.displayName
      this.email = json.email
      extendObservable(this, { providerData: json.providerData })
      this.setRoles(json.roles)

      restore()
    })
  }

  @action
  setRole = (role, value = false) => {
    extendObservable(this, { roles: { [role]: value } })
  }

  @action
  setRoles = (roles = {}) => {
    console.log('setRoles', roles)

    // remove existing roles
    const newRoles = _.mapValues(val => false, this.roles)

    // add incoming roles, handle arrays and objects
    Array.isArray(roles)
      ? roles.forEach(role => (newRoles[role] = true))
      : _.assign(newRoles, roles)

    extendObservable(this, { roles: newRoles })
  }

  /** Start syncing model changes to/from the server. */
  startSyncing = () => {
    if (this.isSyncing()) return
    console.log('User.startSyncing', this)

    this.syncHandlers = [
      // from the server
      transport.users.onChange(this.id, json => {
        if (_.isEqual(this.asJSON, json)) return
        console.log('User syncing from server', JSON.stringify(json, null, 2))
        this.fromJSON(json)
      }),

      // to the server
      reaction(
        () => this.asJSON,
        json => {
          console.log('User syncing to server:', JSON.stringify(json, null, 2))
          transport.users.update(json).catch(err => {
            console.error('User failed to sync to server, reverting', err)
            transport.users.read(this.id).then(this.fromJSON)
          })
        },
      ),
    ]
  }

  /** Stop syncing model changes to/from the server. */
  stopSyncing = () => {
    if (!this.isSyncing()) return
    console.log('User.stopSyncing', this)

    while (this.syncHandlers.length) {
      const listener = this.syncHandlers.pop()
      listener()
    }
  }

  isSyncing = () => !_.isEmpty(this.syncHandlers)

  /** Perform some work with sync disabled and restore() sync state when done. */
  withoutSyncing = cb => {
    const wasSyncing = this.isSyncing()
    if (wasSyncing) this.stopSyncing()

    const restore = () => wasSyncing && this.startSyncing()

    cb(restore)
  }

  save = () => {
    if (this.id) {
      return console.error('Warning: User.save() can only be called once, ignoring call.')
    }

    if (this.isSyncing()) {
      return console.error('Warning: User.save() ignored while syncing, stopSyncing first.')
    }

    transport.users.create(this.asJSON).catch(err => {
      console.error(err)
      this.store.remove(this.id)
    })
  }

  delete = () => {
    this.withoutSyncing(restore => {
      this.store.remove(this.id)

      transport.users.delete(this.id).catch(err => {
        console.error(err)
        this.store.add(this)
        restore()
      })
    })
  }
}

export default new UserStore()
