import React, { Component } from 'react'
import createComponent from '../../lib/createComponent'
import ListItem from './ListItem'

export const rules = {
  root: ({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    flex: '0 0 auto',
    padding: 0,
    margin: 0,
    listStyle: 'none',
  }),
}

class List extends Component {
  static Item = ListItem

  handleItemClick = (e, { name }) => {
    const { onItemClick } = this.props
    if (onItemClick) onItemClick(e, { activeItem: name })
  }

  renderItems = () => {
    const { activeItem, selectedItem, items = [], link } = this.props

    return items.map(item => (
      <ListItem
        onClick={this.handleItemClick}
        name={item}
        key={item}
        active={activeItem === item}
        selected={selectedItem === item}
        link={link}
      >
        {item}
      </ListItem>
    ))
  }

  render() {
    const {
      ElementType,
      styles,
      theme,
      activeItem,
      items,
      onItemClick,
      link,
      selectedItem,
      ...rest
    } = this.props

    return <ElementType {...rest}>{this.renderItems()}</ElementType>
  }
}

export default createComponent({ defaultElementType: 'ul', rules })(List)
