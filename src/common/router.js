import createRouter, {
  RouteNode,
  errorCodes,
  transitionPath,
  loggerPlugin,
  constants,
} from 'router5'

import browserPlugin from 'router5/plugins/browser'
import listenersPlugin from 'router5/plugins/listeners'
import persistentParamsPlugin from 'router5/plugins/persistentParams'

const router = createRouter()

// router5 only consumes name, path, canActivate, and canDeactivate properties.
// We export the config so we can add more properties and access the config directly.
export const routes = [
  {
    name: 'users',
    navLink: 'Users',
    path: '/users',
  },
  {
    name: 'analyses',
    navLink: 'Analyses',
    path: '/analyses',
  },
  {
    name: 'settings',
    navLink: 'Settings',
    path: '/settings',
  },
  {
    name: 'login',
    path: '/login',
  },
]

router.add(routes)

router
  .setOption('useTrailingSlash', false) // force no trailing slashes
  .setOption('strictQueryParams', false) // match routes when extra query parameters are present

router
  .usePlugin(listenersPlugin())
  .usePlugin(browserPlugin({ useHash: false }))
  .start('/login')

export default router
