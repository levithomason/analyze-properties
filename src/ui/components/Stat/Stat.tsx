import _ from 'lodash/fp'
import * as React from 'react'
import createComponent from '../../lib/createComponent'

export const rules = {
  root: ({ status, theme }) => {
    const style = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
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
    opacity: 0.5,
  }),
}

class Stat extends React.Component {
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
