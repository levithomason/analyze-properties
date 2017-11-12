import React from 'react'
import createComponent from '../../lib/createComponent'

export const rules = {
  root: ({ theme, basic, color, inline }) => {
    const background = color ? theme.invertedBackgroundColors[color] : theme.grayscale.gray

    return Object.assign(
      {
        flex: '0 0 auto',
        display: 'inline-block',
        transitionProperty: 'background',
        transitionDuration: '0.15s',
        padding: '0.25em 0.5em',
        marginRight: '0.5em',
        width: 'auto',
        fontSize: '0.93875em',
        textDecoration: 'none',
        background: basic ? 'none' : background.hex(),
        border: basic ? '1px solid' + background.hex() : 'none',
        borderRadius: '0.25em',
        color: theme.textColors[basic ? color || 'gray' : 'white'].hex(),
      },
      inline && {
        padding: '0.06125em 0.325em',
        marginTop: '-0.06125em',
        marginBottom: '-0.06125em',
        marginRight: 0,
      },
    )
  },
}

const Label = ({ ElementType, styles, theme, basic, color, inline, ...rest }) => {
  return <ElementType {...rest} />
}

export default createComponent({ defaultElementType: 'span', rules })(Label)
