import { compose, createStore } from 'redux'

import { firebaseStoreEnhancer } from './firebase'
import rootReducer from './rootReducer'

const composeEnhancers =
  typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : compose

// ----------------------------------------
// Enhancers
// ----------------------------------------
const createEnhancedStore = composeEnhancers(firebaseStoreEnhancer)(createStore)

// ----------------------------------------
// Store
// ----------------------------------------
const initialState = {}

const store = createEnhancedStore(rootReducer, initialState)

export default store
