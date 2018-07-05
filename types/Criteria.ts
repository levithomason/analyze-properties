interface MinMaxObject {
  min?: number
  max?: number
}

declare interface ICriteria {
  cashFlow: MinMaxObject
  capRate: MinMaxObject
  rentToValue: MinMaxObject
  totalCashNeeded: MinMaxObject
  netOperatingIncome: MinMaxObject
  cashOnCash: MinMaxObject
  grossRentMultiplier: MinMaxObject
  debtServiceCoverageRatio: MinMaxObject
  internalRateOfReturn: MinMaxObject
}
