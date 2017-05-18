import _ from 'lodash/fp'
import React, { Component } from 'react'
import createComponent from '../../lib/createComponent'

const rules = {
  root: ({ status, theme }) => {
    const style = {
      fontWeight: 'bold',
      textAlign: 'center',
    }

    if (!_.isNil(status)) {
      style.color = !status ? theme.textColors.red.hex() : theme.textColors.green.hex()
    }

    return style
  },
  value: props => ({
    fontWeight: 'bold',
  }),
  label: props => ({
    textTransform: 'uppercase',
    fontSize: '0.8em',
    fontWeight: 'lighter',
    opacity: '0.5',
  }),
}

class Stat extends Component {
  render() {
    const { ElementType, label, styles, theme, status, value, ...rest } = this.props

    return (
      <ElementType {...rest}>
        <div className={styles.value}>{value}</div>
        <div className={styles.label}>{label}</div>
      </ElementType>
    )
  }
}

export default createComponent({ rules })(Stat)
