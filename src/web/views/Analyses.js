import _ from 'lodash/fp'
import React, { Component } from 'react'

import AnalysesTable from '../../common/components/AnalysesTable'
import Analyze from '../../common/views/Analyze'

const analyzeStyle = {
  position: 'fixed',
  top: 0,
  bottom: 0,
  left: 0,
  width: '20em',
  background: '#FFF',
  boxShadow: '0 0 1em rgba(0, 0, 0, 0.2)',
  height: '100vh',
}

const rootStyle = {
  padding: '0 1em',
}

class Analyses extends Component {
  state = {}

  handleRowClick = (e, { analysis }) => {
    this.setState(() => ({ selectedPropertyId: analysis.propertyId }))
  }

  handleInitialSort = (e, { analyses }) => {
    if (!this.state.selectedPropertyId) {
      this.setState(() => ({ selectedPropertyId: _.get('propertyId', _.head(analyses)) }))
    }
  }

  render() {
    const { selectedPropertyId } = this.state

    return (
      <div style={rootStyle}>
        <AnalysesTable
          selectedPropertyId={selectedPropertyId}
          onRowClick={this.handleRowClick}
          onInitialSort={this.handleInitialSort}
        />

        <div style={analyzeStyle}>
          <Analyze propertyId={selectedPropertyId} />
        </div>
      </div>
    )
  }
}

export default Analyses
