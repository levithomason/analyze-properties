import _ from 'lodash/fp'
import { action, computed, observe, observable, reaction } from 'mobx'
import * as transport from '../lib/index'

export class RoleStore {
  /** Array of individual instance */
  @observable records = []

  /** Array of available roles */
  @observable roleIds = []

  @computed
  get asJSON() {
    return this.records.reduce((acc, next) => {
      _.merge(acc, next.asJSON)
      return acc
    }, {})
  }

  fetch = () => {
    return transport.roles.list().then(roles => {
      _.map(this.add, roles)
      return roles
    })
  }

  // TODO add syncing to handle roles added/removed from the system

  isUserInRole = (userId, roleId) => {
    return this.getRoleById(roleId).includesUser(userId)
  }

  getRoleById = roleId => {
    const role = _.find({ id: roleId }, this.records)

    if (!role) throw new Error(`RoleStore.getRoleById() roleId "${roleId}" not found.`)

    return role
  }

  getRolesForUser = userId => {
    return this.records.filter(record => record.includesUser(userId)).map(({ id }) => id)
  }

  //
  // Actions
  //

  /** Add a record to the store. The record can either be JSON or a model instance. */
  @action
  add = record => {
    // already exists
    if (_.find({ id: record.id }, this.records)) return
    console.log('RoleStore.add', record)

    // ensure it is a Role instance (handles adding from json)
    const recordToAdd = record instanceof Role ? record : new Role(record)

    this.records.push(recordToAdd)
    this.roleIds.push(recordToAdd.id)
  }

  /** Remove a record from the store. */
  @action
  remove = record => {
    console.log('RoleStore.remove', record)
    const index = this.records.findIndex(({ id }) => id === record.id)

    this.records.remove(this.records[index])
    this.roleIds.remove(record.id)
  }

  @action
  addUserToRole = (userId, roleId) => {
    return this.getRoleById(roleId).addUser(userId)
  }

  @action
  removeUserFromRole = (userId, roleId) => {
    return this.getRoleById(roleId).removeUser(userId)
  }
}

export class Role {
  id = null
  /** Whether or not changes should sync to/from the server */
  shouldSync = true
  @observable users = []

  constructor(json) {
    console.log('Role new', json)
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
    console.log('Role.fromJSON', json)

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
    if (this.hasHandlers()) return
    this.shouldSync = true
    console.log('Role.startSyncing', this)

    this.handlers = [
      // from the server
      transport.roles.onChange(this.id, json => {
        if (_.isEqual(this.asJSON, json)) return
        console.log('Role syncing from server', JSON.stringify(json, null, 2))
        this.fromJSON(json)
      }),
    ]
  }

  hasHandlers = () => !_.isEmpty(this.handlers)

  /** Stop syncing model changes to/from the server. */
  stopSyncing = () => {
    this.shouldSync = false
    console.log('Role.stopSyncing', this)

    while (this.hasHandlers()) {
      const handler = this.handlers.pop()
      handler()
    }
  }

  /** Perform some work with sync disabled and restore() sync state when done. */
  withoutSyncing = cb => {
    const wasSyncing = this.hasHandlers()
    if (wasSyncing) this.stopSyncing()

    const restore = () => wasSyncing && this.startSyncing()

    cb(restore)
  }

  includesUser = userId => _.includes(userId, this.users)

  @action
  addUser = userId => {
    console.log('Role.addUser', this.id, userId)
    if (this.includesUser(userId)) return

    this.users.push(userId)

    if (this.shouldSync) {
      transport.roles.update(this.id, { [userId]: true }).catch(err => {
        this.users.remove(userId)
        console.error('Role failed to sync to server, reverting to server copy', err)
        transport.roles.read(this.id).then(this.fromJSON)
      })
    }
  }

  @action
  removeUser = userId => {
    console.log('Role.removeUser', this.id, userId)
    this.users.remove(userId)

    if (this.shouldSync) {
      const update = { [userId]: null }
      transport.roles.update(this.id, update).catch(err => {
        this.users.add(userId)
        console.error('Role failed to sync to server', update, err)
      })
    }
  }
}

const roleStore = new RoleStore()

export default roleStore
