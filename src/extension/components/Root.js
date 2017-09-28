import _ from 'lodash/fp'
import React, { Component } from 'react'
import { firebaseConnect } from 'react-redux-firebase'
import { connect as reduxConnect } from 'react-redux'

import Loader from '../../ui/components/Loader'
import Login from '../../common/views/Login'
import App from '../views/App'

// Add postMessage support when running as an extension
// if (chrome.runtime.id) {
//   const port = chrome.runtime.connect(chrome.runtime.id)
//
//   const receiveMessage = event => {
//     // We only accept messages from ourselves
//     if (event.source !== window) {
//       console.debug('MSG: ignoring message not form self:', event)
//       return
//     }
//
//     if (event.data.type === 'FROM_PAGE') {
//       console.debug('Content script received: ' + event.data.text)
//       port.postMessage(event.data.text)
//     }
//   }
//
//   window.addEventListener('message', receiveMessage, false)
//
//   const script = document.createElement('script')
//   script.innerHTML = `window.postMessage({ type: "FROM_PAGE", text: JSON.stringify(MOVE_DATA) }, "*")`
//   document.body.appendChild(script)
// }

// TODO this should live somewhere else :/
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
  state = { propertyId: null }

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
  }

  render() {
    const { propertyId } = this.state
    const { auth, authError, profile } = this.props

    console.debug('Root.render() state', this.state)
    console.debug('Root.render() props', this.props)

    if (!auth.isLoaded) return <Loader active>Waiting for auth...</Loader>

    if (auth.isEmpty) return <Login />

    // if (!propertyId) return <Loader active>Waiting for property id...</Loader>

    return <App propertyId={propertyId} />
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
