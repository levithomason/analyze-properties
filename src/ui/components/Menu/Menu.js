import React, { Component } from 'react'
import createComponent from '../../lib/createComponent'
import MenuItem from './MenuItem'

const rules = {
  root: ({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    flex: '0 0 auto',
    padding: 0,
    margin: 0,
    textAlign: 'center',
    textTransform: 'uppercase',
    background: theme.grayscale.lighterGray.hex(),
    fontWeight: 'bold',
    listStyle: 'none',
  }),
}

class Menu extends Component {
  static Item = MenuItem

  handleItemClick = (e, { name }) => {
    const { onItemClick } = this.props
    if (onItemClick) onItemClick(e, { activeItem: name })
  }

  renderItems = () => {
    const { activeItem, items = [] } = this.props

    return items.map(item => (
      <MenuItem onClick={this.handleItemClick} name={item} key={item} active={activeItem === item}>
        {item}
      </MenuItem>
    ))
  }

  render() {
    const { ElementType, styles, theme, activeItem, items, onItemClick, ...rest } = this.props

    return <ElementType {...rest}>{this.renderItems()}</ElementType>
  }
}

export default createComponent({ defaultElementType: 'ul', rules })(Menu)
