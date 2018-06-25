import * as mobx from 'mobx'

import Role from './Role'
import roleStore from './roleStore'
import routerStore from './routerStore'
import sessionStore from './sessionStore'
import User from './User'
import userStore from './userStore'

mobx.configure({
  enforceActions: true // only allow state changes in an @action
});

export { Role }
export { roleStore }
export { routerStore }
export { sessionStore }
export { User }
export { userStore }

if (process.env.DEV) {
  window.stores = {
    roleStore,
    routerStore,
    sessionStore,
    userStore,
  }
}
