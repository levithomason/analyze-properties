import cx from 'classnames'
import hoistNonReactStatics from 'hoist-non-react-statics'
import * as React from 'react'
import { connect as felaConnect } from 'react-fela'

import compose from '../lib/compose'

const createComponent = (config = {}) => WrappedComponent => {
  const { defaultElementType, rules = {} } = config
  const displayName = WrappedComponent.name || WrappedComponent.displayName || 'WrappedComponent'

  if (process.env.NODE_ENV !== 'production') {
    if (typeof rules !== 'object' || rules === null) {
      throw new Error(`createComponent \`rules\` must be a plain object, see ${displayName}.`)
    }

    if (Object.keys(rules).some(key => typeof rules[key] !== 'function')) {
      throw new Error(
        `createComponent every \`rules\` object value must be a function, see ${displayName}.`,
      )
    }
  }

  rules.global = props => {
    return Object.assign(
      {},
      props.disabled && {
        opacity: '0.5',
        pointerEvents: 'none',
      },
      // Relaxed
      // Adds margin around an element
      props.relaxed === true && {
        marginTop: '1em',
        marginBottom: '1em',
        marginLeft: '1em',
        marginRight: '1em',
      },
      props.relaxed === 'horizontally' && {
        marginLeft: '1em',
        marginRight: '1em',
      },
      props.relaxed === 'vertically' && {
        marginTop: '1em',
        marginBottom: '1em',
      },
      props.relaxed === 'top' && {
        marginTop: '1em',
      },
      props.relaxed === 'bottom' && {
        marginBottom: '1em',
      },
      props.relaxed === 'left' && {
        marginLeft: '1em',
      },
      props.relaxed === 'right' && {
        marginRight: '1em',
      },
    )
  }

  class UIBaseComponent extends React.Component {
    displayName = `createComponent(${displayName})`

    getElementType = () => {
      const { as } = this.props
      return as || defaultElementType || 'div'
    }

    getClassNames = () => {
      const { className, styles } = this.props
      return cx(displayName, styles.global, styles.root, className)
    }

    render() {
      const { as, className, rules, styles, theme, relaxed, ...rest } = this.props

      return (
        <WrappedComponent
          {...rest}
          className={this.getClassNames()}
          styles={styles}
          theme={theme}
          ElementType={this.getElementType()}
        />
      )
    }
  }

  return compose(
    felaConnect(rules),
    StyledComponent => hoistNonReactStatics(StyledComponent, WrappedComponent),
  )(UIBaseComponent)
}

export default createComponent
