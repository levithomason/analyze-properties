import React from 'react'
import createComponent from '../../lib/createComponent'

const rules = {
  root: ({
           theme,
           align,
           border,
           circular,
           color,
           column,
           fluid,
           inverted,
           justify,
           padded,
           radius,
           row,
           shadow,
         }) => {
    return Object.assign(
      {
        display: 'flex',
        flexDirection: 'column',
      },
      row && {
        flexDirection: 'row',
      },
      column && {
        flexDirection: 'column',
      },
      align && {
        alignItems: align,
      },
      justify && {
        justifyContent: justify,
      },
      border && {
        border: theme.borders[border]({ color }),
      },
      color && {
        color: theme.textColors[color].hex(),
      },
      fluid && {
        display: 'block',
        width: '100%',
      },
      inverted && {
        color: theme.textColors.white.hex(),
        background: theme.invertedBackgroundColors[color].hex(),
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
    align,
    border,
    circular,
    color,
    column,
    fluid,
    inverted,
    justify,
    padded,
    radius,
    row,
    shadow,
    ...rest
  } = props

  return <ElementType {...rest} />
}

export default createComponent({ rules })(Box)
