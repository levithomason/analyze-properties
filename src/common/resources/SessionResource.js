import { makeDebugger } from '../lib'
import { authUserToModel } from './firebaseUtils'
import { firebase } from '../modules/firebase'

const debug = makeDebugger('resources:session')

class SessionResource {
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

  onAuthStateChanged = (userHandler, errorHandler) => {
    firebase.auth().onAuthStateChanged(user => userHandler(authUserToModel(user)), errorHandler)
  }

  login = provider => {
    const promise = __EXTENSION__
      ? this._loginFromChromeExtension(provider)
      : this._loginFromWeb(provider)

    return promise.then(authUserToModel)
  }

  logout = () => {
    console.debug('logout()')
    return firebase.auth().signOut()
  }
}

export default SessionResource
