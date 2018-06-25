import * as React from 'react'
import { withRoute } from 'react-router5'

import Login from '../../common/layouts/Login'
import { makeDebugger } from '../../common/lib'

import Nav from '../components/Nav'
import Analyses from '../views/Analyses'
import Settings from '../views/Settings'
import Users from '../views/Users'
import ValidRoles from '../views/ValidRoles'

const rootStyle = {
  padding: '5em 1em 0 1em',
}

const routeComponents = {
  analyses: Analyses,
  login: Login,
  settings: Settings,
  users: Users,
  validRoles: ValidRoles,
}

const debug = makeDebugger('layout:app')

class App extends React.Component {
  state = {}

  render() {
    const { route } = this.props
    debug('route', route)

    return (
      <div style={rootStyle}>
        <Nav />
        {React.createElement(routeComponents[route.name])}
      </div>
    )
  }
}

export default withRoute(App)
