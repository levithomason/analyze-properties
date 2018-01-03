import _ from 'lodash/fp'
import { inject, observer } from 'mobx-react'
import React, { Component } from 'react'
import { Button, Checkbox, Image, Table } from 'semantic-ui-react'

import { makeDebugger } from '../../common/lib'

const debug = makeDebugger('views:users')

@inject('roleStore')
@inject('userStore')
@observer
class Users extends Component {
  state = {}

  handleToggleRole = (role, user) => () => {
    const hasRole = user.hasRole(role.key)
    debug('handleToggleRole', user.displayName, role, !hasRole)

    if (hasRole) user.removeRole(role.key)
    else user.addRole(role.key)
  }

  toggleDebug = () => this.setState(prevState => ({ showDebug: !prevState.showDebug }))

  render() {
    const { roleStore, userStore } = this.props
    const { showDebug } = this.state

    const otherRoles = roleStore.roleKeys
      .filter(key => roleStore.roles[key].key !== 'approved')
      .map(key => roleStore.roles[key])

    return (
      <div>
        <Button onClick={this.toggleDebug}>Debug</Button>
        <Table compact singleLine>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell collapsing>Approved</Table.HeaderCell>
              <Table.HeaderCell collapsing>User</Table.HeaderCell>
              <Table.HeaderCell collapsing>Email</Table.HeaderCell>
              {_.map(
                role => <Table.HeaderCell key={role.key}>{role.key}</Table.HeaderCell>,
                otherRoles,
              )}
              <Table.HeaderCell>id</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {_.map(user => {
              return (
                <Table.Row key={user.key}>
                  <Table.Cell>
                    <Checkbox
                      toggle
                      checked={!!user.roles.approved}
                      onChange={this.handleToggleRole(roleStore.roles.approved, user)}
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
                          checked={!!role.includesUser(user.key)}
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
        {showDebug && (
          <div>
            <h2>Roles</h2>
            {/*<pre>*/}
            {/*<code>{JSON.stringify(roleStore.asJS, null, 2)}</code>*/}
            {/*</pre>*/}
            <h2>Users</h2>
            <pre>
              <code>{JSON.stringify(userStore.asJS, null, 2)}</code>
            </pre>
          </div>
        )}
      </div>
    )
  }
}

export default Users
