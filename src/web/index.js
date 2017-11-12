// import 'normalize.css'
// import '../ui/styles/ui.scss'

import 'font-awesome/css/font-awesome.css'
import 'semantic-ui-css/semantic.css'

import createIndex from '../common/createIndex'

const render = createIndex({
  importRoot: () => import('./components/Root'),
  styles: {
    htmlBody: {
      padding: 0,
      margin: 0,
    },
    mountNode: {},
  },
})

if (module.hot) {
  module.hot.accept('./components/Root', render)
}

render()
