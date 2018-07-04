import _ from 'lodash/fp'
import { request } from '../lib'

// ----------------------------------------
// Utils
// ----------------------------------------
export const PMT = (amount, rate, term) => {
  return amount * rate * Math.pow(1 + rate, term) / (Math.pow(1 + rate, term) - 1)
}

export const checkDeal = (analysis, criteria) => {
  return Object.keys(criteria).reduce((acc, key) => {
    const analyzed = analysis[key]
    const { min, max } = criteria[key]

    // don't check keys that haven't yet been analyzed
    if (_.isNil(analyzed)) return acc

    // don't check keys with missing nor zero min/max
    if (!min && !max) return acc

    // ensure value falls within range or infinity
    acc[key] = _.inRange(min || -Infinity, max ? max + 1 : Infinity, analyzed)

    return acc
  }, {})
}

export const crunch = (analysis: IAnalysis): IAnalysis => {
  const x = analysis

  // Purchase & Rehab
  // ----------------------------------------
  x.downAmount = x.downRate * x.purchasePrice
  x.amountFinanced = x.purchasePrice - x.downAmount
  x.loanToValue = x.amountFinanced / x.purchasePrice
  x.purchaseCostsAmount = x.purchaseCostsRate * x.purchasePrice
  x.totalCashNeeded = x.isFinanced
    ? x.downAmount + x.purchaseCostsAmount + x.rehabCosts
    : x.purchasePrice + x.purchaseCostsAmount + x.rehabCosts
  x.equity = x.isFinanced ? x.marketValue - x.amountFinanced : x.marketValue

  // Operation
  // ----------------------------------------
  x.grossPotentialRent = x.grossMonthlyRent * 12
  x.operatingExpenseAmount = _.sum([
    x.taxes,
    x.insurance,
    x.managementRate * x.grossPotentialRent * (1 - x.vacancyRate),
    x.maintenanceRate * x.grossPotentialRent,
    x.capitalExpendituresRate * x.grossPotentialRent,
    x.otherExpenses,
  ])
  x.operatingIncome =
    x.grossPotentialRent - x.grossPotentialRent * x.vacancyRate + x.otherIncome * 12
  x.operatingExpenseRate = x.operatingExpenseAmount / x.operatingIncome
  x.netOperatingIncome = x.operatingIncome - x.operatingExpenseAmount
  // TODO verify against a calculator, https://www.mtgprofessor.com/formulas.htm
  // TODO ARP
  x.debtService = x.isFinanced ? PMT(x.amountFinanced, x.rate / 12, x.term * 12) : 0
  x.cashFlow = x.isFinanced ? x.netOperatingIncome / 12 - x.debtService : x.netOperatingIncome / 12

  // Returns
  // ----------------------------------------
  x.sellingCostsAmount = x.sellingCostRate * x.purchasePrice

  x.capRate = x.netOperatingIncome / x.purchasePrice
  x.cashOnCash = x.cashFlow * 12 / x.totalCashNeeded
  x.returnOnInvestment =
    (x.cashFlow * 12 + x.equity - x.sellingCostsAmount - x.totalCashNeeded) / x.totalCashNeeded
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

// ============================================================
// Realtor API
// ============================================================
export const getPropertyInfo = propertyId => {
  // console.debug('REI: getting property info', propertyId)
  const params = { client_id: 'rdc_mobile_native,8.3.3,android' }

  return request(`https://mapi-ng.rdc.moveaws.com/api/v1/properties/${propertyId}`, params).then(
    json => {
      const property = json.properties[0]
      // console.debug('REI: got property info', property)
      return property
    },
  )
}

export const suggest = input => {
  const params = {
    input,
    area_types: [
      // 'postal_code',
      // 'county',
      // 'city',
      // 'neighborhood',
      'address',
      // 'street',
    ].join(','),
    limit: 5,
    // lat: 47.730493,
    // long: -116.823844,
    client_id: 'rdcV8',
  }

  return request(`https://parser-external.geo.moveaws.com/suggest`, params).then(res => {
    return _.map(
      result => ({
        propertyId: result.mpr_id,
        address: _.first(result.full_address),
      }),
      res.autocomplete,
    )
  })
}

export const trend = (lat, lon) => {
  const params = {
    lat,
    lon,
    client_id: 'rdc_mobile_native,8.3.3,android%20HTTP/1.1',
  }

  return request(`https://mapi-ng.rdc.moveaws.com/api/v1/area/trend`, params).then(res => res.trend)

  // TODO
  // Full chart time series data, need to stream body, also has CORS issues outside of realtor.com
  // (state, city, neighborhood) => {}
  // const type = neighborhood ? 'neighborhood' : 'city'
  // const query = [neighborhood, city, state].filter(Boolean).join('_')
  // return request(`http://www.realtor.com/local/markettrends/${type}/${query}`).then(res => JSON.parse(res))
}

// ============================================================
// API
// ============================================================

// -------------------------------------
// Analysis
// -------------------------------------
/**
 * Used for very rough initial rent values:
 *
 * 5 bed 3 bath === $1,800
 * 4 bed 3 bath === $1,600
 * 3 bed 2 bath === $1,200
 * 3 bed 1 bath === $1,000
 * 2 bed 1 bath === $800
 * 1 bed 1 bath === $600
 * @param bed
 * @param bath
 */
export const estimatedRent = (bed, bath) => 200 + bed * 200 + bath * 200

/**
 * Converts a propertyInfo() result into an analysis shape.
 *
 * @param {object} info - A propertyInfo() call result.
 * @returns {object}
 */
export const propertyInfoToAnalysis = (info): IAnalysis => {
  const purchasePrice = info.price || 0

  const beds = _.get('beds', info) || 0
  const baths = _.get('baths', info) || 0
  const grossMonthlyRent = estimatedRent(beds, baths)

  const downRate = 0.2
  const purchaseCostsRate = 0.04

  const lotSize = _.get('lot_size.size', info) || 0

  return {
    favorite: false,
    notes: '',

    // property info
    propertyId: _.get('property_id', info) || '',
    image: _.get('photos[0].href', info) || '',
    url: _.get('rdc_web_url', info) || '',
    address: _.get('address.line', info) || '',
    city: _.get('address.city', info) || '',
    state: _.get('address.state_code', info) || '',
    zip: _.get('address.postal_code', info) || '',
    county: _.get('address.county', info) || '',
    lat: _.get('address.lat', info) || '',
    lon: _.get('address.lon', info) || '',
    type: _.get('prop_type', info) || '',
    year: _.get('year_built', info) || 0,
    beds,
    baths,
    mlsNumber: _.get('mls.id', info) || '',
    sqft: _.get('building_size.size', info) || 0,
    lotAcres: _.get('lot_size.units', info) === 'sqft' ? lotSize / 43560 : lotSize,

    // TODO trend data and comparison
    // TODO Tax benefit
    // price
    purchasePrice,
    afterRepairValue: purchasePrice,

    // value
    marketValue: purchasePrice,
    landValue: _.get('tax_history[0].assessment.land', info) || 0,

    // financing
    isFinanced: purchasePrice > 60000,
    downRate,
    downAmount: purchasePrice * downRate,
    rate: 0.045,
    term: 30,
    // TODO include in loan payment calc?
    mortgageInsuranceUpfrontRate: 0, // only if down is <20%
    mortgageInsuranceRecurringRate: 0, // only if down is <20%

    // purchase costs
    purchaseCostsRate,
    purchaseCostsAmount: purchasePrice * purchaseCostsRate,

    // rehab costs
    rehabCosts: 0,

    // income
    grossMonthlyRent,
    grossPotentialRent: grossMonthlyRent * 12,
    otherIncome: 0,

    // expenses
    operatingExpenseRate: 0.5,
    taxes: _.get('tax_history[0].tax', info) || 1200,
    insurance: 600,
    managementRate: 0.08,
    maintenanceRate: 0.05,
    capitalExpendituresRate: 0.1,
    otherExpenses: 0,

    // assumptions
    vacancyRate: 0.05,
    appreciationRate: 0.03,
    incomeIncreaseRate: 0.02,
    expenseIncreaseRate: 0.02,
    sellingCostRate: 0.06,
  }
}

export const getDefaultAnalysis = propertyId => {
  // console.debug('FIREBASE: getDefaultAnalysis()', propertyId)
  return getPropertyInfo(propertyId)
    .then(propertyInfoToAnalysis)
    .then(analysis => {
      analysis.propertyId = propertyId
      return crunch(analysis)
    })
}

export const getDefaultCriteria = (): Promise<ICriteria> => {
  // TODO store default criteria for each user, fetch from firebase
  return Promise.resolve({
    cashFlow: { min: 100 },
    capRate: { min: 0.06 },
    rentToValue: { min: 0.005 },
    totalCashNeeded: { max: 75000 },
    netOperatingIncome: { min: 0 },
    cashOnCash: { min: 0.05 },
    grossRentMultiplier: { max: 15 },
    debtServiceCoverageRatio: { min: 1 },
    internalRateOfReturn: { min: 0 },
  })
}
