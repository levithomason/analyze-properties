import PropTypes from 'prop-types'
import React, { Component } from 'react'

import AnalysisStats from '../../../common/components/AnalysisStats'
import AnalysisWorksheet from '../../../common/components/AnalysisWorksheet'
import NewAnalysisButton from '../../../common/components/NewAnalysisButton'
import FavoriteButton from '../../../common/components/FavoriteButton'
import Suggest from '../../../common/components/Suggest'
import Trend from '../../../common/components/Trend'

class Analyze extends Component {
  static propTypes = {
    analysis: PropTypes.object,
    firebase: PropTypes.object,
    propertyId: PropTypes.string.isRequired,
  }

  state = {}

  handleSuggestSelect = (e, { propertyId }) => {
    console.debug('Analyze.handleSuggestSelect()', propertyId)
    this.setState(() => ({ propertyId }))
  }

  render() {
    const { propertyId } = this.state

    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: '0 0 auto', padding: '1em 1em 0' }}>
          <Suggest onSelect={this.handleSuggestSelect} propertyId={propertyId} />
        </div>

        <AnalysisStats propertyId={propertyId} />
        <NewAnalysisButton propertyId={propertyId} fluid />

        <div style={{ flex: '1', overflowY: 'auto' }}>
          <Trend propertyId={propertyId} />

          <FavoriteButton propertyId={propertyId} fluid />

          <AnalysisWorksheet propertyId={propertyId} />
        </div>
      </div>
    )
  }
}

export default Analyze
