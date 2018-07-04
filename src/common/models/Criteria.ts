/**
 * A user's purchase criteria.  Min/max are compared to an Analysis.
 */
class Criteria {
  cashFlow = { min: 100 }
  capRate = { min: 0.05 }
  rentToValue = { min: 0 }
  totalCashNeeded = { max: 68000 }
  netOperatingIncome = { min: 0 }
  cashOnCash = { min: 0 }
  grossRentMultiplier = { max: 0 }
  debtServiceCoverageRatio = { min: 0 }
  internalRateOfReturn = { min: 0 }
}

export default Criteria
