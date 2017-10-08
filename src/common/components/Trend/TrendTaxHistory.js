import _ from 'lodash/fp'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { ResponsiveContainer, LineChart, XAxis, YAxis, CartesianGrid, Text, Line } from 'recharts'

import * as chartUtils from './chartUtils'
import * as rei from '../../../common/resources/rei'
import { usd } from '../../../common/lib/index'
import Header from '../../../ui/components/Header'
import Loader from '../../../ui/components/Loader'
import theme from '../../../ui/styles/theme'

class TrendTaxHistory extends Component {
  cache = {}

  state = {}

  static propTypes = {
    propertyId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }

  componentDidMount() {
    this.update(this.props)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.propertyId !== nextProps.propertyId) {
      this.update(nextProps)
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.state.isFetching !== nextState.isFetching ||
      this.state.taxHistory !== nextState.taxHistory
    )
  }

  update = ({ propertyId }) => {
    if (!propertyId) return

    const cachedTaxHistory = this.cache[propertyId]
    if (cachedTaxHistory) {
      return this.setState(() => ({ taxHistory: cachedTaxHistory }))
    }

    this.setState(() => ({ isFetching: true }))

    rei.getPropertyInfo(propertyId).then(info => {
      const taxHistory = info.tax_history || []

      this.cache[propertyId] = taxHistory
      this.setState(() => ({ isFetching: false, taxHistory }))
    })
  }

  render() {
    const { isFetching, taxHistory = [] } = this.state

    const taxHistoryData = _.sortBy(
      'year',
      _.map(({ tax, year }) => ({ tax: +tax, year: +year }), taxHistory),
    )

    if (_.isEmpty(taxHistoryData)) return null

    return (
      <div style={{ opacity: isFetching ? 0.5 : 1 }}>
        <Header as="h4" textAlign="center" color="gray">
          Tax History
        </Header>
        <ResponsiveContainer {...chartUtils.containerDimensions}>
          <LineChart data={taxHistoryData} {...chartUtils.lineChartProps}>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            {chartUtils.createTooltip({ labelFormatter: label => `year : ${label}` })}
            <XAxis
              type="number"
              dataKey="year"
              domain={['dataMin', 'dataMax']}
              allowDecimals={false}
              interval="preserveStartEnd"
              tick={({ x, y, stroke, payload }) => (
                <g transform={`translate(${x},${y}) scale(0.8)`}>
                  <text x={0} y={0} dy={16} textAnchor="middle" fill="#999">
                    {('' + payload.value).substr(2)}'
                  </text>
                </g>
              )}
              label={({ x, y, stroke, value }) => (
                <text x={x} y={y} dy={-34} fill={stroke} fontSize={10} textAnchor="middle">
                  {value}
                </text>
              )}
            />
            <YAxis
              hide
              type="number"
              domain={['dataMin - 50', 'dataMax + 50']}
              allowDecimals={false}
            />
            {chartUtils.createLine({
              dataKey: 'tax',
              stroke: '#8884d8',
              labelValueFormatter: usd,
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }
}

export default TrendTaxHistory
