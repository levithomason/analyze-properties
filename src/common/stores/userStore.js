import { computed, reaction } from 'mobx'

import User from './User'
import sessionStore from './sessionStore'
import { FirebaseListAdapter } from '../transport'

export class UserStore extends FirebaseListAdapter {
  @computed
  get users() {
    return this._map.values()
  }

  @computed
  get userIds() {
    return this._map.keys()
  }

  constructor() {
    super(User, '/roles')
    reaction(() => sessionStore.asJS, this.reset)
  }

  getById = id => this._map.get(id) || null
}

const userStore = new UserStore()

export default userStore
