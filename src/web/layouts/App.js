import React, { createElement, Component } from 'react'
import { withRoute } from 'react-router5'

import Nav from '../components/Nav'
import Login from '../../common/layouts/Login'
import Analyses from '../views/Analyses'
import Settings from '../views/Settings'
import Users from '../views/Users'

const rootStyle = {
  padding: '4em 1em 0 1em',
}

const routeComponents = {
  analyses: Analyses,
  login: Login,
  settings: Settings,
  users: Users,
}

class App extends Component {
  state = {}

  render() {
    const { route } = this.props

    return (
      <div style={rootStyle}>
        <Nav />
        {createElement(routeComponents[route.name])}
      </div>
    )
  }
}

export default withRoute(App)
