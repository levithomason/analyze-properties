import PropTypes from 'prop-types'
import React from 'react'
import createComponent from '../../lib/createComponent'

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

const Box = props => {
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

Box.propTypes = {
  theme: PropTypes.string,
  align: PropTypes.string,
  alignSelf: PropTypes.string,
  border: PropTypes.string,
  circular: PropTypes.bool,
  color: PropTypes.string,
  column: PropTypes.string,
  fluid: PropTypes.string,
  inverted: PropTypes.bool,
  justify: PropTypes.string,
  justifySelf: PropTypes.string,
  padded: PropTypes.bool,
  radius: PropTypes.string,
  row: PropTypes.bool,
  shadow: PropTypes.string,
}

export default createComponent({ rules })(Box)
