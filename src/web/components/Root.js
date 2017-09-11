import _ from 'lodash/fp'
import React from 'react'
import { firebaseConnect, isEmpty, isLoaded } from 'react-redux-firebase'
import { connect as reduxConnect } from 'react-redux'

import Loader from '../../ui/components/Loader'
import Login from '../../common/views/Login'
import Analyses from '../views/Analyses'

const Root = ({ auth, authError, profile }) => {
  if (!isLoaded(auth)) return <Loader active />

  if (isEmpty(auth)) return <Login />

  return <Loader active>Under construction...</Loader>

  // TODO, get extension auth working, re-enable auth then the web app
  // return <Analyses />
}

export default _.flow(
  firebaseConnect(),
  reduxConnect(({ firebase: { auth, authError, profile } }) => ({
    auth,
    authError,
    profile,
  })),
)(Root)
