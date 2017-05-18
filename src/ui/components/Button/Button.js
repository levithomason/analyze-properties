import React from 'react'
import createComponent from '../../lib/createComponent'

const rules = {
  root: ({ theme, color, fluid, inverted }) => {
    const background = color
      ? theme[inverted ? 'invertedBackgroundColors' : 'colors'][color]
      : theme.grayscale.lighterGray

    let textColor = inverted ? theme.textColors.white : theme.textColors[color || 'black']

    return Object.assign(
      {
        transitionProperty: 'background 0.1s',
        transitionDuration: '0.1s',
        padding: '0.5em 1em',
        margin: '0 0.25em 0 0',
        border: 'none',
        borderRadius: 0,
        fontSize: '1em',
        cursor: 'pointer',
        width: 'auto',
        color: textColor.hex(),
        background: background.hex(),
        onHover: {
          background: background.darken(0.1).hex(),
        },
        onActive: {
          // instantly change background on tap, transition is too slow
          transitionDuration: 0,
          background: background.darken(0.2).hex(),
        },
        onFocus: {
          outline: 'none',
        },
      },
      fluid && { width: '100%' },
      inverted && { color: theme.textColors.white.hex() },
    )
  },
}

const Button = ({ ElementType, styles, theme, color, fluid, inverted, ...rest }) => {
  return <ElementType {...rest} />
}

export default createComponent({ defaultElementType: 'button', rules })(Button)
