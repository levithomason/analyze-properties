import _ from 'lodash/fp'
import React, { Component } from 'react'

import AnalysesTable from '../../common/components/AnalysesTable'
import AnalyzeTabs from '../../common/components/AnalyzeTabs'
import * as styles from '../../common/styles'

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

        <div style={styles.sidePanel({ side: 'left' })}>
          <AnalyzeTabs propertyId={selectedPropertyId} />
        </div>
      </div>
    )
  }
}

export default Analyses
