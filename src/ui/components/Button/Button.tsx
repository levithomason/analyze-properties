import _ from 'lodash/fp'
import * as React from 'react'
import createComponent from '../../lib/createComponent'

export const rules = {
  root: ({ theme, basic, color, fluid, icon }) => {
    const background = color ? theme.invertedBackgroundColors[color] : theme.grayscale.lightGray

    return _.mergeAll(
      [
        {
          flex: '0 0 auto',
          display: 'inline-block',
          transitionProperty: 'background, box-shadow, color',
          transitionDuration: '0.1s, 0.1s, 0.1s',
          padding: '0.75em 1em',
          marginRight: '1em',
          width: 'auto',
          fontSize: '1em',
          fontWeight: 'bold',
          textDecoration: 'none',
          cursor: 'pointer',
          background: background.hex(),
          border: 'none',
          borderRadius: 0,
          boxShadow: `inset 0 -0.125em ${background.darken(0.2).hex()}`,
          color: theme.textColors.white.hex(),
          onHover: {
            background: background.darken(0.1).hex(),
            color: 'none',
          },
          onActive: {
            // instantly change background on tap, transition is too slow
            transitionDuration: 0,
            background: background.darken(0.2).hex(),
            boxShadow: `inset 0 -0.125em ${background.lighten(0.1).hex()}`,
          },
          onFocus: {
            outline: 'none',
          },
        },
        basic && {
          background: 'none',
          boxShadow: 'none',
          color: theme.textColors[color || 'gray'].lighten(0.2).hex(),
          onHover: {
            background: 'none',
            boxShadow: 'inset 0 0 0 2px ' + background.lighten(0.5).hex(),
            color: theme.textColors[color || 'gray'].hex(),
          },
          onActive: {
            background: 'none',
            boxShadow: 'inset 0 0 0 2px ' + background.hex(),
            color: theme.textColors[color || 'gray'].darken(0.1).hex(),
          },
        },
        fluid && {
          margin: 0,
          width: '100%',
        },
        icon && {
          padding: '0.5em',
          marginRight: '0.5em',
          minWidth: '2.25em',
        },
      ].filter(Boolean),
    )
  },
}

const Button = ({ ElementType, styles, theme, basic, color, fluid, icon, ...rest }) => {
  return <ElementType {...rest} />
}

export default createComponent({ defaultElementType: 'button', rules })(Button)
