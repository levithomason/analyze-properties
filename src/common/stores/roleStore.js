import { computed } from 'mobx'

import Role from './Role'
import { session } from '../resources'
import { FirebaseListAdapter } from '../transport'
import { makeDebugger } from '../lib'

const debug = makeDebugger('stores:roles')

export class RoleStore extends FirebaseListAdapter {
  constructor() {
    super(Role, '/roles')
    session.onAuthStateChanged(this.reset, this.reset)
  }

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

  isUserInRole = (userId, roleId) => {
    debug('RoleStore.isUserInRole(userId, roleId)', userId, roleId)
    if (!userId || !roleId) return false

    const role = this._map.get(roleId)

    return !!role && role.includesUser(userId)
  }

  //
  // Actions
  //

  addUserToRole = (userId, roleId) => {
    debug('RoleStore.addUserToRole(userId, roleId)', userId, roleId)
    const role = this._map.get(roleId)

    return !!role && role.addUser(userId)
  }

  removeUserFromRole = (userId, roleId) => {
    debug('RoleStore.removeUserFromRole(userId, roleId)', userId, roleId)
    const role = this._map.get(roleId)

    return !!role && role.removeUser(userId)
  }

  getRolesForUser = userId => {
    debug('RoleStore.getRolesForUser(userId)', userId)
    return roleStore.roles.filter(role => role.includesUser(userId))
  }
}

const roleStore = new RoleStore()

export default roleStore
