import _ from 'lodash/fp'
import { action, computed, observable, runInAction } from 'mobx'

import { makeDebugger } from '../lib'
import { roles } from '../resources'

const debug = makeDebugger('stores:role')

export class RoleStore {
  /** Array of individual instance */
  @observable models = []

  /** Array of available roles */
  @observable roleIds = []

  @computed
  get asJSON() {
    return this.models.map(model => model.asJSON)
  }

  fetch = () => {
    debug('fetch')
    return roles.list().then(roles => {
      _.forEach(this.add, roles)
      return roles
    })
  }

  // TODO add syncing to handle roles added/removed from the system

  isUserInRole = (userId, roleId) => {
    if (!userId || !roleId) return false

    return this.getRoleById(roleId).then(role => role.includesUser(userId))
  }

  @action
  getRoleById = roleId => {
    return Promise.resolve().then(() => {
      return roles.read(roleId).then(role => {
        if (!role) {
          throw new Error(`RoleStore.getRoleById() roleId "${roleId}" does not exist.`)
        }

        runInAction(() => {
          this.remove(roleId)
          this.add(role)
        })

        return this.ensureModel(role)
      })
    })
  }

  //
  // Actions
  //

  ensureModel = role => (role instanceof Role ? role : new Role(role))

  /** Add a model to the store. The model can either be JSON or a model instance. */
  @action
  add = role => {
    if (_.find({ id: role.id }, this.models)) {
      return
    }

    debug('add', role)

    const model = this.ensureModel(role)

    this.models.push(model)
    this.roleIds.push(model.id)
  }

  /** Remove a model from the store. */
  @action
  remove = roleId => {
    debug('remove', roleId)
    const model = _.find({ id: roleId }, this.models)

    if (!model) return

    model.stopSyncing()
    this.models.remove(model)
    this.roleIds.remove(model.id)
  }

  @action
  addUserToRole = (userId, roleId) => {
    return this.getRoleById(roleId).then(role => role.addUser(userId))
  }

  @action
  removeUserFromRole = (userId, roleId) => {
    return this.getRoleById(roleId).then(role => role.removeUser(userId))
  }

  @computed
  get byId() {
    return this.models.reduce((acc, next) => ({ ...acc, [next.id]: next }), {})
  }
}

export class Role {
  /** Immutable id from the server. */
  id = null

  /** Array of handler disposers to be called when the store is disposed. */
  disposers = []

  /** Whether or not changes should sync to/from the server. */
  isSyncEnabled = true

  /** List of userIds in this role */
  @observable users = []

  constructor(json) {
    debug('new Role()', json)
    this.fromJSON(json)
  }

  @computed
  get asJSON() {
    const json = { id: this.id }

    this.users.forEach(user => (json[user] = true))

    return json
  }

  /** Update this role with information from the server. */
  @action
  fromJSON = json => {
    debug('fromJSON', json)

    const { id, ...userIdsMap } = json

    // don't reciprocate changes back to the server
    this.withoutSyncing(restore => {
      this.id = id
      this.users = _.keys(userIdsMap)

      restore()
    })
  }

  /** Start syncing model changes to/from the server. */
  startSyncing = () => {
    if (this.isSyncEnabled) return
    this.isSyncEnabled = true
    debug('startSyncing', this)

    this.disposers = [
      // from the server
      roles.onChange(this.id, json => {
        if (_.isEqual(this.asJSON, json)) return
        debug('Role syncing from server', JSON.stringify(json, null, 2))
        this.fromJSON(json)
      }),
    ]
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

  includesUser = userId => _.includes(userId, this.users)

  @action
  addUser = userId => {
    debug('addUser', this.id, userId)
    if (this.includesUser(userId)) return

    this.users.push(userId)

    if (!this.isSyncEnabled) return

    roles.update(this.id, { [userId]: true }).catch(err => {
      runInAction(() => {
        console.error('Role failed to sync to server, reverting to server copy', err)
        roles.read(this.id).then(this.fromJSON)
      })
    })
  }

  @action
  removeUser = userId => {
    debug('removeUser', this.id, userId)
    this.users.remove(userId)

    if (!this.isSyncEnabled) return

    roles.update(this.id, { [userId]: null }).catch(err => {
      runInAction(() => {
        console.error('Role failed to sync to server, reverting to server copy', err)
        roles.read(this.id).then(this.fromJSON)
      })
    })
  }
}

const roleStore = new RoleStore()

export default roleStore
