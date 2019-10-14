import _ from 'lodash/fp'
import * as React from 'react'
import { withRoute } from 'react-router5'

import router from '../../common/router'
import AnalysisWorksheet from '../../common/components/AnalysisWorksheet'
import AnalysesTable from '../../common/components/AnalysesTable'
import Research from '../../common/components/Research'
import Trend from '../../common/components/Trend'

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
      <>
        <div
          style={{
            flex: '0 0 auto',
            width: '20em',
            overflowX: 'hidden',
            overflowY: 'auto',
            boxShadow: '0 0 1em rgba(0, 0, 0, 0.2)',
          }}
        >
          <div style={{ flex: 1, overflowX: 'hidden', overflowY: 'auto' }}>
            <Trend propertyId={propertyId} />
            <Research propertyId={propertyId} />
            <AnalysisWorksheet propertyId={propertyId} />
          </div>
        </div>

        <div style={{ flex: 1, padding: '0 1em', overflowX: 'hidden', overflowY: 'auto' }}>
          <AnalysesTable
            selectedPropertyId={propertyId}
            onRowClick={this.handleRowClick}
            onInitialSort={this.handleInitialSort}
          />
        </div>
      </>
    )
  }
}

export default withRoute(Analyses)
