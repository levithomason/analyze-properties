import _ from 'lodash/fp'
import React from 'react'
import { firebaseConnect } from 'react-redux-firebase'
import { connect as reduxConnect } from 'react-redux'
import { connect as felaConnect } from 'react-fela'

import Login from '../../common/views/Login'
import Loader from '../../ui/components/Loader'
import App from '../layouts/App'

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
  return <App />
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
