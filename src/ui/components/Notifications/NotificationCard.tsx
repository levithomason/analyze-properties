import * as React from 'react'
import createComponent from '../../lib/createComponent'

import Message, { rules as messageRules } from '../Message'

export const rules = {
  root: props => {
    const messageStyle = messageRules.root(props)

    return Object.assign(messageStyle, {
      width: '20em',
      pointerEvents: 'all', // the container has 'none'
    })
  },
}

const NotificationCard = props => {
  const { ElementType, styles, theme, status, ...rest } = props

  return <ElementType {...rest} />
}

export default createComponent({ rules, defaultElementType: Message })(NotificationCard)
