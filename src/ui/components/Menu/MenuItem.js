import React, { Component } from 'react'
import createComponent from '../../lib/createComponent'

const rules = {
  root: ({ theme, active }) =>
    Object.assign(
      {
        float: 'left',
        display: 'block',
        padding: '1em',
        cursor: 'pointer',
        color: theme.grayscale.lighterGray.hex(),
      },
      active && {
        color: theme.textColors.gray.hex(),
        background: theme.grayscale.white.hex(),
      },
    ),
}

class MenuItem extends Component {
  handleClick = e => {
    const { onClick, name } = this.props
    if (onClick) onClick(e, { name })
  }

  render() {
    const { ElementType, styles, theme, active, children, name, onClick, ...rest } = this.props
    return (
      <ElementType {...rest} onClick={this.handleClick}>
        {children}
      </ElementType>
    )
  }
}

export default createComponent({ defaultElementType: 'li', rules })(MenuItem)
