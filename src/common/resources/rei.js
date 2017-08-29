import _ from 'lodash/fp'
import { request } from '../lib'
import { firebase } from '../modules/firebase'

// ----------------------------------------
// Utils
// ----------------------------------------
export const PMT = (amount, rate, term) => {
  return amount * rate * Math.pow(1 + rate, term) / (Math.pow(1 + rate, term) - 1)
}

export const checkDeal = (analysis, settings) => {
  return Object.keys(settings).reduce((acc, key) => {
    const analyzed = analysis[key]
    const { min, max } = settings[key]

    // don't check keys that haven't yet been analyzed
    if (_.isNil(analyzed)) return acc

    // don't check keys with missing nor zero min/max
    if (!min && !max) return acc

    // ensure value falls within range or infinity
    acc[key] = _.inRange(min || -Infinity, max ? max + 1 : Infinity, analyzed)

    return acc
  }, {})
}

export const crunch = analysis => {
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
    x.managementRate * x.grossPotentialRent * x.vacancyRate,
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
  x.debtService = PMT(x.amountFinanced, x.rate / 12, x.term * 12)
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
  x.debtServiceCoverageRatio = x.netOperatingIncome / (x.debtService * 12)

  return x
}

// ============================================================
// Realtor API
// ============================================================
export const getPropertyInfo = propertyId => {
  // console.debug('REI: getting property info', propertyId)
  const params = { client_id: 'rdc_mobile_native,8.3.3,android' }

  return request(
    `https://mapi-ng.rdc.moveaws.com/api/v1/properties/${propertyId}`,
    params,
  ).then(json => {
    const property = json.properties[0]
    // console.debug('REI: got property info', property)
    return property
  })
}

export const suggest = input => {
  const params = {
    input: input,
    area_types: 'neighborhood,city,county,postal_code,address,street',
    limit: 10,
    lat: 47.730493,
    long: -116.823844,
    client_id: 'rdcV8',
  }

  return request(`https://parser-external.geo.moveaws.com/suggest`, params)
}

export const trend = (lat, lon) => {
  const params = {
    lat,
    lon,
    client_id: 'rdc_mobile_native,8.3.3,android%20HTTP/1.1',
  }

  return request(`https://mapi-ng.rdc.moveaws.com/api/v1/area/trend`, params).then(res => res.trend)

  // TODO
  // Full Chart Data, need to stream body, also has CORS issues outside of realtor.com
  // (state, city, neighborhood) => {}
  // const type = neighborhood ? 'neighborhood' : 'city'
  // const query = [neighborhood, city, state].filter(Boolean).join('_')
  // return request(`http://www.realtor.com/local/markettrends/${type}/${query}`).then(res => JSON.parse(res))
}

// ============================================================
// Firebase
// ============================================================
const db = firebase.database()

// -------------------------------------
// Analysis
// -------------------------------------
export const getDefaultAnalysis = propertyId => {
  // console.debug('FIREBASE: getDefaultAnalysis()', propertyId)
  return getPropertyInfo(propertyId).then(info => {
    return crunch({
      // property info
      propertyId,
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
      beds: _.get('beds', info) || '',
      baths: _.get('baths', info) || '',
      mlsNumber: _.get('mls.id', info) || '',
      sqft: _.get('building_size.size', info) || 0,
      lotAcres:
        _.get('lot_size.units', info) === 'sqft'
          ? _.get('lot_size.size', info) || 0 / 43560
          : _.get('lot_size.size', info) || 0,

      // TODO trend data and comparison
      // TODO Tax benefit
      // price
      purchasePrice: info.price || 0,
      afterRepairValue: info.price || 0,

      // value
      marketValue: info.price || 0,
      landValue: _.get('tax_history[0].assessment.land', info) || 0,

      // financing
      isFinanced: true,
      downRate: 0.2,
      downAmount: 0,
      rate: 0.045,
      term: 30,
      // TODO include in loan payment calc?
      mortgageInsuranceUpfrontRate: 0, // only if down is <20%
      mortgageInsuranceRecurringRate: 0, // only if down is <20%

      // purchase costs
      purchaseCostsRate: 0.04,
      purchaseCostsAmount: 0,

      // rehab costs
      rehabCosts: 0,

      // income
      grossMonthlyRent: 1250,
      grossPotentialRent: 15000,
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
    })
  })
}

export const getAnalysis = propertyId => {
  return db.ref('analyses/' + propertyId).once('value').then(snapshot => {
    const analysis = snapshot.val()
    const crunched = analysis ? crunch(analysis) : analysis
    // console.debug('FIREBASE: getAnalysis()', crunched)
    return crunched
  })
}

export const setAnalysis = (propertyId, analysis) => {
  // console.debug('FIREBASE: setAnalysis()', propertyId, analysis)
  db.ref('analyses/' + propertyId).set(analysis)
}

export const onAnalysisChange = (propertyId, cb) => {
  db.ref('analyses/' + propertyId).on('value', cb)
}

export const offAnalysisChange = (propertyId, cb) => {
  db.ref('analyses/' + propertyId).off('value', cb)
}

// -------------------------------------
// Analyses
// -------------------------------------
export const getAnalyses = () => {
  // console.debug('FIREBASE: getAnalyses() start')
  return db.ref('analyses/').once('value').then(snapshot => {
    const analyses = snapshot.val()
    // console.debug('FIREBASE: getAnalyses() done', analyses)
    return analyses
  })
}

export const onAnalysesChange = cb => {
  db.ref('analyses/').on('value', cb)
}

export const offAnalysesChange = cb => {
  db.ref('analyses/').off('value', cb)
}

// -------------------------------------
// Settings
// -------------------------------------
export const getSettings = () => {
  return db.ref('settings/').once('value').then(snapshot => {
    const settings = snapshot.val()
    // console.debug('FIREBASE: getSettings()', settings)
    return settings
  })
}

export const setSettings = settings => {
  // console.debug('FIREBASE: setSettings()', settings)
  db.ref('settings/').set(settings)
}

export const onSettingsChange = cb => {
  db.ref('settings/').on('value', cb)
}

export const offSettingsChange = cb => {
  db.ref('settings/').off('value', cb)
}
