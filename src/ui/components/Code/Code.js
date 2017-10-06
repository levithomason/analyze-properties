import React from 'react'
import createComponent from '../../lib/createComponent'

export const rules = {
  root: ({ theme, ...props }) => ({
    padding: '0.5em',
    margin: 0,
    color: '#888',
    fontFamily: 'monospace',
    background: 'rgba(0, 0, 0, 0.0625)',
    borderRadius: theme.em(theme.val(theme.borderRadius) * 0.25),
  }),
}

const Code = ({ ElementType, children, styles, theme, ...rest }) => {
  return (
    <ElementType {...rest}>
      <code>{children}</code>
    </ElementType>
  )
}

export default createComponent({ rules })(Code)
