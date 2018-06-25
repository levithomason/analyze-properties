import * as React from 'react'

import TrendMedian from './TrendMedian'
import TrendPropertyHistory from './TrendPropertyHistory'
import TrendTaxHistory from './TrendTaxHistory'

export interface ITrendProps {
  propertyId?: string | number
}

class Trend extends React.Component<ITrendProps> {
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
