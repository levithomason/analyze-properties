import _ from 'lodash/fp'
import React from 'react'
import { connect as reduxConnect } from 'react-redux'
import { firebaseConnect, isLoaded, dataToJS } from 'react-redux-firebase'

import Divider from '../../../ui/components/Divider'
import Grid from '../../../ui/components/Grid'
import Stat from '../../../ui/components/Stat'

import { usd, percent, ratio } from '../../../common/lib'
import * as rei from '../../../common/resources/rei'
window.rei = rei

const AnalysisStats = ({ analysis, settings }) => {
  if (!isLoaded(analysis) || !analysis || !isLoaded(settings) || !settings) return null

  const {
    // purchase
    totalCashNeeded,

    // operation
    netOperatingIncome,
    cashFlow,

    // returns
    capRate,
    cashOnCash,

    // ratios
    rentToValue,
    grossRentMultiplier,
    debtServiceCoverageRatio,
  } = analysis

  const check = rei.checkDeal(analysis, settings)

  return (
    <div style={{ flex: '0 0 auto', padding: '1em' }}>
      <Grid>
        <Grid.Column>
          <Stat label="Cash Flow" value={usd(cashFlow)} status={check.cashFlow} />
        </Grid.Column>
        <Grid.Column>
          <Stat label="Cap Rate" value={percent(capRate)} status={check.capRate} />
        </Grid.Column>
        <Grid.Column>
          <Stat label="Rent Value" value={percent(rentToValue)} status={check.rentToValue} />
        </Grid.Column>
      </Grid>
      <Divider hidden />
      <Grid>
        <Grid.Column>
          <Stat label="Cash Needed" value={usd(totalCashNeeded)} status={check.totalCashNeeded} />
        </Grid.Column>
        <Grid.Column>
          <Stat label="NOI" value={usd(netOperatingIncome)} status={check.netOperatingIncome} />
        </Grid.Column>
        <Grid.Column>
          <Stat label="COC" value={percent(cashOnCash)} status={check.cashOnCash} />
        </Grid.Column>
      </Grid>
      <Divider hidden />
      <Grid>
        <Grid.Column>
          <Stat label="GRM" value={ratio(grossRentMultiplier)} status={check.grossRentMultiplier} />
        </Grid.Column>
        <Grid.Column>
          <Stat
            label="DSCR"
            value={ratio(debtServiceCoverageRatio)}
            status={check.debtServiceCoverageRatio}
          />
        </Grid.Column>
        <Grid.Column>
          <Stat label="IRR" value={'todo'} status={check.internalRateOfReturn} />
        </Grid.Column>
      </Grid>
      <Divider />
    </div>
  )
}

export default _.flow(
  firebaseConnect(({ propertyId }) => [`/analyses/${propertyId}`, '/settings']),
  reduxConnect(({ firebase }, { propertyId }) => {
    return {
      analysis: dataToJS(firebase, `analyses/${propertyId}`),
      settings: dataToJS(firebase, 'settings'),
    }
  }),
)(AnalysisStats)
