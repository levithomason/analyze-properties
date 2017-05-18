import React from 'react'
import createComponent from '../../lib/createComponent'

const rules = {
  root: ({ theme, border, circular, color, fluid, inverted, padded, radius, shadow }) => {
    return Object.assign(
      {
        display: 'inline-block',
        padding: '0.5em 1em',
        marginRight: '0.5em',
      },
      border && {
        border: theme.borders[border]({ color }),
      },
      color && {
        color: theme.textColors[color].hex(),
      },
      padded && {
        padding: '1em',
      },
      radius && {
        ...theme.radii[radius]({ circular }),
      },
      shadow && {
        ...theme.shadows[shadow](),
      },
      fluid && {
        display: 'block',
        width: '100%',
      },
      inverted && {
        color: theme.textColors.white.hex(),
        background: theme.invertedBackgroundColors[color].hex(),
      },
    )
  },
}

const Box = props => {
  const {
    // default
    ElementType,
    styles,
    theme,
    // props
    border,
    circular,
    color,
    fluid,
    inverted,
    padded,
    shadow,
    ...rest
  } = props

  return <ElementType {...rest} />
}

export default createComponent({ rules })(Box)
