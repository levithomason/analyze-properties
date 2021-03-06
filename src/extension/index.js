import createIndex from '../common/createIndex'
import '../ui/styles/ui.scss'

const render = createIndex({
  importRoot: () => import('./components/Root'),
  styles: {
    htmlBody: {},
    mountNode: {},
  },
})

if (module.hot) {
  module.hot.accept('./components/Root', render)
}

render()
