import _ from 'lodash/fp'
import { action, computed, extendObservable, observable, reaction } from 'mobx'
import * as transport from '../lib/index'
import roleStore from './RoleStore'

export class UserStore {
  /** Array of individual instance */
  @observable records = []

  // /** Array of handler disposers to be called when the store is disposed. */
  // handlers = []

  fetch = () => {
    return transport.users.list().then(users => {
      _.map(this.add, users)
      return users
    })
  }

  // /**
  //  * Creates a new record on the client.
  //  * It needs to startSyncing() to persist to the server.
  //  */
  // create = json => {
  //   new User(this, json)
  // }

  /** Add a record to the store. The record can either be JSON or a model instance. */
  @action
  add = record => {
    if (_.find({ id: record.id }, this.records)) return
    console.log('UserStore.add', record)

    const recordToAdd = record instanceof User ? record : new User(this, record)

    const isTom = recordToAdd.email === 'tomthomason1963@gmail.com'
    if (isTom) {
      console.log('SYNC', isTom)
      recordToAdd.startSyncing()
    }

    this.records.push(recordToAdd)
  }

  /** Remove a record from the store. */
  @action
  remove = record => {
    console.log('UserStore.remove', record)
    _.pull({ id: record.id }, this.records)
  }

  @computed
  get asJSON() {
    return _.map(instance => instance.asJSON, this.records)
  }

  // addListeners = () => {
  //   this.handlers = [
  //     transport.users.onChildAdded(this.add),
  //     transport.users.onChildRemoved(this.remove),
  //   ]
  // }
  //
  // removeListeners = () => {
  //   while (this.handlers.length) {
  //     const handler = this.handlers.pop()
  //     handler()
  //   }
  // }
}

export class User {
  /** unique id of this user, immutable. */
  id = null
  @observable avatarUrl = ''
  @observable displayName = ''
  @observable email = ''
  @observable providerData = {}

  /**
   * A reference to the store for this instance
   * @type UserStore
   */
  store = null

  /** Array of handler disposers to be called when the instance is disposed. */
  handlers = []

  constructor(store, json) {
    console.log('User new', json)
    this.fromJSON(json)
    // TODO passing the parent store down and calling its methods is ugly, expose child callbacks instead
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
    }
  }

  /** Update this user with information from the server. */
  @action
  fromJSON = json => {
    console.log('User.fromJSON', json)

    // don't reciprocate changes back to the server
    this.withoutSyncing(restore => {
      this.id = json.id
      this.avatarUrl = json.avatarUrl
      this.displayName = json.displayName
      this.email = json.email
      extendObservable(this, { providerData: json.providerData })

      restore()
    })
  }

  /** Start syncing model changes to/from the server. */
  startSyncing = () => {
    if (this.hasHandlers()) return
    console.log('User.startSyncing', this)

    this.handlers = [
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
          transport.users.update(json.id, json).catch(err => {
            console.error('User failed to sync to server, reverting to server copy', err)
            transport.users.read(this.id).then(this.fromJSON)
          })
        },
      ),
    ]
  }

  /** Stop syncing model changes to/from the server. */
  stopSyncing = () => {
    if (!this.hasHandlers()) return
    console.log('User.stopSyncing', this)

    while (!_.isEmpty(this.handlers)) {
      const handler = this.handlers.pop()
      handler()
    }
  }

  hasHandlers = () => !_.isEmpty(this.handlers)

  /** Perform some work with sync disabled and restore() sync state when done. */
  withoutSyncing = cb => {
    const wasSyncing = this.hasHandlers()
    if (wasSyncing) this.stopSyncing()

    const restore = () => wasSyncing && this.startSyncing()

    cb(restore)
  }

  // save = () => {
  //   if (this.id) {
  //     return console.error('Warning: User.save() can only be called once, ignoring call.')
  //   }
  //
  //   if (this.isSyncing()) {
  //     return console.error('Warning: User.save() ignored while syncing, stopSyncing first.')
  //   }
  //
  //   return transport.users.create(this.asJSON).catch(err => {
  //     console.error(err)
  //     this.store.remove(this.id)
  //   })
  // }
  //
  // delete = () => {
  //   this.withoutSyncing(restore => {
  //     this.store.remove(this.id)
  //
  //     return transport.users.delete(this.id).catch(err => {
  //       console.error(err)
  //       this.store.add(this)
  //       restore()
  //     })
  //   })
  // }

  /**
   * Synchronously check if a user has a role.
   *
   * @param {string} roleId - A role id string (i.e the role name).
   */
  hasRole = roleId => roleStore.isUserInRole(this.id, roleId)
  addRole = roleId => roleStore.addUserToRole(this.id, roleId)
  removeRole = roleId => roleStore.removeUserFromRole(this.id, roleId)

  @computed
  get roles() {
    return roleStore.getRolesForUser(this.id)
  }
}

const userStore = new UserStore()

export default userStore
