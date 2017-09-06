import _ from 'lodash/fp'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect as reduxConnect } from 'react-redux'
import { firebaseConnect, isLoaded, dataToJS } from 'react-redux-firebase'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Text,
  ReferenceLine,
  Legend,
  Line,
} from 'recharts'

import Loader from '../../../ui/components/Loader'
import Header from '../../../ui/components/Header'
import Box from '../../../ui/components/Box'
import TrendMedian from './TrendMedian'

import * as rei from '../../../common/resources/rei'
import { usd } from '../../../common/lib/index'

const TaxHistoryLabel = ({ x, y, stroke, value }) => (
  <Text x={x} y={y} dy={-6} fill={stroke} fontSize={10} textAnchor="middle">
    {usd(value)}
  </Text>
)

const PriceLineLabel = ({ x, y, stroke, value }) => (
  <Text x={x} y={y} dy={-6} fill={stroke} fontSize={10} textAnchor="middle">
    {usd(value / 1000) + 'k'}
  </Text>
)

const PriceXLabel = ({ x, y, stroke, value }) => {
  const d = new Date(value)
  return (
    <Text x={x} y={y} dy={-6} fill={stroke} fontSize={10} textAnchor="middle">
      {d.getMonth()}-{d.getYear()}
    </Text>
  )
}

const TooltipProps = {
  animationDuration: 100,
  wrapperStyle: {
    padding: '2px',
    color: '#333',
    fontSize: '12px',
    background: '#eee',
    border: 'none',
  },
  labelStyle: { padding: '1px', lineHeight: 1, border: 'none' },
  itemStyle: { padding: '1px', lineHeight: 1, border: 'none' },
  formatter: usd,
}

class Trend extends Component {
  state = {}

  static propTypes = {
    analysis: PropTypes.object,
    firebase: PropTypes.object,
    propertyId: PropTypes.string,
  }

  componentDidMount() {
    this.update(this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.update(nextProps)
  }

  update = ({ analysis, propertyId }) => {
    if (analysis && analysis.lat && analysis.lon) {
      rei.trend(analysis.lat, analysis.lon).then(trend => {
        this.setState(() => ({ trend }))
      })
    }

    if (propertyId) {
      rei.getPropertyInfo(propertyId).then(info => {
        this.setState(() => ({
          propertyHistory: _.map(_.mapKeys(_.camelCase), info.property_history),
          taxHistory: info.tax_history || [],
        }))
      })
    }
  }

  render() {
    console.debug('Trend.render()')
    const { propertyId } = this.props
    const { propertyHistory = [], taxHistory = [], trend = {} } = this.state

    const propertyHistoryData = _.sortBy(
      'date',
      _.map(({ date, price }) => ({ date: new Date(date).getTime(), price }), propertyHistory),
    )

    const taxHistoryData = _.sortBy(
      'year',
      _.map(({ tax, year }) => ({ tax: +tax, year: +year }), taxHistory),
    )

    return (
      <div style={{ padding: '1em' }}>
        {propertyHistoryData.length > 1 && (
          <ResponsiveContainer width="100%" height={100}>
            <LineChart
              data={propertyHistoryData}
              margin={{ top: 15, right: 15, bottom: 15, left: 15 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <Tooltip
                {...TooltipProps}
                labelFormatter={label => `date : ${new Date(label).toLocaleDateString()}`}
              />
              <XAxis
                type="number"
                dataKey="date"
                domain={['dataMin', 'dataMax']}
                allowDecimals={false}
                tick={({ x, y, stroke, payload }) => {
                  const d = new Date(payload.value)
                  return (
                    <g transform={`translate(${x},${y}) scale(0.8)`}>
                      <text x={0} y={0} dy={16} textAnchor="middle" fill="#999">
                        {d.getMonth() + 1}/{`${d.getFullYear()}`.substr(2)}
                      </text>
                    </g>
                  )
                }}
              />
              <YAxis hide type="number" domain={['dataMin', 'dataMax']} allowDecimals={false} />
              <Line type="monotone" dataKey="price" stroke="#82ca9d" label={<PriceLineLabel />} />
            </LineChart>
          </ResponsiveContainer>
        )}
        {taxHistoryData.length > 1 && (
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={taxHistoryData} margin={{ top: 15, right: 15, bottom: 15, left: 15 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <Tooltip {...TooltipProps} labelFormatter={label => `year : ${label}`} />
              <XAxis
                type="number"
                dataKey="year"
                allowDecimals={false}
                domain={['dataMin', 'dataMax']}
                tick={({ x, y, stroke, payload }) => (
                  <g transform={`translate(${x},${y}) scale(0.8)`}>
                    <text x={0} y={0} dy={16} textAnchor="middle" fill="#999">
                      {('' + payload.value).substring(2) + "'"}
                    </text>
                  </g>
                )}
                label={({ x, y, stroke, value }) => (
                  <text x={x} y={y} dy={-34} fill={stroke} fontSize={10} textAnchor="middle">
                    {value}
                  </text>
                )}
              />
              <YAxis hide type="number" domain={['dataMin', 'dataMax']} allowDecimals={false} />
              <Line type="monotone" dataKey="tax" stroke="#8884d8" label={<TaxHistoryLabel />} />
            </LineChart>
          </ResponsiveContainer>
        )}
        <TrendMedian propertyId={propertyId} />
      </div>
    )
  }
}

export default _.flow(
  firebaseConnect(({ propertyId }) => [`/analyses/${propertyId}`]),
  reduxConnect(({ firebase }, { propertyId }) => {
    return {
      analysis: dataToJS(firebase, `analyses/${propertyId}`),
    }
  }),
)(Trend)
