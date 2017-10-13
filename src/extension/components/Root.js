import _ from 'lodash/fp'
import React, { Component } from 'react'
import { firebaseConnect } from 'react-redux-firebase'
import { connect as reduxConnect } from 'react-redux'

import Loader from '../../ui/components/Loader'
import Login from '../../common/views/Login'
import App from '../views/App'
import * as styles from '../../common/styles'

const sidePanelStyle = styles.sidePanel({ side: 'right' })

const rootStyles = {
  ...sidePanelStyle,
  transition: 'transform 0.3s',
  transitionTimingFunction: 'cubic-bezier(0.2, 1, 0.8, 1)',
  // Realtor.com overrides
  fontWeight: 'normal',
  zIndex: 1000000, // Just beneath the Realtor.com photo modal at 1000040
}

// Realtor.com includes a global MOVE_DATA object which has the property info.
// Extensions are sandboxed and cannot read global window variables, but they can pass messages.
// Inject a script into the page, get MOVE_DATA, and message it back to ourselves.
const getMoveData = () => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.innerHTML = `window.postMessage({ type: "FROM_PAGE", text: JSON.stringify(MOVE_DATA) }, "*")`

    const receiveMessage = event => {
      // We only accept messages from ourselves
      if (event.source !== window) {
        console.debug('MSG: ignoring message not form self:', event)
        return
      }

      if (event.data.type === 'FROM_PAGE') {
        console.debug('Content script received: ' + event.data.text)
        resolve(JSON.parse(event.data.text))
        document.body.removeChild(script)
        window.removeEventListener('message', receiveMessage)
      }
    }

    window.addEventListener('message', receiveMessage, false)

    document.body.appendChild(script)
  })
}

class Root extends Component {
  state = { propertyId: null, isOpen: false }

  componentDidMount() {
    getMoveData()
      .then(moveData => {
        const propertyId = _.get('propertyDetails.property_id', moveData)
        console.debug('Root.componentDidMount:propertyId', propertyId)
        this.setState((prevState, props) => ({ propertyId }))
      })
      .catch(err => {
        throw err
      })

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.type) {
        case 'toggleExtension':
          this.setState(() => ({ isOpen: !this.state.isOpen }))
          break
        default:
          break
      }
    })
  }

  render() {
    console.debug('Root.render() state', this.state)
    console.debug('Root.render() props', this.props)

    const { isOpen, propertyId } = this.state
    const { auth } = this.props

    const style = {
      ...rootStyles,
      // a little more than 100% when out of view to hide the shadow
      transform: `translate3d(${isOpen ? 0 : 110}%, 0, 0)`,
    }

    return (
      <div style={{ ...style }}>
        {!auth.isLoaded ? (
          <Loader active>Waiting for auth...</Loader>
        ) : auth.isEmpty ? (
          <Login />
        ) : !propertyId ? (
          <Loader active>Waiting for property id...</Loader>
        ) : (
          <App propertyId={propertyId} />
        )}
      </div>
    )
  }
}

export default _.flow(
  firebaseConnect(),
  reduxConnect(({ firebase: { auth, authError, profile } }) => ({
    auth,
    authError,
    profile,
  })),
)(Root)
