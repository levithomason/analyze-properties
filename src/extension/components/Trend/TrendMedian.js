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

import * as rei from '../../../common/resources/rei'
import { usd } from '../../../common/lib/index'

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
  }

  render() {
    console.debug('Trend.renderAnalyze()')
    const { analysis = {} } = this.props
    const { trend = {} } = this.state

    // if (!isLoaded(analysis) || !trend) return <Loader active />

    return (
      <div>
        <Header textAlign="center" color="gray">
          {trend.type} Median
        </Header>
        <Box
          style={{
            position: 'relative',
            height: '10rem',
            fontSize: '0.75rem',
            background: '#eee',
          }}
        >
          <Box
            inverted
            color="green"
            style={{
              position: 'absolute',
              margin: 'auto',
              width: '25%',
              height: 50 * analysis.purchasePrice / trend.price + '%',
              lineHeight: 2,
              bottom: 0,
              left: 0,
              right: 0,
              textAlign: 'center',
            }}
          >
            {usd(analysis.purchasePrice / 1000)}k
          </Box>
          <div
            style={{
              position: 'absolute',
              height: '0.75rem',
              bottom: '50%',
              left: 0,
              right: 0,
              borderBottom: '1px dashed rgba(0, 0, 0, 0.25)',
              lineHeight: 1,
              textShadow: '0 0 1px #fff',
              textAlign: 'left',
            }}
          >
            {usd(trend.price / 1000)}k
          </div>
        </Box>
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
