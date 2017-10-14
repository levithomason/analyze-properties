import React from 'react'
import createComponent from '../../lib/createComponent'

export const rules = {
  root: ({ theme, basic, color, fluid, icon }) => {
    const background = color ? theme.invertedBackgroundColors[color] : theme.grayscale.lightGray

    return Object.assign(
      {
        flex: '0 0 auto',
        display: 'inline-block',
        transitionProperty: 'background',
        transitionDuration: '0.15s',
        padding: '0.75em 1em',
        margin: '0 1em 0 0',
        width: 'auto',
        fontSize: '1em',
        fontWeight: 'bold',
        textDecoration: 'none',
        cursor: 'pointer',
        background: basic ? 'none' : background.hex(),
        border: 'none',
        borderRadius: 0,
        color: theme.textColors[basic ? color || 'gray' : 'white'].hex(),
        onHover: {
          background: background.darken(0.1).hex(),
        },
        onActive: {
          // instantly change background on tap, transition is too slow
          transitionDuration: 0,
          background: background.lighten(0.1).hex(),
        },
        onFocus: {
          outline: 'none',
        },
      },
      fluid && { margin: 0, width: '100%' },
      icon && { padding: '0.5em' },
    )
  },
}

const Button = ({ ElementType, styles, theme, basic, color, fluid, icon, ...rest }) => {
  return <ElementType {...rest} />
}

export default createComponent({ defaultElementType: 'button', rules })(Button)
