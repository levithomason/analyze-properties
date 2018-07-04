import { action, computed, observable, runInAction } from 'mobx'

import { makeDebugger } from '../lib'
import { firebase } from '../modules/firebase'

import User from './User'

const debug = makeDebugger('stores:session')

export class SessionStore {
  @observable currentUser: User = null
  @observable errorCode = null
  @observable errorMessage = null

  constructor() {
    firebase.auth().onAuthStateChanged(this._handleUserChange, this._handleAuthError)
  }

  @computed
  get asJS() {
    return {
      currentUser: this.currentUser ? this.currentUser.asJS : null,
      errorCode: this.errorCode,
      errorMessage: this.errorMessage,
    }
  }

  @action
  _handleUserChange = user => {
    debug('_handleUserChanged()', user)

    this.currentUser = user && user.uid ? new User(`/users/${user.uid}`, user) : null
  }

  @action
  _handleAuthError = error => {
    debug('_handleAuthError()', error)
    runInAction(() => {
      this.errorCode = error.code
      this.errorMessage = error.message
    })
  }

  _loginFromChromeExtension = provider => {
    debug('_loginFromChromeExtension', provider)
    return Promise.resolve().then(() => {
      chrome.runtime.sendMessage({ type: `getAuthToken:${provider}` }, response => {
        debug('content response', JSON.stringify(response, null, 2))
        if (response.error) throw new Error(response.error)

        let credential

        switch (provider) {
          case 'google':
            credential = firebase.auth.GoogleAuthProvider.credential(null, response.payload)
            break

          case 'facebook':
            credential = firebase.auth.FacebookAuthProvider.credential(response.payload)
            break

          default:
            break
        }

        return firebase.auth().signInWithCredential(credential)
      })
    })
  }

  _loginFromWeb = provider => {
    debug('_loginFromWeb', provider)
    const ProviderConstructor = {
      facebook: firebase.auth.FacebookAuthProvider,
      google: firebase.auth.GoogleAuthProvider,
    }[provider]

    const providerInstance = new ProviderConstructor()

    return firebase.auth().signInWithPopup(providerInstance)
  }

  login = provider => {
    return process.env.EXTENSION
      ? this._loginFromChromeExtension(provider)
      : this._loginFromWeb(provider)
  }

  logout = () => {
    console.debug('logout()')
    return firebase.auth().signOut()
  }
}

const sessionStore = new SessionStore()

export default sessionStore
