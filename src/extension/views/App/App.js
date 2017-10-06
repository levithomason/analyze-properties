import React, { Component } from 'react'
import { connect as felaConnect } from 'react-fela'

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
  state = {}

  componentDidMount() {
    document.addEventListener('keydown', this.handleDocumentKeyDown)

    this.setState(prevState => ({
      activeTab: 'Analyze',
      isOpen: true,
    }))
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

  handleTabChange = (e, { activeTab }) => {
    console.debug('App.handleTabChange()')
    return this.setState((prevState, props) => ({ activeTab }))
  }

  render() {
    const { isFetching, isOpen, activeTab } = this.state
    const { propertyId, styles } = this.props

    if (!isOpen) return null

    return (
      <div className={styles.root}>
        <Loader active={isFetching} />
        <Tabs
          onTabChange={this.handleTabChange}
          activeTab={activeTab}
          panes={[
            { menuItem: 'Analyze', render: () => <Analyze propertyId={propertyId} /> },
            { menuItem: 'Criteria', render: () => <Criteria /> },
            { menuItem: 'Debug', render: () => <Debug propertyId={propertyId} /> },
          ]}
        />
      </div>
    )
  }
}

export default felaConnect(rules)(App)
