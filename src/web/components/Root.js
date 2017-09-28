import _ from 'lodash/fp'
import React from 'react'
import { firebaseConnect } from 'react-redux-firebase'
import { connect as reduxConnect } from 'react-redux'
import { connect as felaConnect } from 'react-fela'

import Logo from '../../common/components/Logo'
import Login from '../../common/views/Login'
import Header from '../../ui/components/Header'
import Loader from '../../ui/components/Loader'
import Analyses from '../views/Analyses'

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

const Root = ({ firebase, auth, authError, profile, styles }) => {
  if (firebase.isInitializing || !auth.isLoaded) return <Loader active />

  if (auth.isEmpty) return <Login />

  // TODO, get extension auth working, re-enable auth then the web app
  return <Analyses />

  return (
    <div className={styles.root}>
      <Header color="gray">
        <Logo size={64} />
        <br />
        Analyze Properties
      </Header>
      <p>The fastest and easiest way to analyze real estate investment deals.</p>
    </div>
  )
}

export default _.flow(
  felaConnect(styles),
  firebaseConnect(),
  reduxConnect(({ firebase: { auth, authError, profile } }) => ({
    auth,
    authError,
    profile,
  })),
)(Root)
