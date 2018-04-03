import { action, computed, extendObservable, observable } from 'mobx'

import { makeDebugger } from '../lib'
import { session } from '../resources'

import User from './User'

const debug = makeDebugger('stores:session')

export class SessionStore {
  /** Contains the login error, cleared on successful login/logout. */
  @observable
  error = {
    code: null,
    message: null,
  }

  /** The currently authenticated user id */
  @observable isAuthenticated = false

  /** User record data. */
  @observable currentUser = null

  @computed
  get asJS() {
    return {
      currentUser: this.currentUser ? this.currentUser.asJS : null,
      error: this.error,
      isAuthenticated: this.isAuthenticated,
    }
  }

  constructor() {
    session.onAuthStateChanged(this._handleUserChange, this._handleAuthError)
  }

  @action
  _handleUserChange = user => {
    debug('_handleUserChanged()', user)

    if (user.id) {
      this.isAuthenticated = true
      this.currentUser = new User(`/users/${user.id}`)
      this.currentUser.pullOnce()
    } else {
      this.isAuthenticated = false
      this.currentUser = null
    }
  }

  @action
  _handleAuthError = error => {
    console.error('SessionStore._handleAuthError() error', error)
    extendObservable(this.error, error)
  }

  login = session.login

  logout = session.logout
}

const sessionStore = new SessionStore()

export default sessionStore
