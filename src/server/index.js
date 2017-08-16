const express = require('express')
const axios = require('axios')

const app = express()

// Zillow's timeseries `dt` parameter, some kind of property type id
const PROPERTY_TYPES = {
  all: 1,
  singleFamily: 2,
  condo: 3,
  studio: 30,
  oneBed: 31,
  twoBed: 32,
  threeBed: 33,
  fourBed: 34,
  fiveBedPlus: 35,
}

// Zillow's timeseries `m` parameter, some kind of report id
const REPORT_TYPES = {
  homeValueIndexForecast: 'zhvi_plus_forecast',
  medianListPrice: 35,
  medianListPriceSf: 18,
  rentIndex: 50,
  rentListPrice: 46,
  rentListPriceSf: 48,
}

const requestTimeseries = ({ regionId, reportType, propertyType = 'all' }) =>
  axios.get(`https://www.zillow.com/ajax/homevalues/data/timeseries.json`, {
    params: {
      r: regionId,
      m: REPORT_TYPES[reportType],
      dt: PROPERTY_TYPES[propertyType],
    },
  })

app.get('/', (req, res) => {
  const routes = app._router.stack
    .map(l => l.route && l.route.path)
    .filter(Boolean)
    .map(r => `<p>${r}</p>`)
    .join('')

  res.send(routes)
})

/**
 * Returns an array of region names.
 * @example
 * prefix=post
 * { names: ['Post Falls ID', ...] }
 */
app.get('/zillow/get-region-by-prefix', (req, res) => {
  axios
    .get('https://ac.zillowstatic.com/getRegionByPrefix', {
      params: {
        json: true,
        prefix: req.query.prefix,
      },
    })
    .then(({ data }) => res.json(data))
    .catch(err => res.status(400).send(err))
})

/**
 * Returns an array of region names.
 */
app.get('/zillow/resolve-region', (req, res) => {
  axios
    .get('https://www.zillow.com/ajax/region/ResolveRegion.htm', {
      params: {
        region: req.query.region,
      },
    })
    .then(({ data }) => res.json(data.results[0]))
    .catch(err => res.status(400).send(err))
})

app.get('/zillow/home-value-index-forecast', (req, res) => {
  requestTimeseries(Object.assign({}, req.query, { reportType: 'zhvi_plus_forecast' }))
    .then(({ data }) => res.json(data))
    .catch(err => res.status(400).json(err))
})

app.get('/zillow/median-list-price', (req, res) => {
  requestTimeseries(Object.assign({}, req.query, { reportType: 'medianListPrice' }))
    .then(({ data }) => res.json(data))
    .catch(err => res.status(400).json(err))
})

app.get('/zillow/median-list-price-sf', (req, res) => {
  requestTimeseries(Object.assign({}, req.query, { reportType: 'medianListPriceSf' }))
    .then(({ data }) => res.json(data))
    .catch(err => res.status(400).json(err))
})

app.get('/zillow/rent-index', (req, res) => {
  requestTimeseries(Object.assign({}, req.query, { reportType: 'rentIndex' }))
    .then(({ data }) => res.json(data))
    .catch(err => res.status(400).json(err))
})

app.get('/zillow/rent-list-price', (req, res) => {
  requestTimeseries(Object.assign({}, req.query, { reportType: 'rentListPrice' }))
    .then(({ data }) => res.json(data))
    .catch(err => res.status(400).json(err))
})

app.get('/zillow/rent-list-price-sf', (req, res) => {
  requestTimeseries(Object.assign({}, req.query, { reportType: 'rentListPriceSf' }))
    .then(({ data }) => res.json(data))
    .catch(err => res.status(400).json(err))
})

app.listen(5000, () => {
  console.log(`Server started at http://localhost:6000`)
})
