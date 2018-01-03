import { computed } from 'mobx'

import { roleStore } from './'
import { makeDebugger } from '../lib'
import { FirebaseMapAdapter } from '../transport'

const debug = makeDebugger('stores:user')

class User extends FirebaseMapAdapter {
  /** User record data/ */
  @computed
  get displayName() {
    return this._map.get('displayName')
  }
  @computed
  get email() {
    return this._map.get('email')
  }
  @computed
  get phoneNumber() {
    return this._map.get('phoneNumber')
  }
  @computed
  get photoURL() {
    return this._map.get('photoURL')
  }

  constructor(pathOrRef, initialMap) {
    super(pathOrRef, initialMap)
    debug('new User()', pathOrRef, initialMap)
  }

  hasRole = roleId => roleStore.isUserInRole(this.key, roleId)
  addRole = roleId => roleStore.addUserToRole(this.key, roleId)
  removeRole = roleId => roleStore.removeUserFromRole(this.key, roleId)

  /** A map of roles: { approved: true } */
  @computed
  get roles() {
    return roleStore
      .getRolesForUser(this.key)
      .reduce((acc, next) => ({ ...acc, [next.key]: true }), {})
  }
}

export default User
