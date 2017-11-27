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

  // componentDidMount() {
  //   this.updateUsers()
  // }

  // componentWillReceiveProps(nextProps) {
  //   this.updateUsers()
  // }

  // updateUsers = () => {
  //   debug('updateUsers')
  //   const { userStore } = this.props
  //
  //   const promises = _.map(userModel => {
  //     return userModel.fetchRoles().then(roles => ({
  //       user: userModel,
  //       roles,
  //     }))
  //   }, userStore.models)
  //
  //   Promise.all(promises).then(usersWithRoles => {
  //     debug('updateUsers results', usersWithRoles)
  //     this.setState(() => ({ usersWithRoles }))
  //   })
  // }

  handleToggleRole = (user, role) => () => {
    user.isInRole(role).then(hasRole => {
      debug('handleToggleRole', user.displayName, role, !hasRole)

      if (hasRole) user.removeFromRole(role)
      else user.addToRole(role)
    })
  }

  toggleDebug = () => this.setState(prevState => ({ showDebug: !prevState.showDebug }))

  render() {
    const { userStore } = this.props
    const { showDebug } = this.state

    const otherRoles = userStore.models
      .reduce((acc, next) => _.union(acc, _.keys(next.data)), [])
      .filter(role => role !== 'approved')

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
            {_.map(user => {
              return (
                <Table.Row key={user.id}>
                  <Table.Cell>
                    <Checkbox
                      toggle
                      checked={!!user.data.approved}
                      onChange={this.handleToggleRole(user, 'approved')}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Image avatar src={user.photoURL} /> {user.displayName}
                  </Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                  {_.map(
                    role => (
                      <Table.Cell key={role}>
                        <Checkbox
                          checked={!!user.data[role]}
                          onChange={this.handleToggleRole(user, role)}
                        />
                      </Table.Cell>
                    ),
                    otherRoles,
                  )}
                  <Table.Cell>{user.id}</Table.Cell>
                </Table.Row>
              )
            }, userStore.models)}
          </Table.Body>
        </Table>
        {showDebug && (
          <div>
            <h2>Roles</h2>
            {/*<pre>*/}
            {/*<code>{JSON.stringify(roleStore.asJSON, null, 2)}</code>*/}
            {/*</pre>*/}
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
