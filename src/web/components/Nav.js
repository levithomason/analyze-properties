import { inject, observer } from 'mobx-react'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Link } from 'react-router5'

import { Button, Image, Menu } from 'semantic-ui-react'

import Logo from '../../common/components/Logo'

const menuStyle = {
  background: '#fff',
  borderTop: '2px solid cornflowerblue',
  borderBottom: '1px solid #ddd',
  boxShadow: 'none',
  zIndex: 100,
}

const menuItemStyle = { background: 'none' }

@inject('sessionStore')
@observer
class Nav extends Component {
  static propTypes = {
    profile: PropTypes.object,
  }

  handleLogout = () => {
    const { sessionStore } = this.props
    sessionStore.logout()
  }

  render() {
    const { sessionStore } = this.props
    const { currentUser } = sessionStore

    return (
      <div>
        <Menu borderless color="blue" fixed="top" style={menuStyle}>
          <Menu.Item style={menuItemStyle} as="div" header>
            <Logo />&emsp;Analyze Properties
          </Menu.Item>

          <Menu.Item style={menuItemStyle} as={Link} routeName="analyses" content="Analyses" />
          <Menu.Item style={menuItemStyle} as={Link} routeName="settings" content="Settings" />
          <Menu.Item style={menuItemStyle} as={Link} routeName="users" content="Users" />
          <Menu.Item style={menuItemStyle} as={Link} routeName="validRoles" content="Valid Roles" />

          <Menu.Menu position="right">
            <Menu.Item style={menuItemStyle}>
              <Image avatar src={currentUser.photoURL} /> {currentUser.displayName}
            </Menu.Item>
            <Menu.Item style={menuItemStyle}>
              <Button onClick={this.handleLogout}>Logout</Button>
            </Menu.Item>
          </Menu.Menu>
        </Menu>
      </div>
    )
  }
}

export default Nav
