import React, { Component } from 'react'
import FormField from './FormField'

import createComponent from '../../lib/createComponent'

export const rules = {
  root: props => ({}),
}

class Form extends Component {
  static Field = FormField

  handleSubmit = e => {
    const { onSubmit } = this.props
    e.preventDefault()
    if (onSubmit) onSubmit(e)
  }

  render() {
    const { ElementType, styles, theme, ...rest } = this.props

    return <ElementType {...rest} onSubmit={this.handleSubmit} />
  }
}

export default createComponent({ defaultElementType: 'form', rules })(Form)
