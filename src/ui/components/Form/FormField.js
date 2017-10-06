import React, { Component } from 'react'
import createComponent from '../../lib/createComponent'

export const rules = {
  root: props => ({
    padding: '0.25em',
  }),
  label: props => ({
    display: 'block',
    opacity: 0.5,
    fontWeight: 'bold',
    fontSize: '0.8em',
  }),
}

class FormField extends Component {
  render() {
    const { ElementType, children, label, styles, theme, ...rest } = this.props

    return (
      <ElementType {...rest}>
        {label !== null && label !== undefined && <label className={styles.label}>{label}</label>}
        {children}
      </ElementType>
    )
  }
}

export default createComponent({ rules })(FormField)
