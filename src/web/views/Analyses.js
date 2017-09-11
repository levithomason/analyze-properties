import _ from 'lodash/fp'
import React, { Component } from 'react'
import { connect as reduxConnect } from 'react-redux'
import { firebaseConnect } from 'react-redux-firebase'

import Container from '../../ui/components/Container'
import Divider from '../../ui/components/Divider'
// import Dropdown from '../../ui/components/Dropdown'
import Header from '../../ui/components/Header'
import Image from '../../ui/components/Image'
import Button from '../../ui/components/Button'

import AnalysesTable from '../../common/components/AnalysesTable'

class Analysis extends Component {
  handleLogout = () => {
    const { firebase } = this.props
    firebase.logout()
  }

  render() {
    const { profile = {} } = this.props

    return (
      <Container>
        <Button onClick={this.handleLogout()}>
          <Image bordered avatar src={profile.avatarUrl} /> {profile.displayName}
        </Button>

        <Divider hidden section />
        <Divider hidden />

        <Header as="h1" textAlign="center" content="Favorites" />
        <AnalysesTable filter={_.get('favorite')} />

        <Header as="h1" textAlign="center" content="Others" />
        <AnalysesTable filter={_.negate(_.get('favorite'))} />
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
    analyses,
  })),
)(Analysis)
