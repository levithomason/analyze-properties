import React, { Component } from 'react'
import createComponent from '../../lib/createComponent'

export const rules = {
  root: ({ theme, fluid }) => {
    return Object.assign(
      {
        transition: 'border 0.1s, box-shadow 0.1s',
        padding: '0.5em 1em',
        border: '1px solid rgba(0, 0, 0, 0.2)',
        borderRadius: '0.25em',
        onFocus: {
          border: '1px solid #8af',
          boxShadow: '0 0 0 0.25em rgba(0, 128, 255, 0.1)',
          outline: 'none',
        },
      },
      fluid && {
        width: '100%',
      },
    )
  },
}

class Input extends Component {
  handleRef = c => (this.ref = c)

  focus = () => this.ref.focus()

  render() {
    const { ElementType, styles, theme, fluid, ...rest } = this.props

    return <ElementType {...rest} ref={this.handleRef} />
  }
}

export default createComponent({ defaultElementType: 'input', rules })(Input)
