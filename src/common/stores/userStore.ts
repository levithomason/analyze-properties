import { computed, reaction } from 'mobx'

import User from './User'
import sessionStore from './sessionStore'
import { FirebaseListAdapter } from '../transport'

export class UserStore extends FirebaseListAdapter {
  constructor() {
    super(User, '/users')
    reaction(() => sessionStore.asJS, this.reset)
  }

  @computed
  get users() {
    return Array.from(this._map.values())
  }

  @computed
  get userIds() {
    return Array.from(this._map.keys())
  }

  getById = id => this._map.get(id) || null
}

const userStore = new UserStore()

export default userStore
