import _ from 'lodash/fp'
import React, { Component } from 'react'
import { connect as felaConnect } from 'react-fela'
import { connect as reduxConnect } from 'react-redux'
import { firebaseConnect } from 'react-redux-firebase'

import Tabs from '../../../ui/components/Tabs'

import Analyze from './Analyze'
import Debug from './Debug'
import Criteria from './Criteria'

const rules = {
  root: props => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflowY: 'auto',
  }),
}

class AnalyzeTabs extends Component {
  state = {
    activeTab: 'Analyze',
  }

  handleTabChange = (e, { activeTab }) => {
    console.debug('AnalyzeTabs.handleTabChange()')
    return this.setState(() => ({ activeTab }))
  }

  render() {
    const { activeTab } = this.state
    const { isSuperAdmin, propertyId, styles } = this.props

    return (
      <div className={styles.root}>
        <Tabs
          onTabChange={this.handleTabChange}
          activeTab={activeTab}
          panes={[
            { menuItem: 'Analyze', render: () => <Analyze propertyId={propertyId} /> },
            { menuItem: 'Criteria', render: () => <Criteria /> },
            isSuperAdmin && { menuItem: 'Debug', render: () => <Debug propertyId={propertyId} /> },
          ].filter(Boolean)}
        />
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
)(AnalyzeTabs)
