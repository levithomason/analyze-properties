import _ from 'lodash/fp'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect as reduxConnect } from 'react-redux'
import { firebaseConnect } from 'react-redux-firebase'
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

import theme from '../../../ui/styles/theme.js'

import * as rei from '../../../common/resources/rei'
import { usd } from '../../../common/lib/index'

const transitionStyle = {
}

const barStyle = {
  transition: 'transform 0.2s',
  transformOrigin: 'bottom',
  position: 'absolute',
  margin: 'auto',
  width: '50%',
  height: '50%',
  lineHeight: 2,
  bottom: 0,
  left: 0,
  right: 0,
  textAlign: 'center',
}

const trendLabel = {
  transition: 'top 0.2s',
  position: 'absolute',
  marginTop: '0.5em',
  width: '100%',
  color: theme.grayscale.white.hex(),
  textAlign: 'center',
  zIndex: 1, // above trend bar
}

const TrendBar = ({ color, label, value }) => (
  <div>
    <div style={{ ...trendLabel, top: 100 - 50 * value + '%' }}>{label}</div>

    <Box
      inverted
      color={color}
      style={{
        ...barStyle,
        transform: `scaleY(${value})`,
      }}
    />
  </div>
)

class Trend extends Component {
  state = {}

  static propTypes = {
    analysis: PropTypes.object,
    firebase: PropTypes.object,
    propertyId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }

  componentDidMount() {
    this.update(this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.update(nextProps)
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { analysis } = nextProps
    const { trend, isFetchingTrend } = nextState

    return (
      !isFetchingTrend &&
      trend &&
      trend.price &&
      trend.price_sqft &&
      analysis &&
      analysis.purchasePrice &&
      analysis.sqft
    )
  }

  update = ({ analysis }) => {
    this.setState(() => ({ isFetchingTrend: true }))
    if (!analysis || !analysis.lat || !analysis.lon) return

    rei.trend(analysis.lat, analysis.lon).then(trend => {
      this.setState(() => ({ isFetchingTrend: false, trend }))
    })
  }

  render() {
    const { analysis = {} } = this.props
    const { trend = {} } = this.state

    if (!analysis || !trend || !trend.price || !trend.price_sqft) return null

    return (
      <div>
        <Header textAlign="center" color="gray">
          {trend.name} Trend
        </Header>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
          {/*

           Price

           */}
          <Box
            style={{
              position: 'relative',
              flex: '0 0 auto',
              width: '50%',
              height: '10rem',
              fontSize: '0.75rem',
              background: theme.grayscale.lightestGray.hex(),
              borderRight: '1px solid #fff',
            }}
          >
            <TrendBar
              color="green"
              label={usd(analysis.purchasePrice / 1000) + 'k'}
              value={analysis.purchasePrice / trend.price}
            />
            <div
              style={{
                position: 'absolute',
                height: '0.75rem',
                bottom: '50%',
                left: 0,
                right: 0,
                lineHeight: 1,
                color: theme.grayscale.gray.hex(),
                textAlign: 'left',
                borderBottom: `1px dashed ${theme.grayscale.lightGray.hex()}`,
              }}
            >
              {usd(trend.price / 1000)}k
            </div>
          </Box>
          {/*

          Price / SqFt

          */}
          <Box
            style={{
              position: 'relative',
              flex: '0 0 auto',
              width: '50%',
              height: '10rem',
              fontSize: '0.75rem',
              background: theme.grayscale.lightestGray.hex(),
              borderLeft: '1px solid #fff',
            }}
          >
            <TrendBar
              color="orange"
              label={`${usd(analysis.purchasePrice / analysis.sqft)}/sf`}
              value={analysis.purchasePrice / analysis.sqft / trend.price_sqft}
            />
            <div
              style={{
                position: 'absolute',
                height: '0.75rem',
                bottom: '50%',
                left: 0,
                right: 0,
                lineHeight: 1,
                color: theme.grayscale.gray.hex(),
                textAlign: 'left',
                borderBottom: `1px dashed ${theme.grayscale.lightGray.hex()}`,
              }}
            >
              {usd(trend.price_sqft)}/sf
            </div>
          </Box>
        </div>
      </div>
    )
  }
}

export default _.flow(
  firebaseConnect(['/analyses']),
  reduxConnect(({ firebase: { auth, data: { analyses } } }, { propertyId }) => ({
    analysis: _.get([auth.uid, propertyId], analyses),
  })),
)(Trend)
