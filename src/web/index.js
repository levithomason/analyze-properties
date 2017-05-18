import 'normalize.css'
import '../ui/styles/ui.scss'

import createIndex from '../common/createIndex'

const render = createIndex({
  importRoot: () => import('./components/Root'),
  styles: {
    htmlBody: {},
  },
})

if (module.hot) {
  module.hot.accept('./components/Root', render)
}

render()
