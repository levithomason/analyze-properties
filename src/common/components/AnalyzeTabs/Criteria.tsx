import _ from 'lodash/fp'
import * as React from 'react'
import { connect as reduxConnect } from 'react-redux'
import { firebaseConnect } from 'react-redux-firebase'

import Slider from '../../../ui/components/Slider'
import Header from '../../../ui/components/Header'

export interface ICriteriaProps {
  criteria?: object
  firebase?: object
}

class Criteria extends React.Component<ICriteriaProps> {
  static defaultProps = {
    criteria: {
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
    },
  }

  handleChange = keyPath => e => {
    const { auth, firebase, criteria } = this.props

    firebase.set(`/criteria/${auth.uid}`, _.set(keyPath, +e.target.value, criteria))
  }

  render() {
    const { criteria = {} } = this.props
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
    } = criteria

    return (
      <div style={{ padding: '1em' }}>
        <Header textAlign="center">Criteria</Header>
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
      </div>
    )
  }
}

export default _.flow(
  firebaseConnect(['/criteria']),
  reduxConnect(({ firebase: { auth, data: { criteria } } }) => ({
    auth,
    criteria: _.get(auth.uid, criteria),
  })),
)(Criteria)
