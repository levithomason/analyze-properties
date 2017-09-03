import React, { Component } from 'react'
import { connect as felaConnect } from 'react-fela'

import Loader from '../../../ui/components/Loader'
import Tabs from '../../../ui/components/Tabs'

import LogoutButton from '../../../common/components/LogoutButton'

import Analyze from '../Analyze'
import Debug from '../Debug'
import Settings from '../Settings'

const rules = {
  root: props => ({
    position: 'fixed',
    display: 'flex',
    flexDirection: 'column',
    width: '23em',
    top: '0',
    bottom: '0',
    right: '0',
    overflowY: 'auto',
    background: '#FFF',
    boxShadow: '-0.5em 0 1em rgba(0, 0, 0, 0.25)',
    zIndex: '999999',
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

  handleDocumentKeyDown = e => {
    if (e.keyCode === 27) {
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
    console.debug('App.render()')

    if (!isOpen) return null

    return (
      <div className={styles.root}>
        <Loader active={isFetching} />
        <Tabs
          onTabChange={this.handleTabChange}
          activeTab={activeTab}
          panes={[
            { menuItem: 'Analyze', render: () => <Analyze propertyId={propertyId} /> },
            { menuItem: 'Settings', render: () => <Settings /> },
            { menuItem: 'Debug', render: () => <Debug propertyId={propertyId} /> },
          ]}
        />
        <LogoutButton fluid />
      </div>
    )
  }
}

export default felaConnect(rules)(App)
