import _ from 'lodash/fp'
import React, { Component } from 'react'
import { connect as reduxConnect } from 'react-redux'
import { firebaseConnect } from 'react-redux-firebase'

import Logo from '../../common/components/Logo'
import * as rei from '../../common/resources/rei'

import Button from '../../ui/components/Button'
import Divider from '../../ui/components/Divider'
import Header from '../../ui/components/Header'
import Message from '../../ui/components/Message'

const Layout = ({ header = 'Analyze Properties', children }) => {
  const layoutStyle = {
    padding: __EXTENSION__ ? '1em' : 0,
    margin: '0 auto',
    maxWidth: '40em',
    textAlign: 'center',
  }

  return (
    <div style={layoutStyle}>
      <Header color="gray">
        <Logo size="large" />
        <br />
        {header}
      </Header>
      {children}
    </div>
  )
}

class LoginLayout extends Component {
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

  createDefaultCriteria = () => {
    const { auth, firebase } = this.props
    console.log('LoginLayout.createDefaultCriteria()', { uid: auth.uid })

    firebase
      .ref(`/criteria/${auth.uid}`)
      .once('value')
      .then(snapshot => {
        const existingCriteria = snapshot.val()
        console.log('LoginLayout.createDefaultCriteria() existingCriteria', existingCriteria)
        if (!existingCriteria) {
          rei
            .getDefaultCriteria()
            .then(defaultCriteria => {
              console.log('LoginLayout.createDefaultCriteria() defaultCriteria', {
                uid: auth.uid,
                defaultCriteria,
              })
              firebase.set(`/criteria/${auth.uid}`, defaultCriteria)
            })
            .catch(error => {
              console.log('LoginLayout.createDefaultCriteria() error', error)
              throw error
            })
        }
      })
  }

  handleOAuthLogin = provider => () => {
    const { firebase } = this.props

    if (__EXTENSION__) {
      chrome.runtime.sendMessage({ type: `getAuthToken:${provider}` }, response => {
        console.log('CONTENT RESPONSE', JSON.stringify(response, null, 2))
        if (response.error) {
          return this.setState(() => ({ error: response.error }))
        }

        let credential

        switch (provider) {
          case 'google':
            credential = firebase.auth.GoogleAuthProvider.credential(null, response.payload)
            break

          case 'facebook':
            credential = firebase.auth.FacebookAuthProvider.credential(response.payload)
            break

          default:
            break
        }

        firebase
          .login({ credential })
          .then(() => {
            this.createDefaultCriteria()
          })
          .catch(error => {
            this.setState(() => ({ error }))
          })
      })
    } else {
      firebase
        .login({ provider, type: 'popup' })
        .then(() => {
          this.createDefaultCriteria()
        })
        .catch(error => {
          this.setState(() => ({ error }))
        })
    }
  }

  render() {
    const { firebase, analyses, auth, authError, children, profile, roles } = this.props
    const { error } = this.state

    const errorMessage = authError.message || _.get('message', error)

    if (firebase.isInitializing || !auth.isLoaded) return <Layout header="Loading..." />

    if (auth.isEmpty) {
      return (
        <Layout>
          {errorMessage ? (
            <Message status="error">{errorMessage}</Message>
          ) : (
            <p>The fastest and easiest way to analyze real estate investment deals.</p>
          )}

          <Divider hidden />

          <Button fluid={__EXTENSION__} onClick={this.handleOAuthLogin('google')} color="red">
            Sign in with Google
          </Button>
          {__EXTENSION__ && <Divider hidden />}
          <Button fluid={__EXTENSION__} onClick={this.handleOAuthLogin('facebook')} color="blue">
            Sign in with Facebook
          </Button>
          {/*
            <div style={{ textAlign: 'left' }}>
              <Header>errorMessage</Header>
              <pre>
                <code>{JSON.stringify(errorMessage, null, 2)}</code>
              </pre>
              <Header>this.state</Header>
              <pre>
                <code>{JSON.stringify(this.state, null, 2)}</code>
              </pre>
              <Header>this.props</Header>
              <pre>
                <code>{JSON.stringify(this.props, null, 2)}</code>
              </pre>
            </div>
          */}
        </Layout>
      )
    }

    if (!roles) return <Layout header="Checking access..." />

    const isApproved = _.get(['approved', auth.uid], roles)
    const firstName = (_.get('displayName', profile) || '').split(' ')[0]

    if (!isApproved) {
      return (
        <Layout header={_.compact(['Thanks for joining', firstName]).join(', ') + '!'}>
          <p>Your access request is being reviewed.</p>
          <p>
            <a href="javascript:" onClick={firebase.logout}>
              Sign out
            </a>
          </p>
        </Layout>
      )
    }

    if (!__EXTENSION__ && _.isEmpty(analyses)) {
      return (
        <Layout>
          <p>Welcome {firstName}! You don't have any analyzed properties, yet.</p>

          <Divider section />

          <div style={{ textAlign: 'left' }}>
            <Header>Step 1</Header>
            <p>
              You will analyze properties on realtor.com. We provide a Chrome extension which
              integrates with realtor.com.
            </p>
            <p>
              <Button
                color="spring"
                as="a"
                rel="noopener noreferrer"
                target="_blank"
                href="https://chrome.google.com/webstore/detail/ljcmbpgnjhahlfelldijfhpmblmjchhc"
              >
                Install Extension
              </Button>
            </p>

            <Divider hidden />

            <Header>Step 2</Header>
            <p>
              Head over to{' '}
              <a rel="noopener noreferrer" target="_blank" href="https://realtor.com">
                Realtor.com
              </a>{' '}
              and view a property listing, then launch the property analyzer by clicking on the{' '}
              <Logo /> button in your browser extensions.
            </p>
            <p />

            <Divider hidden />

            <Header>Step 3</Header>
            <p>
              Come back to <a href="https://analyze.properties">analyze.properties</a> to see all
              your deals on your dashboard.
            </p>

            <Divider section />
          </div>

          <div style={{ opacity: 0.5 }}>
            <p>
              We currently support {' '}
              <a
                rel="noopener noreferrer"
                target="_blank"
                href="https://www.google.com/chrome/browser/"
              >
                Google Chrome
              </a>.
            </p>
            <p>
              <a
                rel="noopener noreferrer"
                target="_blank"
                href="javascript:"
                onClick={firebase.logout}
              >
                Sign out
              </a>
            </p>
          </div>
        </Layout>
      )
    }

    return React.Children.only(children)
  }
}

export default _.flow(
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
)(LoginLayout)
