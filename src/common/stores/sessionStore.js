import { action, computed, extendObservable, observable } from 'mobx'

import { makeDebugger } from '../lib'
import { session } from '../resources'
import { authUserToModel } from '../resources/firebaseUtils'

import roleStore from './roleStore'
import userStore, { User } from './userStore'

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
      userStore.fetch()
      roleStore.fetch()
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

  @computed
  get asJSON() {
    return {
      currentUser: this.currentUser ? this.currentUser.asJSON : null,
      error: this.error,
      isAuthenticated: this.isAuthenticated,
    }
  }
}

const sessionStore = new SessionStore()

export default sessionStore
