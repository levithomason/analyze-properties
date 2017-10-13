import _ from 'lodash'
import React, { Component } from 'react'
import { connect as reduxConnect } from 'react-redux'
import { firebaseConnect } from 'react-redux-firebase'

import Logo from '../../common/components/Logo'

import Button from '../../ui/components/Button'
import Divider from '../../ui/components/Divider'
import Header from '../../ui/components/Header'
import Message from '../../ui/components/Message'

class Login extends Component {
  state = {
    error: null,
    user: null,
  }

  logout = () => {
    const { firebase } = this.props

    firebase.logout().then(
      () => {
        this.setState(() => ({ error: null }))
      },
      error => {
        this.setState(() => ({ error }))
      },
    )
  }

  handleOAuthLogin = provider => () => {
    const { firebase } = this.props

    if (__EXTENSION__) {
      chrome.runtime.sendMessage({ type: 'getAuthToken' }, response => {
        const credential = firebase.auth.GoogleAuthProvider.credential(null, response.payload)
        firebase.auth().signInWithCredential(credential)
      })
    } else {
      firebase.login({ provider, type: 'popup' }).catch(error => {
        this.setState(() => ({ error }))
      })
    }
  }

  render() {
    const { authError } = this.props

    return (
      <div style={{ margin: '0 auto', maxWidth: '40em', textAlign: 'center' }}>
        <Header color="gray">
          <Logo size={64} />
          <br />
          Analyze Properties
        </Header>
        {!authError.message && (
          <p>The fastest and easiest way to analyze real estate investment deals.</p>
        )}

        {authError.message && <Message status="error">{authError.message}</Message>}
        <Divider hidden />

        <Button onClick={this.handleOAuthLogin('google')} color="red">
          Sign in with Google
        </Button>
        <Button onClick={this.handleOAuthLogin('facebook')} color="blue">
          Sign in with Facebook
        </Button>
      </div>
    )
  }
}

export default _.flow(
  firebaseConnect(),
  reduxConnect(({ firebase: { authError } }) => ({
    authError,
  })),
)(Login)
