import _ from 'lodash/fp'
import { inject, observer } from 'mobx-react'
import * as React from 'react'
import { Link } from 'react-router5'

import { Button, Image, Menu } from 'semantic-ui-react'

import Logo from '../../common/components/Logo'
import { RoleStore } from "../../common/stores/roleStore"
import { SessionStore } from "../../common/stores/sessionStore"

export interface INavProps {
  profile?: object
  sessionStore: SessionStore
  roleStore: RoleStore
}

const menuStyle = {
  background: '#fff',
  borderTop: '2px solid cornflowerblue',
  borderBottom: '1px solid #ddd',
  boxShadow: 'none',
  zIndex: 100,
}

const menuItemStyle = { background: 'none' }

@inject('roleStore')
@inject('sessionStore')
@observer
class Nav extends React.Component<INavProps> {
  handleLogout = () => {
    const { sessionStore } = this.props
    sessionStore.logout()
  }

  render() {
    const { roleStore, sessionStore } = this.props
    const { currentUser } = sessionStore

    const isSuperAdmin = roleStore.isUserInRole(currentUser && currentUser.key, 'superAdmin')
    return (
      <div>
        <Menu borderless color="blue" fixed="top" style={menuStyle}>
          <Menu.Item style={menuItemStyle} as="div" header>
            <Logo />&emsp;Analyze Properties
          </Menu.Item>

          <Menu.Item style={menuItemStyle} as={Link} routeName="analyses" content="Analyses" />
          <Menu.Item style={menuItemStyle} as={Link} routeName="settings" content="Settings" />
          {isSuperAdmin && (
            <Menu.Item style={menuItemStyle} as={Link} routeName="users" content="Users" />
          )}
          {isSuperAdmin && (
            <Menu.Item style={menuItemStyle} as={Link} routeName="validRoles" content="Valid Roles" />
          )}

          <Menu.Menu position="right">
            <Menu.Item style={menuItemStyle}>
              <Image avatar src={_.get('photoURL', currentUser)} />{' '}
              {_.get('displayName', currentUser)}
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
