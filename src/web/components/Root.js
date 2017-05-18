import _ from 'lodash/fp'
import React from 'react'
import { firebaseConnect, isEmpty, isLoaded, pathToJS } from 'react-redux-firebase'
import { connect as reduxConnect } from 'react-redux'

import Loader from '../../ui/components/Loader'
import Login from '../../common/views/Login'
import Analyses from '../views/Analyses'

const Root = ({ auth, authError, profile }) => {
  if (!isLoaded(auth)) return <Loader active />

  if (isEmpty(auth)) return <Login />

  return <Analyses />
}

export default _.flow(
  firebaseConnect(),
  reduxConnect(({ firebase }) => ({
    auth: pathToJS(firebase, 'auth'),
    authError: pathToJS(firebase, 'authError'),
    profile: pathToJS(firebase, 'profile'),
  })),
)(Root)
