import 'normalize.css'
import '../ui/styles/ui.scss'

import createIndex from '../common/createIndex'

const render = createIndex({
  importRoot: () => import('./components/Root'),
  styles: {
    htmlBody: {
      width: '100vw',
      height: '100vh',
      padding: 0,
      margin: 0,
      overflow: 'hidden',
    },
    mountNode: {
      width: '100%',
      height: '100%',
    },
  },
})

if (module.hot) {
  module.hot.accept('./components/Root', render)
}

render()
