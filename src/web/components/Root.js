import _ from 'lodash/fp'
import React from 'react'
import { firebaseConnect, isEmpty, isLoaded } from 'react-redux-firebase'
import { connect as reduxConnect } from 'react-redux'
import { connect as felaConnect } from 'react-fela'

import Header from '../../ui/components/Header'
import Loader from '../../ui/components/Loader'
import Login from '../../common/views/Login'
import Analyses from '../views/Analyses'
import logo from '../public/icon128.png'

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

const Root = ({ auth, authError, profile, styles }) => {
  return (
    <div className={styles.root}>
      <Header color="gray">
        <img width="64" src={logo} alt="Analyze Properties" />
        <br />
        Analyze Properties
      </Header>
      <p>The fastest and easiest way to analyze real estate investment deals.</p>
    </div>
  )

  if (!isLoaded(auth)) return <Loader active />

  if (isEmpty(auth)) return <Login />

  // TODO, get extension auth working, re-enable auth then the web app
  return <Analyses />
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
