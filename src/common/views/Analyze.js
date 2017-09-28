import PropTypes from 'prop-types'
import React, { Component } from 'react'

import AnalysisStats from '../components/AnalysisStats'
import AnalysisWorksheet from '../components/AnalysisWorksheet'
import NewAnalysisButton from '../components/NewAnalysisButton'
import FavoriteButton from '../components/FavoriteButton'
import Suggest from '../components/Suggest'
import Trend from '../components/Trend'

class Analyze extends Component {
  static propTypes = {
    propertyId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    search: PropTypes.bool,
    favorite: PropTypes.bool,
  }

  state = {}

  componentWillReceiveProps(nextProps) {
    if (nextProps.propertyId !== this.state.propertyId) {
      this.setState(() => ({ propertyId: nextProps.propertyId }))
    }
  }

  handleSuggestSelect = (e, { propertyId }) => {
    console.debug('Analyze.handleSuggestSelect()', propertyId)
    this.setState(() => ({ propertyId }))
  }

  render() {
    const { propertyId } = this.state
    const { favorite, search } = this.props

    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {search && (
          <div style={{ flex: '0 0 auto', padding: '1em 1em 0' }}>
            <Suggest onSelect={this.handleSuggestSelect} />
          </div>
        )}

        <AnalysisStats propertyId={propertyId} />
        <NewAnalysisButton propertyId={propertyId} fluid />

        <div style={{ flex: '1', overflowY: 'auto' }}>
          <Trend propertyId={propertyId} />

          {favorite && <FavoriteButton propertyId={propertyId} fluid />}

          <AnalysisWorksheet propertyId={propertyId} />
        </div>
      </div>
    )
  }
}

export default Analyze
