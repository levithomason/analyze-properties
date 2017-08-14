import React, { Component } from 'react'
import { firebaseConnect, isEmpty, isLoaded, pathToJS } from 'react-redux-firebase'
import { connect as reduxConnect } from 'react-redux'

import Loader from '../../ui/components/Loader'
// import Login from '../../common/views/Login'
import App from '../views/App'

// TODO this should live somewhere else :/
const waitForPropertyId = () =>
  new Promise((resolve, reject) => {
    console.debug('waitForPropertyId()')

    const getPropertyId = () => {
      // first propertyid element on the page contains the actual id
      const $id = document.querySelector('[data-propertyid]')
      const propertyId = $id && $id.getAttribute('data-propertyid')

      if (!propertyId) {
        console.debug('waitingForPropertyId()')
        setTimeout(getPropertyId, 100)
        return
      }

      resolve(propertyId)
    }

    getPropertyId()
  })

class Root extends Component {
  state = { propertyId: null }

  componentDidMount() {
    waitForPropertyId()
      .then(propertyId => {
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

    // if (!isLoaded(auth)) return <Loader active>Waiting for auth...</Loader>

    // if (isEmpty(auth)) return <Login />

    if (!propertyId) return <Loader active>Waiting for property id...</Loader>

    return <App propertyId={propertyId} />
  }
}

export default _.flow(
  firebaseConnect(),
  reduxConnect(({ firebase }) => ({
    auth: pathToJS(firebase, 'auth'),
    authError: pathToJS(firebase, 'authError'),
    profile: pathToJS(firebase, 'profile'),
  })),
)(Root)
