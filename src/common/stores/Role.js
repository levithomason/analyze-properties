import { action } from 'mobx'

import { makeDebugger } from '../lib'
import { FirebaseMapAdapter } from '../transport'

const debug = makeDebugger('stores:role')

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

export default Role
