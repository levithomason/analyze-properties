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

import AnalysesTable from '../../common/components/AnalysesTable'
import Analyze from '../../common/views/Analyze'

const analyzeStyle = {
  position: 'fixed',
  top: 0,
  bottom: 0,
  left: 0,
  width: '20em',
  background: '#FFF',
  boxShadow: '0 0 1em rgba(0, 0, 0, 0.2)',
  overflowY: 'scroll',
}

const rootStyle = {
  marginLeft: analyzeStyle.width,
  padding: '0 1em',
}

class Analysis extends Component {
  state = {}

  handleLogout = () => {
    const { firebase } = this.props
    firebase.logout()
  }

  handleRowClick = (e, { analysis }) => {
    this.setState(() => ({ selectedPropertyId: analysis.propertyId }))
  }

  handleInitialSort = (e, { analyses }) => {
    if (!this.state.selectedPropertyId) {
      this.setState(() => ({ selectedPropertyId: _.get('propertyId', _.head(analyses)) }))
    }
  }

  render() {
    const { profile = {} } = this.props
    const { selectedPropertyId } = this.state

    return (
      <div style={rootStyle}>
        <Box row align="center" justify="flex-end">
          <Image avatar src={profile.avatarUrl} /> {profile.displayName}
          <Button relaxed="left" onClick={this.handleLogout}>
            Logout
          </Button>
        </Box>
        <Divider hidden />
        <AnalysesTable
          selectedPropertyId={selectedPropertyId}
          onRowClick={this.handleRowClick}
          onInitialSort={this.handleInitialSort}
        />

        <div style={analyzeStyle}>
          <Analyze propertyId={selectedPropertyId} />
        </div>
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
)(Analysis)
