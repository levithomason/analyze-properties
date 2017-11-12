import { combineReducers } from 'redux'
import firebaseStateReducer from './firebase'
import { router5Reducer } from 'redux-router5'

const rootReducer = combineReducers({
  firebase: firebaseStateReducer,
  router: router5Reducer,
})

export default rootReducer
