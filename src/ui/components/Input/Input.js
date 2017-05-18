import React, { Component } from 'react'
import createComponent from '../../lib/createComponent'

const rules = {
  root: ({ theme }) => ({
    transition: 'border 0.1s, box-shadow 0.1s',
    padding: '0.5em 1em',
    border: '1px solid rgba(0, 0, 0, 0.2)',
    borderRadius: '0.25em',
    ':focus': {
      border: '1px solid #8af',
      boxShadow: '0 0 0 0.25em rgba(0, 128, 255, 0.1)',
      outline: 'none',
    },
  }),
}

class Input extends Component {
  handleRef = c => (this.ref = c)

  focus = () => this.ref.focus()

  render() {
    const { ElementType, styles, theme, ...rest } = this.props

    return <ElementType {...rest} ref={this.handleRef} />
  }
}

export default createComponent({ defaultElementType: 'input', rules })(Input)
