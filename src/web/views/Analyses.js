import _ from 'lodash/fp'
import React, { Component } from 'react'
import { connect as reduxConnect } from 'react-redux'
import { firebaseConnect } from 'react-redux-firebase'

import Box from '../../ui/components/Box'
import Container from '../../ui/components/Container'
import Divider from '../../ui/components/Divider'
// import Dropdown from '../../ui/components/Dropdown'
import Grid from '../../ui/components/Grid'
import Header from '../../ui/components/Header'
import Image from '../../ui/components/Image'
import Button from '../../ui/components/Button'

import AnalysesTable from '../../common/components/AnalysesTable'
import Analyze from '../../common/views/Analyze'

class Analysis extends Component {
  state = {}

  handleLogout = () => {
    const { firebase } = this.props
    firebase.logout()
  }

  handleRowClick = (e, { analysis }) => {
    this.setState(() => ({ selectedPropertyId: analysis.propertyId }))
  }

  render() {
    const { profile = {} } = this.props
    const { selectedPropertyId } = this.state

    return (
      <Container>
        <Box row align="center" justify="flex-end">
          <Image avatar src={profile.avatarUrl} /> {profile.displayName}
          <Button relaxed="left" onClick={this.handleLogout}>
            Logout
          </Button>
        </Box>
        <Divider hidden section />
        <Grid>
          <Grid.Column>
            <AnalysesTable
              selectedPropertyId={selectedPropertyId}
              onRowClick={this.handleRowClick}
            />
          </Grid.Column>
          {selectedPropertyId && (
            <Grid.Column style={{ flex: '0 0 auto', width: '20em' }}>
              <Analyze favorite={false} search={false} propertyId={selectedPropertyId} />
            </Grid.Column>
          )}
        </Grid>
      </Container>
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
