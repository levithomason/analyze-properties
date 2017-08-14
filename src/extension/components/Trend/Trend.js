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

import * as rei from '../../../common/resources/rei'
import { usd } from '../../../common/lib/index'

const TaxHistoryLabel = ({ x, y, stroke, value }) => (
  <Text x={x} y={y} dy={-6} fill={stroke} fontSize={10} textAnchor="middle">
    {usd(value)}
  </Text>
)

const PriceLineLabel = ({ x, y, stroke, value }) => (
  <Text x={x} y={y} dy={-6} fill={stroke} fontSize={10} textAnchor="middle">
    {usd(value)}
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

class Trend extends Component {
  state = {}

  static propTypes = {
    analysis: PropTypes.object,
    firebase: PropTypes.object,
    propertyId: PropTypes.string.isRequired,
  }

  componentDidMount() {
    const { analysis } = this.props
    rei.trend(analysis.lat, analysis.lon).then(trend => {
      this.setState(() => ({ trend }))
    })

    rei.getPropertyInfo(analysis.propertyId).then(info => {
      this.setState(() => ({
        propertyHistory: _.map(_.mapKeys(_.camelCase), info.property_history),
        taxHistory: info.tax_history || [],
      }))
    })
  }

  render() {
    console.debug('Trend.renderAnalyze()')
    const { analysis = {} } = this.props
    const { propertyHistory = [], taxHistory = [], trend = {} } = this.state

    // if (!isLoaded(analysis) || !trend) return <Loader active />

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
              margin={{ top: 15, right: 25, bottom: 15, left: 25 }}
            >
              <Tooltip formatter={usd} />
              <XAxis
                type="number"
                dataKey="date"
                domain={['dataMin', 'dataMax']}
                allowDecimals={false}
                tick={({ x, y, stroke, payload }) => {
                  const d = new Date(payload.value)
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text x={0} y={0} dy={16} textAnchor="middle" fill="#666">
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
            <LineChart data={taxHistoryData} margin={{ top: 15, right: 25, bottom: 15, left: 25 }}>
              <Tooltip format={usd} />
              <XAxis
                type="number"
                dataKey="year"
                allowDecimals={false}
                domain={['dataMin', 'dataMax']}
                tick={({ x, y, stroke, payload }) => (
                  <g transform={`translate(${x},${y})`}>
                    <text x={0} y={0} dy={16} textAnchor="middle" fill="#666">
                      {payload.value}
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
        TODO trend $ and $/sf compare
        {/*<pre>*/}
        {/*<code> {JSON.stringify(this.state, null, 2)}</code>*/}
        {/*</pre>*/}
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
