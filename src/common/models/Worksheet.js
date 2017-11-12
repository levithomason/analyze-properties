/**
 * Property pricing data mostly entered by the user.
 */
class Worksheet {
  propertyId = null
  analysisId = null

  // TODO support multi-type values
  // insurance = {
  //   mode: 'total',
  //   unit: 'usd',
  //   items: [],
  //   total: 100,
  //   rate: 0.1,
  // }

  // price
  purchasePrice = 0
  afterRepairValue = 0

  // value
  marketValue = 0
  landValue = 0

  // financing
  isFinanced = true
  downRate = 0
  downAmount = 0
  rate = 0
  term = 0
  mortgageInsuranceUpfrontRate = 0
  mortgageInsuranceRecurringRate = 0

  // purchase costs
  purchaseCostsRate = 0
  purchaseCostsAmount = 0

  // rehab costs
  rehabCosts = 0

  // income
  grossMonthlyRent = 0
  grossPotentialRent = 0
  otherIncome = 0

  // expenses
  operatingExpenseRate = 0
  taxes = 0
  insurance = 0
  managementRate = 0
  maintenanceRate = 0
  capitalExpendituresRate = 0
  otherExpenses = 0

  // assumptions
  vacancyRate = 0
  appreciationRate = 0
  incomeIncreaseRate = 0
  expenseIncreaseRate = 0
  sellingCostRate = 0
}

export default Worksheet
