import _ from 'lodash/fp'
import { inject, observer } from 'mobx-react'
import React, { Component } from 'react'
import { Button, Checkbox, Image, Table } from 'semantic-ui-react'

@inject('roleStore')
@inject('userStore')
@observer
class Users extends Component {
  state = {}

  componentDidMount() {
    const { roleStore, userStore } = this.props
    userStore.fetch()
    roleStore.fetch()
  }

  handleToggleRole = (user, role) => () => {
    const hasRole = user.isInRole(role)
    console.log('Users handleToggleRole', user.displayName, role, !hasRole)

    if (hasRole) user.fromFromRole(role)
    else user.addToRole(role)
  }

  toggleDebug = () => this.setState(prevState => ({ debug: !prevState.debug }))

  render() {
    const { roleStore, userStore } = this.props
    const { debug } = this.state

    const otherRoles = roleStore.roleIds.filter(id => id !== 'approved')

    return (
      <div>
        <Button onClick={this.toggleDebug}>Debug</Button>
        <Table compact singleLine>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell collapsing>Approved</Table.HeaderCell>
              <Table.HeaderCell collapsing>User</Table.HeaderCell>
              <Table.HeaderCell collapsing>Email</Table.HeaderCell>
              {_.map(role => <Table.HeaderCell key={role}>{role}</Table.HeaderCell>, otherRoles)}
              <Table.HeaderCell>id</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {_.map(
              user => (
                <Table.Row key={user.id}>
                  <Table.Cell>
                    <Checkbox
                      toggle
                      checked={user.isInRole('approved')}
                      onChange={this.handleToggleRole(user, 'approved')}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Image avatar src={user.avatarUrl} /> {user.displayName}
                  </Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                  {_.map(
                    role => (
                      <Table.Cell key={role}>
                        <Checkbox
                          checked={user.isInRole(role)}
                          onChange={this.handleToggleRole(user, role)}
                        />
                      </Table.Cell>
                    ),
                    otherRoles,
                  )}
                  <Table.Cell>{user.id}</Table.Cell>
                </Table.Row>
              ),
              userStore.records,
            )}
          </Table.Body>
        </Table>
        {debug && (
          <div>
            <h2>Roles</h2>
            <pre>
              <code>{JSON.stringify(roleStore.asJSON, null, 2)}</code>
            </pre>
            <h2>Users</h2>
            <pre>
              <code>{JSON.stringify(userStore.asJSON, null, 2)}</code>
            </pre>
          </div>
        )}
      </div>
    )
  }
}

export default Users
