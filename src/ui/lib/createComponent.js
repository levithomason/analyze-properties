import cx from 'classnames'
import hoistNonReactStatics from 'hoist-non-react-statics'
import React, { Component } from 'react'
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
    )
  }

  class BaseComponent extends Component {
    displayName = `createComponent(${displayName})`

    getElementType = () => {
      const { as } = this.props
      return as || defaultElementType || 'div'
    }

    getClassNames = () => {
      const { className, styles } = this.props
      return cx(styles.global, styles.root, className)
    }

    render() {
      const { as, className, styles, theme, ...rest } = this.props

      // make browser debug easier
      rest[`data-ui-${displayName}`] = true

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

  return compose(felaConnect(rules), StyledComponent =>
    hoistNonReactStatics(StyledComponent, WrappedComponent),
  )(BaseComponent)
}

export default createComponent
