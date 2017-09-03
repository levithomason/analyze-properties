import React from 'react'
import ReactDOM from 'react-dom'

import { Provider as ReactReduxProvider } from 'react-redux'

import { createRenderer } from 'fela'
import { Provider as FelaProvider, ThemeProvider } from 'react-fela'
// style plugins
import LVHA from 'fela-plugin-lvha'
import friendlyPseudoClass from 'fela-plugin-friendly-pseudo-class'
import placeholderPrefixer from 'fela-plugin-placeholder-prefixer'
import prefixer from 'fela-plugin-prefixer'
import fallbackValue from 'fela-plugin-fallback-value'
import important from 'fela-plugin-important'
import validator from 'fela-plugin-validator'
import unit from 'fela-plugin-unit'

// style renderer enhancers
import layoutDebugger from 'fela-layout-debugger'

import store from './modules/store'

const createIndex = ({ styles = {}, importRoot }) => {
  // Mount node
  const mountNode = document.createElement('div')
  mountNode.id = 'analyze-properties'
  document.body.appendChild(mountNode)

  // Style Renderer
  const rendererConfig = {
    selectorPrefix: 'ap_',
    enhancers: [],
    plugins: [
      friendlyPseudoClass(), // Use JS-friendly pseudo classes (i.e. onHover vs ':hover')
      LVHA(), // Sorts pseudo classes according to LVH(F)A
      placeholderPrefixer(), // Adds all ::placeholder prefixes
      prefixer(), // Adds all vendor prefixes to the styles
      fallbackValue(), // Resolves arrays of fallback values (required after prefixer)
      unit(), // Automatically adds units to values if needed
      important(), // Adds !important to every declaration value (mostly for in-page extension)
    ],
  }

  // Dev
  if (__DEV__) {
    window.reactPerf = require('react-addons-perf')

    rendererConfig.plugins.concat([
      validator({
        logInvalid: true,
        deleteInvalid: true,
      }),
    ])

    rendererConfig.enhancers.concat([layoutDebugger()])
  }

  const styleRenderer = createRenderer(rendererConfig)

  if (styles.htmlBody) styleRenderer.renderStatic(styles.htmlBody, 'html,body')
  if (styles.mountNode) styleRenderer.renderStatic(styles.mountNode, '#analyze-properties')

  // Render App
  const render = () => {
    Promise.all([
      importRoot(),
      import('../ui/styles/theme'),
    ]).then(([{ default: Root }, { default: theme }]) => {
      ReactDOM.render(
        <ReactReduxProvider store={store}>
          <ThemeProvider theme={theme}>
            <FelaProvider renderer={styleRenderer}>
              <Root />
            </FelaProvider>
          </ThemeProvider>
        </ReactReduxProvider>,
        mountNode,
      )
    })
  }

  if (module.hot) {
    module.hot.accept('../ui/styles/theme', render)
  }

  return render
}

export default createIndex
