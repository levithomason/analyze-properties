import _ from 'lodash/fp'
import React from 'react'
import { firebaseConnect } from 'react-redux-firebase'
import { connect as reduxConnect } from 'react-redux'
import { connect as felaConnect } from 'react-fela'

import Container from '../../ui/components/Container'
import Login from '../../common/views/Login'
import App from '../layouts/App'
import Logo from '../../common/components/Logo'
import Header from '../../ui/components/Header'

const styles = {
  root: props => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'start',
    paddingTop: '20vh',
    width: '100%',
    height: '100%',
    textAlign: 'center',
  }),
}

const Layout = ({ header = 'Analyze Properties', children }) => (
  <Container>
    <div style={{ margin: '0 auto', width: '40em', textAlign: 'center' }}>
      <Header color="gray">
        <Logo size={64} />
        <br />
        {header}
      </Header>
      {children}
    </div>
  </Container>
)

const Root = ({ firebase, auth, authError, profile, roles, styles }) => {
  if (firebase.isInitializing || !auth.isLoaded) return <Layout header="Loading..." />

  if (auth.isEmpty) return <Login />

  if (!roles) return <Layout header="Checking access..." />

  const isApproved = _.get(['approved', auth.uid], roles)

  if (!isApproved) {
    const firstName = (_.get('displayName', profile) || '').split(' ')[0]

    return (
      <Layout header={_.compact(['Thanks for joining', firstName]).join(', ') + '!'}>
        <p>Your access request is being reviewed.</p>
        <p>
          <a onClick={firebase.logout}>Sign in with another account</a>
        </p>
      </Layout>
    )
  }

  // TODO, get extension auth working, re-enable auth then the web app
  return <App />
}

export default _.flow(
  felaConnect(styles),
  firebaseConnect(({ auth }) => (auth.uid ? [`/roles/approved/${auth.uid}`] : [])),
  reduxConnect(({ firebase: { auth, authError, data: { roles }, profile } }) => ({
    roles,
    auth,
    authError,
    profile,
  })),
)(Root)
