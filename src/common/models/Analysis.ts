import _ from 'lodash/fp'
import { PMT } from '../resources/rei'

/**
 * Computed values from a Worksheet.
 */
class Analysis {
  // Purchase & Rehab
  amountFinanced = 0
  loanToValue = 0
  totalCashNeeded = 0
  equity = 0

  // Operation
  operatingExpenseAmount = 0
  operatingExpenseRate = 0
  operatingIncome = 0
  netOperatingIncome = 0
  debtService = 0
  cashFlow = 0

  // Returns
  sellingCostsAmount = 0
  capRate = 0
  cashOnCash = 0
  returnOnInvestment = 0
  internalRateOfReturn = 0

  // Ratios
  rentToValue = 0
  grossRentMultiplier = 0
  debtServiceCoverageRatio = 0
  capitalExpendituresRate = 0

  crunch(worksheet) {
    const x = worksheet
    // TODO these extra worksheet figures should be calculated by the new
    // multi-value pricing object (i.e. total, rate, itemized)
    x.downAmount = x.downRate * x.purchasePrice
    x.purchaseCostsAmount = x.purchaseCostsRate * x.purchasePrice
    x.grossPotentialRent = x.grossMonthlyRent * 12

    // TODO these worksheet values should be pre-calculated when the worksheet is updated

    // Purchase & Rehab
    // ----------------------------------------
    this.amountFinanced = x.purchasePrice - x.downAmount
    this.loanToValue = this.amountFinanced / x.purchasePrice
    this.totalCashNeeded = x.isFinanced
      ? x.downAmount + x.purchaseCostsAmount + x.rehabCosts
      : x.purchasePrice + x.purchaseCostsAmount + x.rehabCosts
    this.equity = x.isFinanced ? x.marketValue - this.amountFinanced : x.marketValue

    // Operation
    // ----------------------------------------
    this.operatingExpenseAmount = _.sum([
      x.taxes,
      x.insurance,
      x.managementRate * x.grossPotentialRent * x.vacancyRate,
      x.maintenanceRate * x.grossPotentialRent,
      x.capitalExpendituresRate * x.grossPotentialRent,
      x.otherExpenses,
    ])
    this.operatingIncome =
      x.grossPotentialRent - x.grossPotentialRent * x.vacancyRate + x.otherIncome * 12
    this.operatingExpenseRate = this.operatingExpenseAmount / this.operatingIncome
    x.netOperatingIncome = this.operatingIncome - this.operatingExpenseAmount
    // TODO verify against a calculator, https://www.mtgprofessor.com/formulas.htm
    // TODO ARP
    x.debtService = x.isFinanced ? PMT(this.amountFinanced, x.rate / 12, x.term * 12) : 0
    x.cashFlow = x.isFinanced
      ? x.netOperatingIncome / 12 - x.debtService
      : x.netOperatingIncome / 12

    // Returns
    // ----------------------------------------
    x.sellingCostsAmount = x.sellingCostRate * x.purchasePrice

    x.capRate = x.netOperatingIncome / x.purchasePrice
    x.cashOnCash = x.cashFlow * 12 / this.totalCashNeeded
    x.returnOnInvestment =
      (x.cashFlow * 12 + this.equity - x.sellingCostsAmount - this.totalCashNeeded) /
      this.totalCashNeeded
    // TODO IRR, verify how the 'years' work here, uses ROI which includes equity, need amortization schedule?
    // const years = 1
    // x.internalRateOfReturn = Math.pow(1 + x.returnOnInvestment, 1 / years) - 1

    // Ratios
    // ----------------------------------------
    x.rentToValue = x.grossMonthlyRent / x.purchasePrice
    x.grossRentMultiplier = x.purchasePrice / x.grossPotentialRent
    // TODO generate an amortization schedule
    // TODO debt service is slightly inflated due to not accounting for interest paydown, sum amortization schedule
    x.debtServiceCoverageRatio = x.isFinanced ? x.netOperatingIncome / (x.debtService * 12) : 1

    return x
  }
}

export default Analysis
