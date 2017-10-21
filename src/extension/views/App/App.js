import _ from 'lodash/fp'
import React, { Component } from 'react'
import { connect as felaConnect } from 'react-fela'
import { connect as reduxConnect } from 'react-redux'
import { firebaseConnect } from 'react-redux-firebase'

import Loader from '../../../ui/components/Loader'
import Tabs from '../../../ui/components/Tabs'
import keyboardKey from 'keyboard-key'

import Analyze from '../../../common/views/Analyze'
import Debug from '../Debug'
import Criteria from '../Criteria'

const rules = {
  root: props => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflowY: 'auto',
  }),
}

class App extends Component {
  state = {
    isOpen: true,
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleDocumentKeyDown)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleDocumentKeyDown)
  }

  handleDocumentKeyDown = e => {
    const key = keyboardKey.getKey(e)

    if (key === '=') {
      this.setState(prevState => ({ isOpen: !prevState.isOpen }))
    }
  }

  render() {
    const { isOpen } = this.state
    const { propertyId, styles } = this.props

    if (!isOpen) return null

    return (
      <div className={styles.root}>
        <AnalyzeTabs propertyId={propertyId} />
      </div>
    )
  }
}

export default _.flow(
  felaConnect(rules),
  firebaseConnect(['/roles']),
  reduxConnect(({ firebase: { auth, authError, data: { analyses, roles }, profile } }) => ({
    isSuperAdmin: _.get(['superAdmin', auth.uid], roles),
  })),
)(App)
