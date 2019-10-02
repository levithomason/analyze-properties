import createRouter from 'router5'

import browserPlugin from 'router5/plugins/browser'
import listenersPlugin from 'router5/plugins/listeners'
import persistentParamsPlugin from 'router5/plugins/persistentParams'

import { mobxPlugin } from 'mobx-router5'

import { makeDebugger } from './lib'
import { roleStore, routerStore, sessionStore } from './stores'

const debug = makeDebugger('router')

// router5 only consumes name, path, canActivate, and canDeactivate properties.
// We export the config so we can add more properties and access the config directly.
export const routes = [
  {
    name: 'calculator',
    path: '/',
  },
  {
    name: 'users',
    path: '/users',
    canActivate: router => (toState, fromState, done) => {
      const isSuperAdmin = roleStore.isUserInRole(sessionStore.currentUser.key, 'superAdmin')

      debug('canActivate /users', isSuperAdmin)
      return isSuperAdmin || Promise.reject({ redirect: { name: 'analyses' } })
    },
  },
  {
    name: 'analyses',
    path: '/analyses',
    canActivate: router => (toState, fromState, done) => {
      const canActivate = !!sessionStore.currentUser
      debug('canActivate /analyses', canActivate)
      return canActivate
    },
  },
  {
    name: 'settings',
    path: '/settings',
    canActivate: router => (toState, fromState, done) => {
      const canActivate = !!sessionStore.currentUser
      debug('canActivate /settings', canActivate)
      return canActivate
    },
  },
  {
    name: 'login',
    path: '/login',
    canActivate: router => (toState, fromState, done) => {
      const canActivate = !sessionStore.currentUser
      debug('canActivate /login', canActivate)
      return canActivate || Promise.reject({ redirect: { name: 'analyses' } })
    },
  },
  {
    name: 'validRoles',
    path: '/validRoles',
  },
]

const router = createRouter(routes)

router
  .setOption('useTrailingSlash', false) // force no trailing slashes
  .setOption('strictQueryParams', false) // match routes when extra query parameters are present

router
  .usePlugin(listenersPlugin())
  .usePlugin(browserPlugin({ useHash: false }))
  .usePlugin(mobxPlugin(routerStore))
  .start('/')

export default router
