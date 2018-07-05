import _ from 'lodash/fp'
import { inject, observer } from 'mobx-react'
import * as React from 'react'

import Button from '../../ui/components/Button'
import Divider from '../../ui/components/Divider'
import Header from '../../ui/components/Header'
import Message from '../../ui/components/Message'

import Logo from '../components/Logo'
import router from '../router'
import { default as roleStore, RoleStore } from '../stores/roleStore'
import { SessionStore } from '../stores/sessionStore'
import { AnalysesStore } from '../stores/analysesStore'

interface ILayoutProps {
  header?: string
  children?: React.ReactNode
}

const Layout: React.SFC<ILayoutProps> = ({ header, children }) => {
  const layoutStyle = {
    padding: process.env.EXTENSION ? '1em' : 0,
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

Layout.defaultProps = { header: 'Analyze Properties' }

interface ILoginProps {
  analysesStore: AnalysesStore
  roleStore: RoleStore
  sessionStore: SessionStore
}

@inject('analysesStore')
@inject('roleStore')
@inject('sessionStore')
@observer
class Login extends React.Component<ILoginProps> {
  state = {
    error: null,
    user: null,
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.isApproved()) {
      router.navigate('analyses')
    }
  }

  // TODO this creates default Criteria as part of the sign up process, ideally a server side op
  // createDefaultCriteria = () => {
  //   const { auth, firebase } = this.props
  //   console.log('Login.createDefaultCriteria()', { uid: auth.uid })
  //
  //   firebase
  //     .ref(`/criteria/${auth.uid}`)
  //     .once('value')
  //     .then(snapshot => {
  //       const existingCriteria = snapshot.val()
  //       console.log('Login.createDefaultCriteria() existingCriteria', existingCriteria)
  //       if (!existingCriteria) {
  //         rei
  //           .getDefaultCriteria()
  //           .then(defaultCriteria => {
  //             console.log('Login.createDefaultCriteria() defaultCriteria', {
  //               uid: auth.uid,
  //               defaultCriteria,
  //             })
  //             firebase.set(`/criteria/${auth.uid}`, defaultCriteria)
  //           })
  //           .catch(error => {
  //             console.log('Login.createDefaultCriteria() error', error)
  //             throw error
  //           })
  //       }
  //     })
  // }

  handleOAuthLogin = provider => () => {
    const { sessionStore } = this.props

    sessionStore.login(provider)

    // TODO finish porting this flow to the session store flow
    // TODO default criteria need to be created still
    //
    // const { firebase } = this.props
    //
    // if (process.env.EXTENSION) {
    //   chrome.runtime.sendMessage({ type: `getAuthToken:${provider}` }, response => {
    //     console.log('CONTENT RESPONSE', JSON.stringify(response, null, 2))
    //     if (response.error) {
    //       return this.setState(() => ({ error: response.error }))
    //     }
    //
    //     let credential
    //
    //     switch (provider) {
    //       case 'google':
    //         credential = firebase.auth.GoogleAuthProvider.credential(null, response.payload)
    //         break
    //
    //       case 'facebook':
    //         credential = firebase.auth.FacebookAuthProvider.credential(response.payload)
    //         break
    //
    //       default:
    //         break
    //     }
    //
    //     firebase
    //       .login({ credential })
    //       .then(() => {
    //         this.createDefaultCriteria()
    //       })
    //       .catch(error => {
    //         this.setState({ error })
    //       })
    //   })
    // } else {
    //   firebase
    //     .login({ provider, type: 'popup' })
    //     .then(() => {
    //       this.createDefaultCriteria()
    //     })
    //     .catch(error => {
    //       this.setState({ error })
    //     })
    // }
  }

  isApproved = () => {
    const {
      roleStore,
      sessionStore: { currentUser },
    } = this.props

    return currentUser && roleStore.isUserInRole(currentUser.key, 'approved')
  }

  render() {
    const { analysesStore, roleStore, sessionStore } = this.props

    if (!sessionStore.currentUser || sessionStore.errorMessage) {
      return (
        <Layout>
          {sessionStore.errorMessage ? (
            <Message status="error">{sessionStore.errorMessage}</Message>
          ) : (
            <p>The fastest and easiest way to analyze real estate investment deals.</p>
          )}

          <Divider hidden />

          <Button
            fluid={process.env.EXTENSION}
            onClick={this.handleOAuthLogin('google')}
            color="red"
          >
            Sign in with Google
          </Button>
          {process.env.EXTENSION && <Divider hidden />}
          <Button
            fluid={process.env.EXTENSION}
            onClick={this.handleOAuthLogin('facebook')}
            color="blue"
          >
            Sign in with Facebook
          </Button>
        </Layout>
      )
    }

    if (!roleStore.rolesById.approved) return <Layout header="Checking access..." />

    if (!this.isApproved()) {
      return (
        <Layout
          header={
            _.compact(['Thanks for joining', sessionStore.currentUser.firstName]).join(', ') + '!'
          }
        >
          <p>Your access request is being reviewed.</p>
          <p>
            <a href="javascript:" onClick={sessionStore.logout}>
              Sign out
            </a>
          </p>
        </Layout>
      )
    }

    if (!process.env.EXTENSION && _.isEmpty(analysesStore.analyses)) {
      return (
        <Layout>
          <p>
            Welcome {sessionStore.currentUser.firstName}! You don't have any analyzed properties,
            yet.
          </p>

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
              We currently support{' '}
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
                onClick={sessionStore.logout}
              >
                Sign out
              </a>
            </p>
          </div>
        </Layout>
      )
    }

    return <Layout>...redirecting</Layout>
  }
}

export default Login
