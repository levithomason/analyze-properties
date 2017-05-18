import React from 'react'
import createComponent from '../../lib/createComponent'

const rules = {
  root: ({ theme, status }) => {
    return Object.assign({
      padding: '1em',
      margin: '0.5em',
      background: theme.statusBackgroundColors[status].hex(),
      color: theme.statusTextColors[status].hex(),
    })
  },
}

const Message = props => {
  const { ElementType, styles, theme, color, status, ...rest } = props

  return <ElementType {...rest} />
}

export default createComponent({ rules })(Message)
