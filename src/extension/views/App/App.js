import _ from 'lodash/fp'
import Textarea from 'react-textarea-autosize'
import React, { Component } from 'react'
import { connect as reduxConnect } from 'react-redux'
import { firebaseConnect, isLoaded, dataToJS, pathToJS } from 'react-redux-firebase'

import Button from '../../../ui/components/Button'
import Divider from '../../../ui/components/Divider'
import Grid from '../../../ui/components/Grid'
import Loader from '../../../ui/components/Loader'
import Slider from '../../../ui/components/Slider'
import Stat from '../../../ui/components/Stat'
import Tabs from '../../../ui/components/Tabs'

import FavoriteButton from '../../../common/components/FavoriteButton'
import LogoutButton from '../../../common/components/LogoutButton'
import { usd, percent, perMonth, ratio } from '../../../common/lib'
import * as rei from '../../../common/resources/rei'

import Settings from '../Settings'

export const appStyle = {
  position: 'fixed',
  display: 'flex',
  flexDirection: 'column',
  width: '23em',
  height: '100%',
  top: '0',
  bottom: '0',
  right: '0',
  overflowY: 'scroll',
  background: '#FFF',
  boxShadow: '-0.5em 0 1em rgba(0, 0, 0, 0.25)',
  zIndex: '999999',
}

const textAreaStyle = {
  display: 'block',
  margin: 0,
  width: '100%',
  border: 'none',
  outline: 'none',
  fontFamily: 'monospace',
  fontSize: '12px',
  resize: 'none',
}

class App extends Component {
  state = {}

  componentDidMount() {
    console.info('componentDidMount()')
    document.addEventListener('keydown', this.handleDocumentKeyDown)

    this.setState((prevState, props) => ({
      activeTab: 'Analyze',
      isOpen: true,
    }))
  }

  handleDocumentKeyDown = e => {
    console.info('handleDocumentKeyDown()')
    if (e.keyCode === 27) {
      this.setState((prevState, props) => ({ isOpen: !prevState.isOpen }))
    }
  }

  handleAnalysisNumberChange = key => e => {
    console.info('handleAnalysisNumberChange()')
    const { value } = e.target
    const { analysis, firebase, propertyId } = this.props

    firebase.set(`/analyses/${propertyId}`, rei.crunch({ ...analysis, [key]: +value }))
  }

  handleAnalysisTextChange = key => e => {
    console.info('handleAnalysisTextChange()')
    const { value } = e.target
    const { analysis, firebase, propertyId } = this.props

    firebase.set(`/analyses/${propertyId}`, { ...analysis, [key]: value })
  }

  createDefaultAnalysis = () => {
    console.info('createDefaultAnalysis()')
    const { firebase, propertyId } = this.props

    console.debug('REI: getting default analysis')
    this.setState((prevState, props) => ({ isFetching: true }))

    rei
      .getDefaultAnalysis(propertyId)
      .then(defaultAnalysis => {
        firebase.set(`/analyses/${propertyId}`, defaultAnalysis)

        this.setState((prevState, props) => ({ isFetching: false }))
      })
      .catch(err => {
        throw err
      })
  }

  renderAnalyze = () => {
    console.info('renderAnalyze()')
    const { analysis, settings } = this.props

    if (!settings || !isLoaded(settings)) return <Loader active>Waiting for settings...</Loader>

    if (!analysis || !isLoaded(analysis)) {
      return <Loader active>Waiting for analysis...</Loader>
    } else if (!analysis) {
      return (
        <p style={{ textAlign: 'center' }}>
          <Button onClick={this.createDefaultAnalysis}>New Analysis</Button>
        </p>
      )
    }

    const {
      // WORKSHEET
      // price
      /* marketValue , */
      purchasePrice,
      /* afterRepairValue, */
      rehabCosts,
      // financing
      downRate,
      rate,
      term,
      // costs
      purchaseCostsRate,
      // income
      grossMonthlyRent,
      otherIncome,
      // expenses
      taxes,
      insurance,
      managementRate,
      maintenanceRate,
      capitalExpendituresRate,
      otherExpenses,
      // assumptions
      vacancyRate,
      appreciationRate,
      incomeIncreaseRate,
      expenseIncreaseRate,
      sellingCostRate,

      // ANALYSIS
      // purchase
      totalCashNeeded,
      debtService,
      // operation
      /* operatingIncome, operatingExpenseAmount, */ netOperatingIncome,
      cashFlow,
      operatingExpenseRate,
      // returns
      capRate,
      cashOnCash,
      // ratios
      rentToValue,
      grossRentMultiplier,
      debtServiceCoverageRatio,

      // OTHER
      propertyId,
      notes,
    } = analysis

    const check = rei.checkDeal(analysis, settings)

    return (
      <div>
        <div style={{ padding: '1em' }}>
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
              <Stat
                label="Cash Needed"
                value={usd(totalCashNeeded)}
                status={check.totalCashNeeded}
              />
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
              <Stat
                label="GRM"
                value={ratio(grossRentMultiplier)}
                status={check.grossRentMultiplier}
              />
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
        </div>

        <FavoriteButton propertyId={propertyId} fluid />

        <div style={{ background: '#f8f8f8' }}>
          <Divider thick fitted />

          <Textarea
            minRows={3}
            maxRows={10}
            placeholder="Notes"
            value={notes}
            onChange={this.handleAnalysisTextChange('notes')}
            style={textAreaStyle}
          />

          <Divider thick fitted />

          <div style={{ padding: '1em' }}>
            <h4>Price</h4>
            <Slider
              unit="usd"
              label="Purchase"
              value={purchasePrice}
              min={10000}
              max={500000}
              step={5000}
              onChange={this.handleAnalysisNumberChange('purchasePrice')}
            />
            {/*<Slider*/}
            {/*unit='usd'*/}
            {/*label='ARV'*/}
            {/*value={afterRepairValue}*/}
            {/*min={10000}*/}
            {/*max={500000}*/}
            {/*step={5000}*/}
            {/*onChange={this.handleChange('afterRepairValue')}*/}
            {/*/>*/}
            {/*<Slider*/}
            {/*unit='usd'*/}
            {/*label='Market Value'*/}
            {/*value={marketValue}*/}
            {/*min={10000}*/}
            {/*max={500000}*/}
            {/*step={5000}*/}
            {/*onChange={this.handleChange('marketValue')}*/}
            {/*/>*/}
          </div>
          <div style={{ padding: '1em' }}>
            <h4>Income</h4>
            <Slider
              unit="usd"
              label="Rent"
              value={grossMonthlyRent}
              min={500}
              max={6000}
              step={5}
              onChange={this.handleAnalysisNumberChange('grossMonthlyRent')}
            />
            <Slider
              unit="usd"
              label="Other Income"
              value={otherIncome}
              min={0}
              max={1000}
              step={5}
              onChange={this.handleAnalysisNumberChange('otherIncome')}
            />
          </div>
          <div style={{ padding: '1em' }}>
            <h4>Costs</h4>
            <Slider
              unit="usd"
              label="Rehab"
              value={rehabCosts}
              min={0}
              max={50000}
              step={100}
              onChange={this.handleAnalysisNumberChange('rehabCosts')}
            />
            <Slider
              unit="percent"
              label="Purchase"
              value={purchaseCostsRate}
              min={0}
              max={0.1}
              step={0.005}
              onChange={this.handleAnalysisNumberChange('purchaseCostsRate')}
            />
          </div>
          <div style={{ padding: '1em' }}>
            <h4>Expenses</h4>
            <div style={{ textAlign: 'center' }}>
              <sup>
                {percent(operatingExpenseRate)} of income
              </sup>
            </div>
            <Slider
              unit="usd"
              label="Taxes"
              value={taxes}
              min={0}
              max={5000}
              step={5}
              onChange={this.handleAnalysisNumberChange('taxes')}
            />
            <Slider
              unit="usd"
              label="Insurance"
              value={insurance}
              min={0}
              max={1500}
              step={5}
              onChange={this.handleAnalysisNumberChange('insurance')}
            />
            <Slider
              unit="percent"
              label="Management"
              value={managementRate}
              min={0}
              max={0.1}
              step={0.01}
              onChange={this.handleAnalysisNumberChange('managementRate')}
            />
            <Slider
              unit="percent"
              label="Maintenance"
              value={maintenanceRate}
              min={0}
              max={0.2}
              step={0.01}
              onChange={this.handleAnalysisNumberChange('maintenanceRate')}
            />
            <Slider
              unit="percent"
              label="CapEx"
              value={capitalExpendituresRate}
              min={0}
              max={0.2}
              step={0.01}
              onChange={this.handleAnalysisNumberChange('capitalExpendituresRate')}
            />
            <Slider
              unit="usd"
              label="Other"
              value={otherExpenses}
              min={0}
              max={12000}
              step={50}
              onChange={this.handleAnalysisNumberChange('otherExpenses')}
            />
          </div>
          <div style={{ padding: '1em' }}>
            <h4>Assumptions</h4>
            <Slider
              unit="percent"
              label="Vacancy"
              value={vacancyRate}
              min={0}
              max={0.1}
              step={0.01}
              onChange={this.handleAnalysisNumberChange('vacancyRate')}
            />
            <Slider
              unit="percent"
              label="Appreciation"
              value={appreciationRate}
              min={0}
              max={0.05}
              step={0.01}
              onChange={this.handleAnalysisNumberChange('appreciationRate')}
            />
            <Slider
              unit="percent"
              label="Income Increase"
              value={incomeIncreaseRate}
              min={0}
              max={0.05}
              step={0.01}
              onChange={this.handleAnalysisNumberChange('incomeIncreaseRate')}
            />
            <Slider
              unit="percent"
              label="Expense Increase"
              value={expenseIncreaseRate}
              min={0}
              max={0.05}
              step={0.01}
              onChange={this.handleAnalysisNumberChange('expenseIncreaseRate')}
            />
            <Slider
              unit="percent"
              label="Selling Cost"
              value={sellingCostRate}
              min={0}
              max={0.1}
              step={0.01}
              onChange={this.handleAnalysisNumberChange('sellingCostRate')}
            />
          </div>
          <div style={{ padding: '1em' }}>
            <h4>Financing</h4>
            <div style={{ textAlign: 'center' }}>
              <sup>
                {perMonth(usd(debtService))}
              </sup>
            </div>
            <Slider
              unit="percent"
              label="Down"
              value={downRate}
              min={0}
              max={0.3}
              step={0.01}
              onChange={this.handleAnalysisNumberChange('downRate')}
            />
            <Slider
              unit="percent"
              label="Rate"
              value={rate}
              min={0.03}
              max={0.1}
              step={0.001}
              onChange={this.handleAnalysisNumberChange('rate')}
            />
            <Slider
              unit="year"
              label="Term"
              value={term}
              min={5}
              max={30}
              step={1}
              onChange={this.handleAnalysisNumberChange('term')}
            />
          </div>

          <Divider section />

          {Object.keys(analysis).sort().map(key =>
            <div key={key}>
              {key}
              <div style={{ float: 'right', textAlign: 'right' }}>
                {('' + analysis[key]).substr(0, 9)}
              </div>
            </div>,
          )}
        </div>
      </div>
    )
  }

  handleTabChange = (e, { activeTab }) => {
    console.info('handleTabChange()')
    return this.setState((prevState, props) => ({ activeTab }))
  }

  render() {
    const { isFetching, isOpen, activeTab } = this.state
    console.info('----------------------------------------')
    console.info('render()')
    // console.log('STATE', this.state)
    // console.log('PROPS', this.props)

    if (!isOpen) return null

    return (
      <div style={appStyle}>
        <Loader active={isFetching} />
        <Tabs
          onTabChange={this.handleTabChange}
          activeTab={activeTab}
          panes={[
            {
              menuItem: 'Analyze',
              render: this.renderAnalyze,
            },
            {
              menuItem: 'Settings',
              render: () => <Settings />,
            },
          ]}
        />
        <LogoutButton fluid />
      </div>
    )
  }
}

export default _.flow(
  firebaseConnect(({ propertyId }) => [`/analyses/${propertyId}`, '/settings']),
  reduxConnect(({ firebase }, { propertyId }) => {
    return {
      analysis: dataToJS(firebase, `analyses/${propertyId}`),
      settings: dataToJS(firebase, 'settings'),
    }
  }),
)(App)
