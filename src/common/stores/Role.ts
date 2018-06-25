import { action, computed } from 'mobx'

import { makeDebugger } from '../lib'
import { FirebaseMapAdapter } from '../transport'

const debug = makeDebugger('stores:role')

export class Role extends FirebaseMapAdapter {
  constructor(pathOrRef, initialValue?) {
    super(pathOrRef, initialValue)
    debug('new Role()', pathOrRef, initialValue)
  }

  @computed
  get userIds(): string[] {
    const usersIds = []
    this._map.forEach((val, key) => {
      if (val === true) usersIds.push(key)
    })
    return usersIds
  }

  @action
  addUser = userId => {
    debug('addUser', this.path, userId)
    this._map.set(userId, true)
  }

  @action
  removeUser = userId => {
    debug('removeUser', this.path, userId)
    this._map.delete(userId)
  }

  includesUser = userId => this.userIds.includes(userId)
}

export default Role
