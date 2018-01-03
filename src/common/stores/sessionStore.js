import { action, computed, extendObservable, observable } from 'mobx'

import { makeDebugger } from '../lib'
import { session } from '../resources'

// TODO TODO TODO TODO TODO TODO TODO TODO TODO
// TODO TODO TODO TODO TODO TODO TODO TODO TODO
//
// This is a circular import.  Session should be base store, importing no other stores.
// Other stores should react to session store changes.
// Probably need to abstract a currentUserStore.
//
// TODO TODO TODO TODO TODO TODO TODO TODO TODO
// TODO TODO TODO TODO TODO TODO TODO TODO TODO
import { userStore, User } from './'

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
  @observable currentUser = new User()

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
      // create a new user
      // ensure it is in the store
      // set currentUser to a reference to the user in the store
      userStore.add(user)
      this.currentUser = userStore.getById(user.id)
      this.isAuthenticated = true
    } else {
      this.currentUser = new User()
      this.isAuthenticated = false
      userStore.remove(this.currentUser.id)
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
