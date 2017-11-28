import _ from 'lodash/fp'
import { action, computed, extendObservable, observable, reaction } from 'mobx'

import { makeDebugger } from '../lib'
import * as resources from '../resources'
import roleStore from './roleStore'

const debug = makeDebugger('stores:user')

export class UserStore {
  /** Array of individual instance */
  @observable models = []

  /** Array of handler disposers to be called when the store is disposed. */
  disposers = []

  fetch = () => {
    debug('fetch')
    return resources.users.list().then(users => {
      _.map(this.add, users)
      return users
    })
  }

  /** Add a user to the store. */
  @action
  add = user => {
    debug('add', user)
    if (this.includes(user.id)) return

    const model = user instanceof User ? user : new User(user)

    this.models.push(model)
  }

  /** Remove a user from the store. */
  @action
  remove = userId => {
    debug('remove', userId)
    const model = _.find({ id: userId }, this.models)

    if (!model) return

    model.stopSyncing()
    _.pull(model, this.models)
  }

  includes = userId => _.some({ id: userId }, this.models)

  @computed
  get asJSON() {
    return _.map(instance => instance.asJSON, this.models)
  }

  // startSyncing = () => {
  //   // enable sync on all child models
  //   this.models.forEach(model => model.startSyncing())
  //
  //   this.disposers = [
  //     resources.users.onChildAdded(this.add),
  //     resources.users.onChildRemoved(this.remove),
  //   ]
  // }

  // stopSyncing = () => {
  //   // disable sync on all child models
  //   this.models.forEach(model => model.stopSyncing())
  //
  //   while (this.disposers.length) {
  //     const handler = this.disposers.pop()
  //     handler()
  //   }
  // }

  getById = id => _.find({ id }, this.models) || null
}

export class User {
  /** unique id of this user, immutable. */
  id = null

  /** Whether or not changes should sync to/from the server. */
  isSyncEnabled = false

  /** Array of handler disposers to be called when the instance is disposed. */
  disposers = []

  /** User record data/ */
  @observable displayName = null
  @observable email = null
  @observable phoneNumber = null
  @observable photoURL = null

  constructor(json) {
    debug('new User()', json)
    this.fromJSON(json)
  }

  resolve = () => {
    // .................................
    roleStore.fetch().then(() => {
      roleStore.roleIds.forEach(role => {})
    })
  }

  @computed
  get asJSON() {
    return {
      id: this.id,
      displayName: this.displayName,
      email: this.email,
      photoURL: this.photoURL,
      roles: this.roles,
    }
  }

  /** Update this user with information from the server. */
  @action
  fromJSON = (json = {}) => {
    debug('fromJSON', json)

    // don't reciprocate changes back to the server
    this.withoutSyncing(restore => {
      this.id = json.id
      this.displayName = json.displayName
      this.email = json.email
      this.photoURL = json.photoURL
      extendObservable(this.roles, Object.assign({}, json.data))

      restore()
    })
  }

  /**
   * Start syncing model changes to/from the server.
   * Create first if not saved to server yet.
   */
  startSyncing = () => {
    if (this.isSyncEnabled) return
    this.isSyncEnabled = true
    debug('startSyncing', this)

    return Promise.resolve
      .then(() => {
        // We need an id in order to listen for changes from the server
        // Save before syncing, if necessary
        return this.id ? this : resources.users.create(this)
      })
      .then(createdUser => {
        extendObservable(this, createdUser)
        return this
      })
      .then(() => {
        this.disposers = [
          // from the server
          resources.users.onChange(this.id, json => {
            if (_.isEqual(this.asJSON, json)) return
            debug('sync FROM server', JSON.stringify(json, null, 2))
            this.fromJSON(json)
          }),

          resources.roles.onChange(`approved/${this.id}`, isApproved => {
            const json = this.asJSON
            if (json.data.isApproved === isApproved) return
            debug('superAdmin sync FROM server', isApproved)
            this.fromJSON({ ...json, roles: { ...json.data, approved: isApproved } })
          }),

          resources.roles.onChange(`superAdmin/${this.id}`, isSuperAdmin => {
            const json = this.asJSON
            if (json.data.isSuperAdmin === isSuperAdmin) return
            debug('superAdmin sync FROM server', isSuperAdmin)
            this.fromJSON({ ...json, roles: { ...json.data, superAdmin: isSuperAdmin } })
          }),

          // to the server
          reaction(
            () => this.asJSON,
            json => {
              debug('sync TO server', JSON.stringify(json, null, 2))
              resources.users.update(json.id, json).catch(err => {
                console.error('User failed to sync to server, reverting to server copy', err)
                resources.users.read(this.id).then(this.fromJSON)
              })
            },
          ),
        ]
      })
  }

  /** Stop syncing model changes to/from the server. */
  stopSyncing = () => {
    if (!this.isSyncEnabled) return
    this.isSyncEnabled = false
    debug('stopSyncing', this)

    while (this.disposers.length) {
      const handler = this.disposers.pop()
      handler()
    }
  }

  /** Perform some work with sync disabled and restore() sync state when done. */
  withoutSyncing = cb => {
    const wasSyncEnabled = this.isSyncEnabled

    this.stopSyncing()

    const restore = () => wasSyncEnabled && this.startSyncing()

    cb(restore)
  }

  /**
   * Synchronously check if a user has a role.
   *
   * @param {string} roleId - A role id string (i.e the role name).
   */
  addToRole = roleId => roleStore.addUserToRole(this.id, roleId)
  removeFromRole = roleId => roleStore.removeUserFromRole(this.id, roleId)

  @computed
  get roles() {
    return roleStore.models
      .filter(role => role.includesUser(this.id))
      .reduce((acc, next) => ({ ...acc, [next.id]: true }), {})
  }
}

const userStore = new UserStore()

export default userStore
