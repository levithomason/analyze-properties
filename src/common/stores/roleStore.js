import { action, computed, reaction } from 'mobx'

import { sessionStore } from './'
import { makeDebugger } from '../lib'
import { FirebaseListAdapter, FirebaseMapAdapter } from '../transport'

const debug = makeDebugger('stores:role')

export class RoleStore extends FirebaseListAdapter {
  /** Map of role keys to map adapters */
  @computed
  get roles() {
    return this._map.keys().reduce((acc, next) => {
      return { ...acc, [next]: this._map.get(next) }
    }, {})
  }

  @computed
  get roleKeys() {
    return this._map.keys()
  }

  constructor() {
    super(Role, '/roles')
    reaction(() => sessionStore.asJS, this.reset)
  }

  isUserInRole = (userId, roleId) => {
    if (!userId || !roleId) return false

    const role = this._map.get(roleId)

    return !!role && role.includesUser(userId)
  }

  //
  // Actions
  //

  addUserToRole = (userId, roleId) => {
    const role = this._map.get(roleId)

    return !!role && role.addUser(userId)
  }

  removeUserFromRole = (userId, roleId) => {
    const role = this._map.get(roleId)

    return !!role && role.removeUser(userId)
  }

  getRolesForUser = userId => {
    return roleStore.roles.filter(role => role.includesUser(userId))
  }
}

export class Role extends FirebaseMapAdapter {
  constructor(pathOrRef, initialMap) {
    super(pathOrRef, initialMap)
    debug('new Role()', pathOrRef, initialMap)
  }

  @action
  addUser = userId => {
    debug('addUser', this.path, userId)
    this._map.set(userId, true)
  }

  includesUser = userId => !!this._map.get(userId)

  @action
  removeUser = userId => {
    debug('removeUser', this.path, userId)
    this._map.remove(userId)
  }
}

const roleStore = new RoleStore()

export default roleStore
