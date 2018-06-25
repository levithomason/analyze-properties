import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import { firebaseStateReducer, reactReduxFirebase } from 'react-redux-firebase'

// ----------------------------------------
// Firebase App
// ----------------------------------------
export const firebaseConfig = {
  apiKey: 'AIzaSyDEN3fhLStbvi9u0dno0q9W6Idpv9wpMFE',
  databaseURL: 'https://analyze-properties.firebaseio.com',
  storageBucket: 'analyze-properties.appspot.com',
  authDomain: 'analyze-properties.firebaseapp.com',
  messagingSenderId: '739162247121',
  projectId: 'analyze-properties',
}

firebase.initializeApp(firebaseConfig)

if (process.env.EXTENSION) {
  chrome.runtime.sendMessage({ type: 'firebase:initialize', payload: firebaseConfig })
}

export { firebase }

// ----------------------------------------
// Store Enhancer
// ----------------------------------------
export const reactReduxFirebaseConfig = {
  userProfile: 'users', // where profiles are stored in firebase
  // presence: 'presence', // where list of online users is stored in firebase
  // sessions: 'sessions', // where list of user sessions is stored in firebase (requires presence)
  enableLogging: false, // enable/disable Firebase's database logging
}

export const firebaseStoreEnhancer = reactReduxFirebase(firebase, reactReduxFirebaseConfig)

// ----------------------------------------
// Reducer
// ----------------------------------------
// Just uses the default reducer for now
export default firebaseStateReducer
