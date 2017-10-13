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
    favorite: PropTypes.bool,
  }

  render() {
    const { favorite, propertyId } = this.props

    const favoriteButtonElement = favorite && <FavoriteButton propertyId={propertyId} fluid />
    const newAnalysisButtonElement = <NewAnalysisButton propertyId={propertyId} fluid />

    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AnalysisStats propertyId={propertyId} />

        {(newAnalysisButtonElement || favoriteButtonElement) && (
          <div style={{ padding: '1em' }}>
            {newAnalysisButtonElement}
            {favoriteButtonElement}
          </div>
        )}

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
