import _ from 'lodash/fp'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { ResponsiveContainer, LineChart, XAxis, YAxis, CartesianGrid, Text, Line } from 'recharts'

import * as chartUtils from './chartUtils'
import * as rei from '../../../common/resources/rei'
import { usd } from '../../../common/lib/index'
import Header from '../../../ui/components/Header'

class TrendPropertyHistory extends Component {
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
    return this.state.propertyHistory !== nextState.propertyHistory
  }

  update = ({ propertyId }) => {
    if (!propertyId) return

    const cachedPropertyHistory = this.cache[propertyId]
    if (cachedPropertyHistory) {
      return this.setState(() => ({ propertyHistory: cachedPropertyHistory }))
    }

    this.setState(() => ({ isFetching: true }))

    rei.getPropertyInfo(propertyId).then(info => {
      const propertyHistory = _.map(_.mapKeys(_.camelCase), info.property_history)

      this.cache[propertyId] = propertyHistory
      this.setState(() => ({ isFetching: false, propertyHistory }))
    })
  }

  render() {
    const { isFetching, propertyHistory = [] } = this.state

    const propertyHistoryData = _.sortBy(
      'date',
      _.map(({ date, price }) => ({ date: new Date(date).getTime(), price }), propertyHistory),
    )

    if (_.isEmpty(propertyHistoryData)) return null

    return (
      <div style={{ opacity: isFetching ? 0.5 : 1 }}>
        <Header as="h4" textAlign="center" color="gray">
          Price History
        </Header>
        <ResponsiveContainer width="100%" height={100}>
          <LineChart data={propertyHistoryData} {...chartUtils.lineChartProps}>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            {chartUtils.createTooltip({
              labelFormatter: label => `date : ${new Date(label).toLocaleDateString()}`,
            })}
            <XAxis
              type="number"
              dataKey="date"
              domain={['dataMin', 'dataMax']}
              allowDecimals={false}
              scale="time"
              interval={2}
              minTickGap={100}
              tickCount={5}
              tick={({ x, y, stroke, payload }) => {
                const d = new Date(payload.value)
                return (
                  <g transform={`translate(${x},${y}) scale(0.8)`}>
                    <text x={0} y={0} dy={16} textAnchor="middle" fill="#999">
                      {d.getMonth() + 1}/{('' + d.getFullYear()).substr(2)}'
                    </text>
                  </g>
                )
              }}
            />
            <YAxis
              hide
              type="number"
              domain={['dataMin - 10000', 'dataMax + 10000']}
              allowDecimals={false}
            />
            {chartUtils.createLine({
              dataKey: 'price',
              stroke: '#82ca9d',
              labelValueFormatter: value => usd(value / 1000) + 'k',
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }
}

export default TrendPropertyHistory
