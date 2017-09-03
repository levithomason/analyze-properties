import React, { Component } from 'react'
import createComponent from '../../lib/createComponent'

const rules = {
  root: ({ active }) =>
    Object.assign(
      {
        transition: 'opacity 0.2s',
        display: 'flex',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        textAlign: 'center',
        background: '#fff',
        opacity: 0,
        zIndex: 999999,
        pointerEvents: 'none',
      },
      active && {
        opacity: 1,
        pointerEvents: 'all',
      },
    ),
  text: props => ({
    alignSelf: 'center',
    width: '100%',
  }),
}

class Loader extends Component {
  render() {
    const { ElementType, styles, theme, children, active, ...rest } = this.props

    return (
      <ElementType {...rest}>
        <div className={styles.text}>{children}</div>
      </ElementType>
    )
  }
}

export default createComponent({ rules })(Loader)
