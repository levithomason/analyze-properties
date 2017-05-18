import createIndex from '../common/createIndex'

const render = createIndex({
  importRoot: () => import('./App'),
})

if (module.hot) {
  module.hot.accept('./App', render)
}

render()
