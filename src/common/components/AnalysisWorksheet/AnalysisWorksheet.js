import _ from 'lodash/fp'
import React from 'react'
import { connect as reduxConnect } from 'react-redux'
import { firebaseConnect, getFirebase } from 'react-redux-firebase'
import Textarea from 'react-textarea-autosize'

import Checkbox from '../../../ui/components/Checkbox'
import Divider from '../../../ui/components/Divider'
import Header from '../../../ui/components/Header'
import Slider from '../../../ui/components/Slider'

import { usd, percent, perMonth } from '../../../common/lib'
import * as rei from '../../../common/resources/rei'

const textAreaStyle = {
  display: 'block',
  margin: 0,
  width: '100%',
  verticalAlign: 'text-top',
  fontFamily: 'monospace',
  fontSize: '12px',
  border: 'none',
  outline: 'none',
  resize: 'none',
}

class AnalysisWorksheet extends React.Component {
  handleBooleanChange = key => e => {
    console.debug('AnalysisWorksheet.handleBooleanChange()')
    const { checked } = e.target
    const { analysis, firebase, propertyId } = this.props

    firebase.set(
      `/analyses/${getFirebase().auth.uid}/${propertyId}`,
      rei.crunch({ ...analysis, [key]: !!checked }),
    )
  }

  handleNumberChange = key => e => {
    console.debug('AnalysisWorksheet.handleNumberChange()')
    const { value } = e.target
    const { analysis, firebase, propertyId } = this.props

    firebase.set(
      `/analyses/${getFirebase().auth.uid}/${propertyId}`,
      rei.crunch({ ...analysis, [key]: +value }),
    )
  }

  handleTextChange = key => e => {
    console.debug('AnalysisWorksheet.handleTextChange()')
    const { value } = e.target
    const { analysis, firebase, propertyId } = this.props

    firebase.set(`/analyses/${getFirebase().auth.uid}/${propertyId}`, { ...analysis, [key]: value })
  }

  render() {
    const { analysis, onNumberChange, onBooleanChange, onTextChange } = this.props

    if (!analysis) return null

    const {
      // WORKSHEET
      // price
      /* marketValue , */
      purchasePrice,
      /* afterRepairValue, */
      rehabCosts,
      // financing
      isFinanced,
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
      // appreciationRate,
      // incomeIncreaseRate,
      // expenseIncreaseRate,
      // sellingCostRate,

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

    return (
      <div style={{ background: '#f8f8f8' }}>
        <Divider thick fitted />

        <Textarea
          minRows={3}
          maxRows={10}
          placeholder="Notes"
          value={notes}
          onChange={this.handleTextChange('notes')}
          style={textAreaStyle}
        />

        <Divider thick fitted />

        <div style={{ padding: '1em' }}>
          <Header textAlign="center">Price</Header>
          <Slider
            unit="usd"
            label="Purchase"
            value={purchasePrice}
            min={10000}
            max={500000}
            step={1000}
            onChange={this.handleNumberChange('purchasePrice')}
          />
          {/*
          <Slider
            unit='usd'
            label='ARV'
            value={afterRepairValue}
            min={10000}
            max={500000}
            step={5000}
            onChange={this.handleNumberChange('afterRepairValue')}
          />
          <Slider
            unit='usd'
            label='Market Value'
            value={marketValue}
            min={10000}
            max={500000}
            step={5000}
            onChange={this.handleNumberChange('marketValue')}
          />
          */}
        </div>
        <div style={{ padding: '1em' }}>
          <Header textAlign="center">Income</Header>
          <Slider
            unit="usd"
            label="Rent"
            value={grossMonthlyRent}
            min={500}
            max={6000}
            step={5}
            onChange={this.handleNumberChange('grossMonthlyRent')}
          />
          <Slider
            unit="usd"
            label="Other Income"
            value={otherIncome}
            min={0}
            max={1000}
            step={5}
            onChange={this.handleNumberChange('otherIncome')}
          />
        </div>
        <div style={{ padding: '1em' }}>
          <Header textAlign="center">Costs</Header>
          <Slider
            unit="usd"
            label="Rehab"
            value={rehabCosts}
            min={0}
            max={100000}
            step={100}
            onChange={this.handleNumberChange('rehabCosts')}
          />
          <Slider
            unit="percent"
            label="Purchase"
            value={purchaseCostsRate}
            min={0}
            max={0.1}
            step={0.005}
            onChange={this.handleNumberChange('purchaseCostsRate')}
          />
        </div>
        <div style={{ padding: '1em' }}>
          <Header textAlign="center">Expenses</Header>
          <div style={{ textAlign: 'center' }}>
            <sup>{percent(operatingExpenseRate)} of income</sup>
          </div>
          <Slider
            unit="usd"
            label="Taxes"
            value={taxes}
            min={0}
            max={5000}
            step={5}
            onChange={this.handleNumberChange('taxes')}
          />
          <Slider
            unit="usd"
            label="Insurance"
            value={insurance}
            min={0}
            max={1500}
            step={5}
            onChange={this.handleNumberChange('insurance')}
          />
          <Slider
            unit="percent"
            label="Management"
            value={managementRate}
            min={0}
            max={0.1}
            step={0.01}
            onChange={this.handleNumberChange('managementRate')}
          />
          <Slider
            unit="percent"
            label="Maintenance"
            value={maintenanceRate}
            min={0}
            max={0.2}
            step={0.01}
            onChange={this.handleNumberChange('maintenanceRate')}
          />
          <Slider
            unit="percent"
            label="CapEx"
            value={capitalExpendituresRate}
            min={0}
            max={0.2}
            step={0.01}
            onChange={this.handleNumberChange('capitalExpendituresRate')}
          />
          <Slider
            unit="usd"
            label="Other"
            value={otherExpenses}
            min={0}
            max={12000}
            step={50}
            onChange={this.handleNumberChange('otherExpenses')}
          />
        </div>
        <div style={{ padding: '1em' }}>
          <Header textAlign="center">Assumptions</Header>
          <Slider
            unit="percent"
            label="Vacancy"
            value={vacancyRate}
            min={0}
            max={0.1}
            step={0.01}
            onChange={this.handleNumberChange('vacancyRate')}
          />
          {/*
          <Slider
            unit="percent"
            label="Appreciation"
            value={appreciationRate}
            min={0}
            max={0.05}
            step={0.01}
            onChange={this.handleNumberChange('appreciationRate')}
          />
          <Slider
            unit="percent"
            label="Income Increase"
            value={incomeIncreaseRate}
            min={0}
            max={0.05}
            step={0.01}
            onChange={this.handleNumberChange('incomeIncreaseRate')}
          />
          <Slider
            unit="percent"
            label="Expense Increase"
            value={expenseIncreaseRate}
            min={0}
            max={0.05}
            step={0.01}
            onChange={this.handleNumberChange('expenseIncreaseRate')}
          />
          <Slider
            unit="percent"
            label="Selling Cost"
            value={sellingCostRate}
            min={0}
            max={0.1}
            step={0.01}
            onChange={this.handleNumberChange('sellingCostRate')}
          />
          */}
        </div>
        <div style={{ padding: '1em' }}>
          <Header textAlign="center">
            <Checkbox checked={isFinanced} onChange={this.handleBooleanChange('isFinanced')} />
            Financing
          </Header>
          <div style={{ textAlign: 'center' }}>
            <sup>{perMonth(usd(debtService))}</sup>
          </div>
          <Slider
            unit="percent"
            label="Down"
            value={downRate}
            min={0}
            max={0.3}
            step={0.01}
            onChange={this.handleNumberChange('downRate')}
            disabled={!isFinanced}
          />
          <Slider
            unit="percent"
            label="Rate"
            value={rate}
            min={0.03}
            max={0.1}
            step={0.001}
            onChange={this.handleNumberChange('rate')}
            disabled={!isFinanced}
          />
          <Slider
            unit="year"
            label="Term"
            value={term}
            min={5}
            max={30}
            step={1}
            onChange={this.handleNumberChange('term')}
            disabled={!isFinanced}
          />
        </div>
      </div>
    )
  }
}

export default _.flow(
  firebaseConnect(({ propertyId }) => [`/analyses/${getFirebase().auth.uid}/${propertyId}`]),
  reduxConnect(({ firebase: { data: { analyses, criteria } } }, { propertyId }) => ({
    analysis: _.get([getFirebase().auth.uid, propertyId], analyses),
  })),
)(AnalysisWorksheet)
