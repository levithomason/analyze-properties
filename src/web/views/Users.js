import _ from 'lodash/fp'
import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { Checkbox, Dropdown, Image, Table } from 'semantic-ui-react'

import UserStore from '../../common/models/UserStore'
import * as transport from '../../common/lib/transport'

@observer
class Users extends Component {
  state = {}

  componentDidMount() {
    const tom = UserStore.records.find(u => u.email === 'tomthomason1963@gmail.com')
    tom.startSyncing()

    transport.roles.list().then(roles => {
      this.setState(() => ({ roles }))
    })
  }

  handleRoleChange = user => (e, { value }) => {
    console.log('Users handleRoleChange', user.displayName, value)

    user.setRoles(value)
  }

  setRole = (user, role) => (e, { checked }) => {
    console.log('Users setRole', role, checked)
    user.setRole(role, checked)
  }

  render() {
    const { roles } = this.state
    const approvedRoles = _.find({ id: 'approved' }, roles)
    const superAdminRoles = _.find({ id: 'superAdmin' }, roles)

    return (
      <div>
        {/*<pre>*/}
        {/*<code>{JSON.stringify(roles, null, 2)}</code>*/}
        {/*</pre>*/}
        {/*<pre>*/}
        {/*<code>{JSON.stringify(UserStore.asJSON, null, 2)}</code>*/}
        {/*</pre>*/}
        <Table compact>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell collapsing>Approved</Table.HeaderCell>
              <Table.HeaderCell>User</Table.HeaderCell>
              <Table.HeaderCell>Email</Table.HeaderCell>
              <Table.HeaderCell>roles</Table.HeaderCell>
              <Table.HeaderCell>Super Admin</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {_.map(
              user => (
                <Table.Row key={user.id}>
                  <Table.Cell>
                    <Checkbox
                      toggle
                      checked={_.has(user.id, approvedRoles)}
                      onChange={this.setRole(user, 'approved')}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Image avatar src={user.avatarUrl} /> {user.displayName}
                  </Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                  <Table.Cell>
                    <Dropdown
                      multiple
                      search
                      selection
                      options={_.map(role => ({ text: role, value: role }), [
                        'approved',
                        'superAdmin',
                      ])}
                      onChange={this.handleRoleChange(user)}
                      value={_.keys(_.pickBy(_.identity, user.roles))}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Checkbox checked={_.has(user.id, superAdminRoles)} />
                  </Table.Cell>
                </Table.Row>
              ),
              UserStore.records,
            )}
          </Table.Body>
        </Table>
      </div>
    )
  }
}

export default Users
