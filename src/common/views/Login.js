import _ from 'lodash'
import React, { Component } from 'react'
import { connect as reduxConnect } from 'react-redux'
import { firebaseConnect } from 'react-redux-firebase'

import Button from '../../ui/components/Button'
import Container from '../../ui/components/Container'
import Divider from '../../ui/components/Divider'
import Header from '../../ui/components/Header'
import Message from '../../ui/components/Message'
import Box from '../../ui/components/Box'

// TODO pending react-redux-firebase 2.x
import firebaseui from 'firebaseui'

class Login extends Component {
  state = {
    accessToken: null,
    error: null,
    user: null,
    signInSuccessCalled: null,
    uiShownCalled: null,
  }

  componentDidMount() {
    const { firebase } = this.props

    this.authUI = new firebaseui.auth.AuthUI(firebase.auth())

    this.authUI.start('#firebaseui-auth', {
      signInFlow: 'popup',
      callbacks: {
        signInSuccess: user => {
          this.setState(() => ({ user, signInSuccessCalled: true }))
          return false
        },
        uiShown: () => {
          this.setState(() => ({ uiShownCalled: true }))
        },
      },
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
      ],
    })
  }

  componentWillUnmount() {
    this.authUI.reset()
  }

  logout = () => {
    const { firebase } = this.props

    firebase
      .auth()
      .signOut()
      .then(
        () => this.setState(() => ({ error: null, user: null })),
        error => this.setState(() => ({ error })),
      )
  }

  handleOAuthLogin = provider => () => {
    const { firebase } = this.props

    firebase.login({ provider, type: 'popup' }).catch(err => {
      throw err
    })
  }

  render() {
    const { authError } = this.props

    // TODO remove once auth is enabled
    // return (
    //   <Container
    //     style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}
    //   >
    //     <Header as="h1" color="gray" textAlign="center">
    //       Under Construction
    //     </Header>
    //   </Container>
    // )

    return (
      <Container>
        {/* <div id="firebaseui-auth" /> */}
        <Box padded style={{ margin: '0 auto', width: 290 }}>
          <Header as="h3" color="gray">
            Analyze Properties
          </Header>

          {authError && <Message status="error">{authError.message}</Message>}
          <Divider hidden section />

          <Button fluid onClick={this.handleOAuthLogin('google')} inverted color="red">
            Sign in with Google
          </Button>
          <Divider hidden />
          <Button fluid onClick={this.handleOAuthLogin('facebook')} inverted color="blue">
            Sign in with Facebook
          </Button>
          {/*<pre><code>{JSON.stringify(this.props, null, 2)}</code></pre>*/}
          <pre>
            <code>{JSON.stringify(this.state, null, 2)}</code>
          </pre>
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
