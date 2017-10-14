import PropTypes from 'prop-types'
import React, { Component } from 'react'

import AnalysisStats from '../components/AnalysisStats'
import AnalysisWorksheet from '../components/AnalysisWorksheet'
import NewAnalysisButton from '../components/NewAnalysisButton'
import FavoriteButton from '../components/FavoriteButton'
import Trend from '../components/Trend'

import Divider from '../../ui/components/Divider'

class Analyze extends Component {
  static propTypes = {
    propertyId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }

  render() {
    const { propertyId } = this.props

    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AnalysisStats propertyId={propertyId} />

        <div style={{ padding: '1em' }}>
          <NewAnalysisButton propertyId={propertyId} fluid />
          <FavoriteButton propertyId={propertyId} fluid />
        </div>

        <Divider fitted />

        <div style={{ flex: '1', overflowY: 'auto' }}>
          <Trend propertyId={propertyId} />

          <AnalysisWorksheet propertyId={propertyId} />
        </div>
      </div>
    )
  }
}

export default Analyze
