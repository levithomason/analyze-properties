import _ from 'lodash/fp'
import { inject, observer } from 'mobx-react'
import * as React from 'react'
import { Link } from 'react-router5'

import { Image, Menu } from 'semantic-ui-react'

import Logo from '../../common/components/Logo'
import { RoleStore } from '../../common/stores/roleStore'
import { SessionStore } from '../../common/stores/sessionStore'
import LogoutButton from '../../common/components/LogoutButton'

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
  render() {
    const { roleStore, sessionStore } = this.props
    const { currentUser } = sessionStore

    if (!currentUser) return null

    const isSuperAdmin = roleStore.isUserInRole(currentUser.key, 'superAdmin')

    return (
      <Menu borderless color="blue" style={menuStyle}>
        <Menu.Item style={menuItemStyle} as="div" header>
          <Logo />
          &emsp;Analyze Properties
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
            <LogoutButton />
          </Menu.Item>
        </Menu.Menu>
      </Menu>
    )
  }
}

export default Nav
