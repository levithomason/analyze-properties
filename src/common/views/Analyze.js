import _ from 'lodash/fp'
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
    onPropertyIdChange: PropTypes.func,
  }

  constructor(props, ...rest) {
    super(props, ...rest)

    this.state = {
      propertyId: props.propertyId,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.propertyId !== this.state.propertyId) {
      this.setState(() => ({ propertyId: nextProps.propertyId }))
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // props propertyId
    // state propertyId
    // propertyId props != state

    return (
      this.props.propertyId !== nextProps.propertyId ||
      this.state.propertyId !== nextState.propertyId ||
      nextProps.propertyId !== nextState.propertyId
    )
  }

  handleSuggestSelect = (e, { propertyId }) => {
    console.debug('Analyze.handleSuggestSelect()', propertyId)
    this.setState(() => ({ propertyId }))
    _.invokeArgs('onPropertyIdChange', [e, { ...this.props, propertyId }], this.props)
  }

  render() {
    const { propertyId } = this.state
    const { favorite, search } = this.props

    const authoritativePropertyId = this.props.propertyId || this.state.propertyId

    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {search && (
          <div style={{ flex: '0 0 auto', padding: '1em 1em 0' }}>
            <Suggest onSelect={this.handleSuggestSelect} />
          </div>
        )}

        <AnalysisStats propertyId={authoritativePropertyId} />
        <NewAnalysisButton propertyId={authoritativePropertyId} fluid />

        <div style={{ flex: '1', overflowY: 'auto' }}>
          <Trend propertyId={authoritativePropertyId} />

          {favorite && <FavoriteButton propertyId={authoritativePropertyId} fluid />}

          <AnalysisWorksheet propertyId={authoritativePropertyId} />
        </div>
      </div>
    )
  }
}

export default Analyze
