import _ from 'lodash'
import React, { Component } from 'react'
import { connect as reduxConnect } from 'react-redux'
import { firebaseConnect } from 'react-redux-firebase'

import Logo from '../../common/components/Logo'

import Button from '../../ui/components/Button'
import Container from '../../ui/components/Container'
import Divider from '../../ui/components/Divider'
import Header from '../../ui/components/Header'
import Message from '../../ui/components/Message'
import Box from '../../ui/components/Box'

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

    // TODO extension action button popup only
    // chrome.identity.getAuthToken({ interactive: true }, token => {
    //   const credential = firebase.auth.GoogleAuthProvider.credential(null, token)
    //   firebase.auth().signInWithCredential(credential)
    // })

    // TODO web only
    firebase.login({ provider, type: 'popup' }).catch(error => {
      this.setState(() => ({ error }))
    })
  }

  render() {
    const { authError } = this.props

    return (
      <Container>
        <Box padded style={{ margin: '0 auto', width: 290, textAlign: 'center' }}>
          <Header color="gray">
            <Logo size={64} />
            <br />
            Analyze Properties
          </Header>
          <p>The fastest and easiest way to analyze real estate investment deals.</p>

          {authError.message && <Message status="error">{authError.message}</Message>}
          <Divider hidden />

          <Button fluid onClick={this.handleOAuthLogin('google')} color="red">
            Sign in with Google
          </Button>
          <Divider hidden />
          <Button fluid onClick={this.handleOAuthLogin('facebook')} color="blue">
            Sign in with Facebook
          </Button>
          {/*
          <pre>
            props = <code>{JSON.stringify(this.props, null, 2)}</code>
          </pre>
          <pre>
            state = <code>{JSON.stringify(this.state, null, 2)}</code>
          </pre>
          */}
        </Box>
      </Container>
    )
  }
}

export default _.flow(
  firebaseConnect(),
  reduxConnect(({ firebase: { authError } }) => ({
    authError,
  })),
)(Login)
