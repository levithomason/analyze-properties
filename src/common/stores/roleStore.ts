import { computed } from 'mobx'

import Role from './Role'
import { FirebaseListAdapter } from '../transport'
import { makeDebugger } from '../lib'
import { firebase } from "../modules/firebase"

const debug = makeDebugger('stores:roles')

export class RoleStore extends FirebaseListAdapter {
  constructor() {
    super(Role, '/roles')
    firebase.auth().onAuthStateChanged(this.reset, this.reset)
  }

  @computed
  get roles(): Role[] {
    return Array.from(this._map.values())
  }

  @computed
  get rolesById(): { [key: string]: Role } {
    const roles = {}
    this._map.forEach((val, key) => {
      roles[key] = val
    })
    return roles
  }

  @computed
  get roleKeys(): string[] {
    return Array.from(this._map.keys())
  }

  isUserInRole = (userId, roleId): boolean => {
    debug('RoleStore.isUserInRole(userId, roleId)', userId, roleId)
    if (!userId || !roleId) return false

    const role = this.rolesById[roleId]

    return !!role && role.includesUser(userId)
  }

  //
  // Actions
  //

  addUserToRole = (userId, roleId) => {
    debug('RoleStore.addUserToRole(userId, roleId)', userId, roleId)
    const role = this.rolesById[roleId]

    return !!role && role.addUser(userId)
  }

  removeUserFromRole = (userId, roleId) => {
    debug('RoleStore.removeUserFromRole(userId, roleId)', userId, roleId)
    const role = this.rolesById[roleId]

    return !!role && role.removeUser(userId)
  }

  getRolesForUser = userId => {
    debug('RoleStore.getRolesForUser(userId)', userId)
    return roleStore.roles.filter(role => role.includesUser(userId))
  }
}

const roleStore = new RoleStore()

export default roleStore
