import _ from 'lodash/fp'
import { inject, observer } from 'mobx-react'
import * as React from 'react'
import { Button, Checkbox, Image, Tab, Table } from 'semantic-ui-react'

import { makeDebugger } from '../../common/lib'
import { RoleStore } from '../../common/stores/roleStore'
import { UserStore } from '../../common/stores/userStore'
import Role from '../../common/stores/Role'
import User from '../../common/stores/User'

const debug = makeDebugger('views:users')

interface IUsersProps {
  roleStore: RoleStore
  userStore: UserStore
}

@inject('roleStore')
@inject('userStore')
@observer
class Users extends React.Component<IUsersProps> {
  handleToggleRole = (role: Role, user: User) => () => {
    const hasRole = role.includesUser(user.key)
    debug('handleToggleRole', user.displayName, role, !hasRole)

    if (hasRole) role.removeUser(user.key)
    else role.addUser(user.key)
  }

  render() {
    const { roleStore, userStore } = this.props

    const otherRoles = roleStore.roles.filter(role => role.key !== 'approved')

    return (
      <Tab
        panes={[
          {
            menuItem: { key: 'users', icon: 'users', content: 'Manage Users' },
            render: () => (
              <Table compact singleLine>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell collapsing>Approved</Table.HeaderCell>
                    <Table.HeaderCell collapsing>User</Table.HeaderCell>
                    <Table.HeaderCell collapsing>Email</Table.HeaderCell>
                    {_.map(
                      (role: Role) => (
                        <Table.HeaderCell key={role.key}>{role.key}</Table.HeaderCell>
                      ),
                      otherRoles,
                    )}
                    <Table.HeaderCell>id</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {_.map((user: User) => {
                    return (
                      <Table.Row key={user.key}>
                        <Table.Cell>
                          <Checkbox
                            toggle
                            checked={roleStore.isUserInRole(user.key, 'approved')}
                            onChange={this.handleToggleRole(roleStore.rolesById.approved, user)}
                          />
                        </Table.Cell>
                        <Table.Cell>
                          <Image avatar src={user.photoURL} /> {user.displayName}
                        </Table.Cell>
                        <Table.Cell>{user.email}</Table.Cell>
                        {_.map(
                          role => (
                            <Table.Cell key={role.key}>
                              <Checkbox
                                checked={role.includesUser(user.key)}
                                onChange={this.handleToggleRole(role, user)}
                              />
                            </Table.Cell>
                          ),
                          otherRoles,
                        )}
                        <Table.Cell>{user.key}</Table.Cell>
                      </Table.Row>
                    )
                  }, userStore.users)}
                </Table.Body>
              </Table>
            ),
          },
          {
            menuItem: 'Role store',
            render: () => (
              <pre>
                <code>{JSON.stringify(roleStore.asJS, null, 2)}</code>
              </pre>
            ),
          },
          {
            menuItem: 'User store',
            render: () => (
              <pre>
                <code>{JSON.stringify(userStore.asJS, null, 2)}</code>
              </pre>
            ),
          },
        ]}
      />
    )
  }
}

export default Users
