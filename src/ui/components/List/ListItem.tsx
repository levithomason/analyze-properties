import * as React from 'react'
import createComponent from '../../lib/createComponent'

export const rules = {
  root: ({ theme, active, link, selected }) =>
    Object.assign(
      {
        float: 'left',
        display: 'block',
        padding: '0.5em 1em',
        cursor: 'pointer',
        onHover: Object.assign(
          {},
          link && {
            color: theme.textColors.blue.hex(),
          },
        ),
      },
      active && {
        color: theme.textColors.gray.hex(),
        background: theme.grayscale.lighterGray.hex(),
      },
      link && {
        color: theme.textColors.gray.hex(),
      },
      selected && {
        color: theme.textColors.gray.hex(),
        background: theme.grayscale.lightestGray.hex(),
      },
    ),
}

class ListItem extends React.Component {
  handleClick = e => {
    const { onClick, name } = this.props
    if (onClick) onClick(e, { name })
  }

  render() {
    const {
      ElementType,
      styles,
      theme,
      active,
      children,
      link,
      name,
      onClick,
      selected,
      ...rest
    } = this.props
    return (
      <ElementType {...rest} onClick={this.handleClick}>
        {children}
      </ElementType>
    )
  }
}

export default createComponent({ defaultElementType: 'li', rules })(ListItem)
