import _ from 'lodash/fp'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect as reduxConnect } from 'react-redux'
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

class Nav extends Component {
  handleLogout = () => {
    const { firebase } = this.props
    firebase.logout()
  }

  render() {
    const { profile = {} } = this.props

    return (
      <Menu borderless color="blue" fixed="top" style={menuStyle}>
        <Menu.Item style={menuItemStyle} as="div" header>
          <Logo />&emsp;Analyze Properties
        </Menu.Item>

        <Menu.Item style={menuItemStyle} as={Link} routeName="analyses" content="Analyses" />
        <Menu.Item style={menuItemStyle} as={Link} routeName="settings" content="Settings" />
        <Menu.Item style={menuItemStyle} as={Link} routeName="users" content="Users" />

        <Menu.Menu position="right">
          <Menu.Item style={menuItemStyle}>
            <Image avatar src={profile.avatarUrl} /> {profile.displayName}
          </Menu.Item>
          <Menu.Item style={menuItemStyle}>
            <Button onClick={this.handleLogout}>Logout</Button>
          </Menu.Item>
        </Menu.Menu>
      </Menu>
    )
  }
}

export default _.flow(
  reduxConnect(({ firebase: { profile } }) => ({
    profile,
  })),
)(Nav)
