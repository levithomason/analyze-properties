import { action, computed, observable, runInAction } from 'mobx'

import { makeDebugger } from '../lib'
import { session } from '../resources'

import User from './User'

const debug = makeDebugger('stores:session')

export class SessionStore {
  @observable currentUser: User = null
  @observable errorCode = null
  @observable errorMessage = null
  @observable isAuthenticated = false

  constructor() {
    session.onAuthStateChanged(this._handleUserChange, this._handleAuthError)
  }

  @computed
  get asJS() {
    return {
      currentUser: this.currentUser ? this.currentUser.asJS : null,
      errorCode: this.errorCode,
      errorMessage: this.errorMessage,
      isAuthenticated: this.isAuthenticated,
    }
  }

  @action
  _handleUserChange = user => {
    debug('_handleUserChanged()', user)

    if (user.id) {
      this.isAuthenticated = true
      this.currentUser = new User(`/users/${user.id}`, user)
    } else {
      this.isAuthenticated = false
      this.currentUser = null
    }
  }

  @action
  _handleAuthError = error => {
    debug('_handleAuthError()', error)
    runInAction(() => {
      this.errorCode = error.code
      this.errorMessage = error.message
    })
  }

  login = session.login

  logout = session.logout
}

const sessionStore = new SessionStore()

export default sessionStore
