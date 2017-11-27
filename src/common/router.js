import createRouter, {
  RouteNode,
  errorCodes,
  transitionPath,
  loggerPlugin,
  constants,
} from 'router5'
import { reaction } from 'mobx'

import browserPlugin from 'router5/plugins/browser'
import listenersPlugin from 'router5/plugins/listeners'
import persistentParamsPlugin from 'router5/plugins/persistentParams'

import { mobxPlugin } from 'mobx-router5'

import { makeDebugger } from './lib'
import { roleStore, routerStore, sessionStore } from './stores'

const debug = makeDebugger('router')

const router = createRouter()

// router5 only consumes name, path, canActivate, and canDeactivate properties.
// We export the config so we can add more properties and access the config directly.
export const routes = [
  {
    name: 'users',
    path: '/users',
    canActivate: router => (toState, fromState, done) => {
      return roleStore
        .isUserInRole(sessionStore.currentUser.id, 'superAdmin')
        .then(isSuperAdmin => {
          debug('canActivate /users', isSuperAdmin)
          return isSuperAdmin
        })
        .catch(err => {
          debug('currentUser !superAdmin, redirect to analyses')
          return Promise.reject({ redirect: { name: 'analyses' } })
        })
    },
  },
  {
    name: 'analyses',
    path: '/analyses',
    canActivate: router => (toState, fromState, done) => {
      const canActivate = sessionStore.isAuthenticated
      debug('canActivate /analyses', canActivate)
      return canActivate
    },
  },
  {
    name: 'settings',
    path: '/settings',
    canActivate: router => (toState, fromState, done) => {
      const canActivate = sessionStore.isAuthenticated
      debug('canActivate /settings', canActivate)
      return canActivate
    },
  },
  {
    name: 'login',
    path: '/login',
    canActivate: router => (toState, fromState, done) => {
      const canActivate = !sessionStore.isAuthenticated
      debug('canActivate /login', canActivate)
      return canActivate || Promise.reject({ redirect: { name: 'analyses' } })
    },
  },
  {
    name: 'validRoles',
    path: '/validRoles',
  },
]

router.add(routes)

router
  .setOption('useTrailingSlash', false) // force no trailing slashes
  .setOption('strictQueryParams', false) // match routes when extra query parameters are present

router
  .usePlugin(listenersPlugin())
  .usePlugin(browserPlugin({ useHash: false }))
  .usePlugin(mobxPlugin(routerStore))
  .start('/login')

export default router
