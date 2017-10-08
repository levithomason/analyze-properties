import _ from 'lodash/fp'
import React, { Component } from 'react'
import { connect as reduxConnect } from 'react-redux'
import { firebaseConnect } from 'react-redux-firebase'

import Box from '../../ui/components/Box'
import Container from '../../ui/components/Container'
import Divider from '../../ui/components/Divider'
// import Dropdown from '../../ui/components/Dropdown'
import Loader from '../../ui/components/Loader'
import Image from '../../ui/components/Image'
import Button from '../../ui/components/Button'

import Analyses from '../views/Analyses'
import Logo from '../../common/components/Logo'

const rootStyle = {
  marginLeft: '20em',
  padding: '0 1em',
}

class App extends Component {
  state = {}

  handleLogout = () => {
    const { firebase } = this.props
    firebase.logout()
  }

  render() {
    const { profile = {} } = this.props

    return (
      <div style={rootStyle}>
        <Box row align="center" justify="space-between">
          <Box row align="center" justifySelf="flex-start">
            <Logo /> Analyze Properties
          </Box>
          <Box row align="center" justifySelf="flex-end">
            <Image avatar src={profile.avatarUrl} /> {profile.displayName}
            <Button relaxed="left" onClick={this.handleLogout}>
              Logout
            </Button>
          </Box>
        </Box>

        <Divider />

        <Analyses />
      </div>
    )
  }
}

export default _.flow(
  firebaseConnect(['/analyses']),
  reduxConnect(({ firebase: { auth, authError, data: { analyses }, profile } }) => ({
    auth,
    authError,
    profile,
    analyses: _.get(auth.uid, analyses),
  })),
)(App)
