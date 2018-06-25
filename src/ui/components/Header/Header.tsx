import * as React from 'react'
import createComponent from '../../lib/createComponent'

export const rules = {
  root: ({ theme, color, textAlign }) => {
    return Object.assign(
      {
        margin: `1em 0 0.5em`,
        textTransform: 'uppercase',
        fontWeight: 300,
      },
      color && {
        color: theme.textColors[color].hex(),
      },
      textAlign && {
        textAlign,
      },
    )
  },
}

const Header = props => {
  const { ElementType, styles, theme, color, textAlign, ...rest } = props

  return <ElementType {...rest} />
}

export default createComponent({ defaultElementType: 'h3', rules })(Header)
