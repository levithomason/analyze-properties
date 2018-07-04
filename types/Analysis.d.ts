declare interface IAnalysis {
  //
  // Worksheet
  //

  // user
  favorite?: boolean
  notes?: string

  // property info
  propertyId?: string | number
  image?: string
  url?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  county?: string
  lat?: number
  lon?: number
  type?: string
  year?: number
  beds?: number
  baths?: number
  mlsNumber?: string
  sqft?: number
  lotAcres?: number

  // price
  purchasePrice?: number
  afterRepairValue?: number

  // value
  marketValue?: number
  landValue?: number

  // financing
  isFinanced?: boolean
  downRate?: number
  downAmount?: number
  rate?: number
  term?: number
  mortgageInsuranceUpfrontRate?: number
  mortgageInsuranceRecurringRate?: number

  // purchase costs
  purchaseCostsRate?: number
  purchaseCostsAmount?: number

  // rehab costs
  rehabCosts?: number

  // income
  grossMonthlyRent?: number
  grossPotentialRent?: number
  otherIncome?: number

  // expenses
  operatingExpenseRate?: number
  taxes?: number
  insurance?: number
  managementRate?: number
  maintenanceRate?: number
  capitalExpendituresRate?: number
  otherExpenses?: number

  // assumptions
  vacancyRate?: number
  appreciationRate?: number
  incomeIncreaseRate?: number
  expenseIncreaseRate?: number
  sellingCostRate?: number

  //
  // Crunch
  //

  // Purchase & Rehab
  amountFinanced?: number
  loanToValue?: number
  totalCashNeeded?: number
  equity?: number

  // Operation
  operatingExpenseAmount?: number
  operatingIncome?: number
  netOperatingIncome?: number
  debtService?: number
  cashFlow?: number

  // Returns
  sellingCostsAmount?: number

  capRate?: number
  cashOnCash?: number
  returnOnInvestment?: number

  // Ratios
  rentToValue?: number
  grossRentMultiplier?: number
  debtServiceCoverageRatio?: number
}
