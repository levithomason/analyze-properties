import * as React from 'react'
import Menu from '../Menu'
import createComponent from '../../lib/createComponent'

export const rules = {
  root: props => ({
    display: 'flex',
    flexDirection: 'column',
  }),
}

class Tabs extends React.Component {
  handleItemClick = (e, { activeItem }) => {
    const { onTabChange } = this.props
    if (onTabChange) onTabChange(e, { activeTab: activeItem })
  }

  render() {
    const { ElementType, styles, theme, panes, activeTab, onTabChange, ...rest } = this.props

    const activePane = panes.find(pane => pane.menuItem === activeTab)

    return (
      <ElementType {...rest}>
        <Menu
          activeItem={activeTab}
          onItemClick={this.handleItemClick}
          items={panes.map(({ menuItem }) => menuItem)}
        />
        {activePane && activePane.render()}
      </ElementType>
    )
  }
}

export default createComponent({ rules })(Tabs)
