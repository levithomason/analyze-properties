import _ from 'lodash/fp'
import React, { Component } from 'react'

import createComponent from '../../lib/createComponent'
import NotificationCard from './NotificationCard'

export const rules = {
  root: ({ theme, position }) => {
    return Object.assign(
      {
        position: 'fixed',
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: 'none',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      position === 'top' && { alignItems: 'center', justifyContent: 'flex-start' },
      position === 'right' && { alignItems: 'flex-end', justifyContent: 'center' },
      position === 'bottom' && { alignItems: 'center', justifyContent: 'flex-end' },
      position === 'left' && { alignItems: 'flex-start', justifyContent: 'center' },
      position === 'top left' && { alignItems: 'flex-start', justifyContent: 'flex-start' },
      position === 'top right' && { alignItems: 'flex-end', justifyContent: 'flex-start' },
      position === 'bottom right' && { alignItems: 'flex-end', justifyContent: 'flex-end' },
      position === 'bottom left' && { alignItems: 'flex-start', justifyContent: 'flex-end' },
    )
  },
}

class Notifications extends Component {
  render() {
    const { ElementType, styles, theme, cards, ...rest } = this.props

    return (
      // eslint-disable-next-line react/jsx-key
      <ElementType {...rest}>{_.map(card => <NotificationCard {...card} />, cards)}</ElementType>
    )
  }
}

export default createComponent({ rules })(Notifications)
