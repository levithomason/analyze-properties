import React from 'react'
import createComponent from '../../lib/createComponent'

export const rules = {
  root: ({ theme, avatar }) => {
    return Object.assign(
      {
        maxWidth: '100%',
      },
      avatar && {
        display: 'inline-block',
        width: '2em',
        height: '2em',
      },
    )
  },
}

const Image = props => {
  const { ElementType, styles, theme, avatar, ...rest } = props

  return <ElementType {...rest} />
}

export default createComponent({ defaultElementType: 'img', rules })(Image)
