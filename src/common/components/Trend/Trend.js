import PropTypes from 'prop-types'
import React, { Component } from 'react'

import TrendMedian from './TrendMedian'
import TrendPropertyHistory from './TrendPropertyHistory'
import TrendTaxHistory from './TrendTaxHistory'

class Trend extends Component {
  static propTypes = {
    propertyId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.propertyId !== nextProps.propertyId
  }

  render() {
    const { propertyId } = this.props

    if (!propertyId) return null

    return (
      <div style={{ padding: '1em' }}>
        <TrendPropertyHistory propertyId={propertyId} />
        <TrendTaxHistory propertyId={propertyId} />
        <TrendMedian propertyId={propertyId} />
      </div>
    )
  }
}

export default Trend
