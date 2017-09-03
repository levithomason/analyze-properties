import React, { Component } from 'react'
import createComponent from '../../lib/createComponent'

const rules = {
  root: ({ theme }) => ({
    userSelect: 'none',
  }),
  input: ({ theme }) => ({
    marginRight: '0.25em',
    onFocus: {
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
    const { ElementType, styles, theme, label, ...rest } = this.props

    return (
      <ElementType {...rest}>
        <input ref={this.handleRef} type="checkbox" className={styles.input} />
        {label}
      </ElementType>
    )
  }
}

export default createComponent({ defaultElementType: 'label', rules })(Input)
