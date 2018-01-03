import * as mobx from 'mobx'

import roleStore from './roleStore'
import routerStore from './routerStore'
import sessionStore from './sessionStore'
import User from './User'
import userStore from './userStore'

// only allow state changes in an @action
mobx.useStrict(true)

export { roleStore }
export { routerStore }
export { sessionStore }
export { User }
export { userStore }

if (__DEV__) {
  window.stores = {
    roleStore,
    routerStore,
    sessionStore,
    userStore,
  }
}
