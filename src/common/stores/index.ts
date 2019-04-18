import * as mobx from 'mobx'

import Analysis from './Analysis'
import analysesStore from './analysesStore'
import Role from './Role'
import roleStore from './roleStore'
import routerStore from './routerStore'
import sessionStore from './sessionStore'
import User from './User'
import userStore from './userStore'

mobx.configure({
  enforceActions: 'always', // only allow state changes in an @action
})

export { Analysis }
export { analysesStore }
export { Role }
export { roleStore }
export { routerStore }
export { sessionStore }
export { User }
export { userStore }

if (process.env.NODE_ENV !== 'production') {
  ;(window as any).stores = {
    analysesStore,
    roleStore,
    routerStore,
    sessionStore,
    userStore,
  }
}
