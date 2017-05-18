import { combineReducers } from 'redux'
import firebaseStateReducer from './firebase'

const rootReducer = combineReducers({
  firebase: firebaseStateReducer,
})

export default rootReducer
