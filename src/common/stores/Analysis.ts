import { makeDebugger } from '../lib'
import { FirebaseMapAdapter } from '../transport'
import { computed } from 'mobx'

const debug = makeDebugger('stores:user')

class Analysis extends FirebaseMapAdapter implements IAnalysis {
  constructor(pathOrRef, initialValue?: IAnalysis) {
    super(pathOrRef, initialValue)
    debug('new Analysis()', pathOrRef, initialValue)
  }

  @computed
  get favorite() {
    return this._map.get('favorite')
  }

  set favorite(val) {
    this._map.set('favorite', val)
  }

  @computed
  get notes() {
    return this._map.get('notes')
  }

  @computed
  get propertyId() {
    return this._map.get('propertyId')
  }

  @computed
  get image() {
    return this._map.get('image')
  }

  @computed
  get url() {
    return this._map.get('url')
  }

  @computed
  get address() {
    return this._map.get('address')
  }

  @computed
  get city() {
    return this._map.get('city')
  }

  @computed
  get state() {
    return this._map.get('state')
  }

  @computed
  get zip() {
    return this._map.get('zip')
  }

  @computed
  get county() {
    return this._map.get('county')
  }

  @computed
  get lat() {
    return this._map.get('lat')
  }

  @computed
  get lon() {
    return this._map.get('lon')
  }

  @computed
  get type() {
    return this._map.get('type')
  }

  @computed
  get year() {
    return this._map.get('year')
  }

  @computed
  get beds() {
    return this._map.get('beds')
  }

  @computed
  get baths() {
    return this._map.get('baths')
  }

  @computed
  get mlsNumber() {
    return this._map.get('mlsNumber')
  }

  @computed
  get sqft() {
    return this._map.get('sqft')
  }

  @computed
  get lotAcres() {
    return this._map.get('lotAcres')
  }

  @computed
  get purchasePrice() {
    return this._map.get('purchasePrice')
  }

  @computed
  get afterRepairValue() {
    return this._map.get('afterRepairValue')
  }

  @computed
  get marketValue() {
    return this._map.get('marketValue')
  }

  @computed
  get landValue() {
    return this._map.get('landValue')
  }

  @computed
  get isFinanced() {
    return this._map.get('isFinanced')
  }

  @computed
  get downRate() {
    return this._map.get('downRate')
  }

  @computed
  get downAmount() {
    return this._map.get('downAmount')
  }

  @computed
  get rate() {
    return this._map.get('rate')
  }

  @computed
  get term() {
    return this._map.get('term')
  }

  @computed
  get mortgageInsuranceUpfrontRate() {
    return this._map.get('mortgageInsuranceUpfrontRate')
  }

  @computed
  get mortgageInsuranceRecurringRate() {
    return this._map.get('mortgageInsuranceRecurringRate')
  }

  @computed
  get purchaseCostsRate() {
    return this._map.get('purchaseCostsRate')
  }

  @computed
  get purchaseCostsAmount() {
    return this._map.get('purchaseCostsAmount')
  }

  @computed
  get rehabCosts() {
    return this._map.get('rehabCosts')
  }

  @computed
  get grossMonthlyRent() {
    return this._map.get('grossMonthlyRent')
  }

  @computed
  get grossPotentialRent() {
    return this._map.get('grossPotentialRent')
  }

  @computed
  get otherIncome() {
    return this._map.get('otherIncome')
  }

  @computed
  get operatingExpenseRate() {
    return this._map.get('operatingExpenseRate')
  }

  @computed
  get taxes() {
    return this._map.get('taxes')
  }

  @computed
  get insurance() {
    return this._map.get('insurance')
  }

  @computed
  get managementRate() {
    return this._map.get('managementRate')
  }

  @computed
  get maintenanceRate() {
    return this._map.get('maintenanceRate')
  }

  @computed
  get capitalExpendituresRate() {
    return this._map.get('capitalExpendituresRate')
  }

  @computed
  get otherExpenses() {
    return this._map.get('otherExpenses')
  }

  @computed
  get vacancyRate() {
    return this._map.get('vacancyRate')
  }

  @computed
  get appreciationRate() {
    return this._map.get('appreciationRate')
  }

  @computed
  get incomeIncreaseRate() {
    return this._map.get('incomeIncreaseRate')
  }

  @computed
  get expenseIncreaseRate() {
    return this._map.get('expenseIncreaseRate')
  }

  @computed
  get sellingCostRate() {
    return this._map.get('sellingCostRate')
  }

  @computed
  get amountFinanced() {
    return this._map.get('amountFinanced')
  }

  @computed
  get loanToValue() {
    return this._map.get('loanToValue')
  }

  @computed
  get totalCashNeeded() {
    return this._map.get('totalCashNeeded')
  }

  @computed
  get equity() {
    return this._map.get('equity')
  }

  @computed
  get operatingExpenseAmount() {
    return this._map.get('operatingExpenseAmount')
  }

  @computed
  get operatingIncome() {
    return this._map.get('operatingIncome')
  }

  @computed
  get netOperatingIncome() {
    return this._map.get('netOperatingIncome')
  }

  @computed
  get debtService() {
    return this._map.get('debtService')
  }

  @computed
  get cashFlow() {
    return this._map.get('cashFlow')
  }

  @computed
  get sellingCostsAmount() {
    return this._map.get('sellingCostsAmount')
  }

  @computed
  get capRate() {
    return this._map.get('capRate')
  }

  @computed
  get cashOnCash() {
    return this._map.get('cashOnCash')
  }

  @computed
  get returnOnInvestment() {
    return this._map.get('returnOnInvestment')
  }

  @computed
  get rentToValue() {
    return this._map.get('rentToValue')
  }

  @computed
  get grossRentMultiplier() {
    return this._map.get('grossRentMultiplier')
  }

  @computed
  get debtServiceCoverageRatio() {
    return this._map.get('debtServiceCoverageRatio')
  }
}

export default Analysis
