import _ from 'lodash/fp'
import React from 'react'
import { firebaseConnect } from 'react-redux-firebase'
import { connect as reduxConnect } from 'react-redux'
import { connect as felaConnect } from 'react-fela'

import Button from '../../ui/components/Button'
import Container from '../../ui/components/Container'
import Divider from '../../ui/components/Divider'
import Header from '../../ui/components/Header'

import App from '../layouts/App'
import LoginLayout from '../../common/layouts/LoginLayout'
import Logo from '../../common/components/Logo'

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

const Root = ({ analyses, firebase, auth, authError, profile, roles, styles }) => {
  const firstName = (_.get('displayName', profile) || '').split(' ')[0]

  return (
    <LoginLayout>
      <App />
    </LoginLayout>
  )
}

export default _.flow(
  felaConnect(styles),
  firebaseConnect(
    ({ auth }) => (auth.uid ? [`/roles/approved/${auth.uid}`, `/analyses/${auth.uid}`] : []),
  ),
  reduxConnect(({ firebase: { auth, authError, data: { analyses, roles }, profile } }) => ({
    analyses: _.get(auth.uid, analyses),
    roles,
    auth,
    authError,
    profile,
  })),
)(Root)
