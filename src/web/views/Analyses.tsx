import _ from 'lodash/fp'
import * as React from 'react'
import { withRoute } from 'react-router5'

import Trend from '../../common/components/Trend'
import AnalysisWorksheet from '../../common/components/AnalysisWorksheet'
import AnalysesTable from '../../common/components/AnalysesTable'
import router from '../../common/router'

class Analyses extends React.Component {
  state = {}

  getPropertyId = () => this.props.route.params.propertyId

  setPropertyId = propertyId => {
    return router.navigate('analyses', { propertyId })
  }

  handleRowClick = (e, { analysis }) => this.setPropertyId(analysis.propertyId)

  handleInitialSort = (e, { analyses }) => {
    const propertyId = _.get('propertyId', _.head(analyses))
    if (this.getPropertyId()) return

    this.setPropertyId(propertyId)
  }

  render() {
    const propertyId = this.getPropertyId()

    return (
      <div>
        <div
          style={{
            position: 'fixed',
            top: '57px',
            bottom: 0,
            left: 0,
            width: '20em',
            overflowX: 'hidden',
            overflowY: 'auto',
            boxShadow: '0 0 3em rgba(0, 0, 0, 0.2)',
          }}
        >
          <div style={{ flex: '1' }}>
            <Trend propertyId={propertyId} />

            <AnalysisWorksheet propertyId={propertyId} />
          </div>
        </div>
        <div style={{ marginLeft: '20em', paddingLeft: '1em' }}>
          <AnalysesTable
            selectedPropertyId={propertyId}
            onRowClick={this.handleRowClick}
            onInitialSort={this.handleInitialSort}
          />
        </div>
      </div>
    )
  }
}

export default withRoute(Analyses)
