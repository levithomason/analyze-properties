import * as React from 'react'
import createComponent from '../../lib/createComponent'

export interface IBoxProps {
  theme: string
  align: string
  alignSelf: string
  border: string
  circular: boolean
  color: string
  column: boolean
  fluid: string
  inverted: boolean
  justify: string
  justifySelf: string
  padded: boolean
  radius: string
  row: boolean
  shadow: string
}

export const rules = {
  root: ({
    theme,
    align,
    alignSelf,
    border,
    circular,
    color,
    column,
    fluid,
    inverted,
    justify,
    justifySelf,
    padded,
    radius,
    row,
    shadow,
  }) => {
    return Object.assign(
      {
        display: 'flex',
        flexDirection: 'row',
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
      alignSelf && {
        alignSelf,
      },
      justifySelf && {
        justifySelf,
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

const Box = (props: IBoxProps) => {
  const {
    // default
    ElementType,
    styles,
    theme,
    // props
    align,
    alignSelf,
    border,
    circular,
    color,
    column,
    fluid,
    inverted,
    justify,
    justifySelf,
    padded,
    radius,
    row,
    shadow,
    ...rest
  } = props

  return <ElementType {...rest} />
}

export default createComponent({ rules })(Box)
