import { computed } from 'mobx'

import { makeDebugger } from '../lib'
import { FirebaseMapAdapter } from '../transport'

const debug = makeDebugger('stores:user')

class User extends FirebaseMapAdapter {
  constructor(pathOrRef, initialValue?) {
    super(pathOrRef, initialValue)
    debug('new User()', pathOrRef, initialValue)
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
  get phoneNumber() {
    return this._map.get('phoneNumber')
  }

  @computed
  get photoURL() {
    return this._map.get('photoURL')
  }
}

export default User
