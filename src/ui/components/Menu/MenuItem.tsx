import * as React from 'react'

import createComponent from '../../lib/createComponent'

export const rules = {
  root: ({ theme, active }) =>
    Object.assign(
      {
        float: 'left',
        display: 'block',
        padding: '1em',
        cursor: 'pointer',
        color: theme.grayscale.darkGray.hex(),
      },
      active && {
        color: theme.grayscale.darkerGray.hex(),
        background: theme.grayscale.white.hex(),
      },
    ),
}

class MenuItem extends React.Component {
  handleClick = e => {
    const { onClick, index } = this.props
    if (onClick) onClick(e, { index })
  }

  render() {
    const { ElementType, styles, theme, active, children, index, onClick, ...rest } = this.props
    return (
      <ElementType {...rest} onClick={this.handleClick}>
        {children}
      </ElementType>
    )
  }
}

export default createComponent({ defaultElementType: 'li', rules })(MenuItem)
