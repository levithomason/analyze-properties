import { computed } from 'mobx'

import { makeDebugger } from '../lib'
import { FirebaseMapAdapter } from '../transport'

const debug = makeDebugger('stores:user')

class User extends FirebaseMapAdapter {
  constructor(path, initialValue?) {
    super(path, initialValue)
    debug('new User()', path, initialValue)
  }

  @computed
  get displayName() {
    return this._map.get('displayName')
  }

  @computed
  get email() {
    return this._map.get('email')
  }

  @computed
  get firstName() {
    return this._map.get('displayName').split(' ')[0]
  }

  @computed
  get phoneNumber() {
    return this._map.get('phoneNumber')
  }

  @computed
  get photoURL() {
    return this._map.get('photoURL')
  }
}

export default User
