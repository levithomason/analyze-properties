import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { Provider as ReactReduxProvider } from 'react-redux'
import { Provider as MobXProvider } from 'mobx-react'

import { createRenderer } from 'fela'
import { Provider as FelaProvider, ThemeProvider } from 'react-fela'
// style plugins
import LVHA from 'fela-plugin-lvha'
import friendlyPseudoClass from 'fela-plugin-friendly-pseudo-class'
import placeholderPrefixer from 'fela-plugin-placeholder-prefixer'
import prefixer from 'fela-plugin-prefixer'
import fallbackValue from 'fela-plugin-fallback-value'
import validator from 'fela-plugin-validator'
import unit from 'fela-plugin-unit'

import store from './modules/store'
import * as stores from './stores'
import './styles/global.scss'

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
    ],
  }

  // Dev
  if (process.env.NODE_ENV !== 'production') {
    rendererConfig.plugins = [
      ...rendererConfig.plugins,
      validator({
        logInvalid: true,
        deleteInvalid: true,
      }),
    ]
  }

  const styleRenderer = createRenderer(rendererConfig)

  if (styles.htmlBody) styleRenderer.renderStatic(styles.htmlBody, 'html,body')
  if (styles.mountNode) styleRenderer.renderStatic(styles.mountNode, '#analyze-properties')

  // Render App
  const render = () => {
    Promise.all([importRoot(), import('../ui/styles/theme')]).then(
      ([{ default: Root }, { default: theme }]) => {
        ReactDOM.render(
          <MobXProvider {...stores}>
            <ReactReduxProvider store={store}>
              <ThemeProvider theme={theme}>
                <FelaProvider renderer={styleRenderer}>
                  <div>
                    <Root />
                    {process.env.NODE_ENV !== 'production' &&
                      React.createElement(require('mobx-react-devtools').default, {
                        position: { bottom: 0, right: '1em' },
                      })}
                  </div>
                </FelaProvider>
              </ThemeProvider>
            </ReactReduxProvider>
          </MobXProvider>,
          mountNode,
        )
      },
    )
  }

  if (module.hot) {
    module.hot.accept('../ui/styles/theme', render)
  }

  return render
}

export default createIndex