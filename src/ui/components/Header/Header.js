import React from 'react'
import createComponent from '../../lib/createComponent'

const rules = {
  root: ({ theme, color }) => {
    return Object.assign(
      {
        margin: `1em 0 0.5em`,
        textTransform: 'uppercase',
      },
      color && {
        color: theme.textColors[color].hex(),
      },
    )
  },
}

const Header = props => {
  const { ElementType, styles, theme, color, ...rest } = props

  return <ElementType {...rest} />
}

export default createComponent({ defaultElementType: 'h3', rules })(Header)
