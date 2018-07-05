import _ from 'lodash/fp'
import * as React from 'react'
import { connect as reduxConnect } from 'react-redux'
import { firebaseConnect } from 'react-redux-firebase'

import * as chartUtils from './chartUtils'
import * as rei from '../../../common/resources/rei'
import { usd } from '../../../common/lib/index'
import Box from '../../../ui/components/Box'
import Header from '../../../ui/components/Header'
import theme from '../../../ui/styles/theme'

const barStyle = {
  transition: `transform ${chartUtils.animationDuration}ms`,
  transformOrigin: 'bottom',
  position: 'absolute',
  margin: 'auto',
  width: '40%',
  height: '50%',
  lineHeight: 2,
  bottom: 0,
  left: 0,
  right: 0,
  textAlign: 'center',
}

const trendLabel = {
  transition: `top ${chartUtils.animationDuration}ms`,
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
      column
      inverted
      color={color}
      style={{
        ...barStyle,
        transform: `scaleY(${value})`,
      }}
    />
  </div>
)

export interface ITrendMedianProps {
  analysis?: object
  firebase?: object
  propertyId?: string | number
}

class TrendMedian extends React.Component<ITrendMedianProps> {
  state = {}

  componentDidMount() {
    this.update(this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.update(nextProps)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.state.isFetching !== nextState.isFetching
  }

  update = ({ analysis }) => {
    this.setState(() => ({ isFetching: true }))
    if (!analysis || !analysis.lat || !analysis.lon) return

    rei.trend(analysis.lat, analysis.lon).then(trend => {
      this.setState(() => ({ analysis, isFetching: false, trend }))
    })
  }

  render() {
    const { analysis = {}, isFetching, trend = {} } = this.state

    if (!analysis || !trend || !trend.price || !trend.price_sqft) return null

    return (
      <div style={{ opacity: isFetching ? 0.5 : 1 }}>
        <Header as="h4" textAlign="center" color="gray">
          {trend.name} Trend
        </Header>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
          {/*

           Price

           */}
          <Box
            column
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
            column
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
)(TrendMedian)
