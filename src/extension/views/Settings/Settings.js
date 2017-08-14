import _ from 'lodash/fp'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect as reduxConnect } from 'react-redux'
import { firebaseConnect, dataToJS } from 'react-redux-firebase'

import Slider from '../../../ui/components/Slider'

class Settings extends Component {
  static propTypes = {
    settings: PropTypes.object,
    firebase: PropTypes.object,
  }

  static defaultProps = {
    settings: {
      // criteria
      cashFlow: { min: 100 },
      capRate: { min: 0.05 },
      rentToValue: { min: 0 },
      totalCashNeeded: { max: 68000 },
      netOperatingIncome: { min: 0 },
      cashOnCash: { min: 0 },
      grossRentMultiplier: { max: 0 },
      debtServiceCoverageRatio: { min: 0 },
      internalRateOfReturn: { min: 0 },

      // debt to income
      income: 50000,
      mortgages: 850,
      otherDebts: 0,
    },
  }

  handleChange = keyPath => e => {
    const { firebase, settings } = this.props

    firebase.set('/settings', _.set(keyPath, +e.target.value, settings))
  }

  render() {
    const { settings = {} } = this.props
    const {
      // criteria
      cashFlow,
      capRate,
      rentToValue,
      totalCashNeeded,
      netOperatingIncome,
      cashOnCash,
      grossRentMultiplier,
      debtServiceCoverageRatio,
      internalRateOfReturn,

      // debt to income
      income,
      mortgages,
      otherDebts,
    } = settings

    return (
      <div style={{ padding: '1em' }}>
        <h4>Criteria</h4>
        <Slider
          unit="usd"
          label={
            <span>
              Cash Flow <sup>min</sup>
            </span>
          }
          value={cashFlow.min}
          min={0}
          max={500}
          step={10}
          onChange={this.handleChange('cashFlow.min')}
        />
        <Slider
          unit="percent"
          label={
            <span>
              Cap Rate <sup>min</sup>
            </span>
          }
          value={capRate.min}
          min={0}
          max={0.1}
          step={0.001}
          onChange={this.handleChange('capRate.min')}
        />
        <Slider
          unit="percent"
          label={
            <span>
              Rent To Value <sup>min</sup>
            </span>
          }
          value={rentToValue.min}
          min={0}
          max={0.02}
          step={0.001}
          onChange={this.handleChange('rentToValue.min')}
        />
        <Slider
          unit="usd"
          label={
            <span>
              Cash Needed <sup>max</sup>
            </span>
          }
          value={totalCashNeeded.max}
          min={0}
          max={200000}
          step={1000}
          onChange={this.handleChange('totalCashNeeded.max')}
        />
        <Slider
          unit="usd"
          label={
            <span>
              NOI <sup>min</sup>
            </span>
          }
          value={netOperatingIncome.min}
          min={0}
          max={50000}
          step={1000}
          onChange={this.handleChange('netOperatingIncome.min')}
        />
        <Slider
          unit="percent"
          label={
            <span>
              COC <sup>min</sup>
            </span>
          }
          value={cashOnCash.min}
          min={0}
          max={0.1}
          step={0.001}
          onChange={this.handleChange('cashOnCash.min')}
        />
        <Slider
          unit="ratio"
          label={
            <span>
              GRM <sup>max</sup>
            </span>
          }
          value={grossRentMultiplier.max}
          min={0}
          max={20}
          step={0.1}
          onChange={this.handleChange('grossRentMultiplier.max')}
        />
        <Slider
          unit="ratio"
          label={
            <span>
              DSCR <sup>min</sup>
            </span>
          }
          value={debtServiceCoverageRatio.min}
          min={0}
          max={2}
          step={0.1}
          onChange={this.handleChange('debtServiceCoverageRatio.min')}
        />
        <Slider
          unit="percent"
          label={
            <span>
              IRR <sup>min</sup>
            </span>
          }
          value={internalRateOfReturn.min}
          min={0}
          max={0.2}
          step={0.001}
          onChange={this.handleChange('internalRateOfReturn.min')}
        />

        <h4>Debt to Income</h4>
        <Slider
          unit="usd"
          label="Income"
          value={income}
          min={20000}
          max={200000}
          step={10}
          onChange={this.handleChange('income')}
        />
        <Slider
          unit="usd"
          label="Mortgages"
          value={mortgages}
          min={0}
          max={5000}
          step={5}
          onChange={this.handleChange('mortgages')}
        />
        <Slider
          unit="usd"
          label="Other Debts"
          value={otherDebts}
          min={0}
          max={5000}
          step={5}
          onChange={this.handleChange('otherDebts')}
        />
      </div>
    )
  }
}

export default _.flow(
  firebaseConnect(['/settings']),
  reduxConnect(({ firebase }) => ({
    settings: dataToJS(firebase, 'settings'),
  })),
)(Settings)