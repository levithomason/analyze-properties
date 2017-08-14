import React, { Component } from 'react'

import Loader from '../../../ui/components/Loader'
import Tabs from '../../../ui/components/Tabs'

import LogoutButton from '../../../common/components/LogoutButton'
import * as rei from '../../../common/resources/rei'

import Analyze from '../Analyze'
import Debug from '../Debug'
import Settings from '../Settings'

export const appStyle = {
  position: 'fixed',
  display: 'flex',
  flexDirection: 'column',
  width: '23em',
  height: '100%',
  top: '0',
  bottom: '0',
  right: '0',
  overflowY: 'scroll',
  background: '#FFF',
  boxShadow: '-0.5em 0 1em rgba(0, 0, 0, 0.25)',
  zIndex: '999999',
}

class App extends Component {
  state = {}

  componentDidMount() {
    document.addEventListener('keydown', this.handleDocumentKeyDown)

    this.setState((prevState) => ({
      activeTab: 'Analyze',
      isOpen: true,
    }))
  }

  handleDocumentKeyDown = e => {
    if (e.keyCode === 27) {
      this.setState((prevState) => ({ isOpen: !prevState.isOpen }))
    }
  }

  handleTabChange = (e, { activeTab }) => {
    console.debug('App.handleTabChange()')
    return this.setState((prevState, props) => ({ activeTab }))
  }

  render() {
    const { isFetching, isOpen, activeTab } = this.state
    const { propertyId } = this.props
    console.debug('App.render()')

    if (!isOpen) return null

    return (
      <div style={appStyle}>
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

export default App
