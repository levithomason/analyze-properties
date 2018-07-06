const axios = require('axios')
const express = require('express')
const morgan = require('morgan')

//
// Types
//

// Zillow's timeseries `dt` parameter, some kind of property type id
enum PROPERTY_TYPES {
  all = 1,
  singleFamily = 2,
  condo = 3,
  studio = 30,
  oneBed = 31,
  twoBed = 32,
  threeBed = 33,
  fourBed = 34,
  fiveBedPlus = 35,
}

// Zillow's timeseries `m` parameter, some kind of report id
enum REPORT_TYPES {
  homeValueIndexForecast = 'zhvi_plus_forecast',
  medianListPrice = 35,
  medianListPriceSf = 18,
  rentIndex = 50,
  rentListPrice = 46,
  rentListPriceSf = 48,
}

interface IRequestTimeseriesConfig {
  regionId: string
  reportType: REPORT_TYPES
  propertyType: PROPERTY_TYPES
}

//
// Utils
//
const getTimeseries = ({ regionId, reportType, propertyType }: IRequestTimeseriesConfig) =>
  axios.get(`https://www.zillow.com/ajax/homevalues/data/timeseries.json`, {
    params: {
      r: regionId,
      m: reportType,
      dt: propertyType,
    },
  })

const handleTimeseriesRequest = (reportType: REPORT_TYPES) => (req, res) => {
  getTimeseries({ ...req.query, reportType })
    .then(({ data }) => {
      console.log('GOT', data)
      res.send(data)
    })
    .catch(err => res.status(400).json(err))
}

//
// App
//
const PORT = process.env.PORT || 5000

const app = express()

app.use(morgan('tiny'))

app.get('/', (req, res) => {
  const routes = app._router.stack
    .map(l => l.route && l.route.path)
    .filter(Boolean)
    .map(r => `<p><a href="${r}">${r}</a></p>`)
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

app.get(
  '/zillow/home-value-index-forecast',
  handleTimeseriesRequest(REPORT_TYPES.homeValueIndexForecast),
)

app.get('/zillow/median-list-price', handleTimeseriesRequest(REPORT_TYPES.medianListPrice))

app.get('/zillow/median-list-price-sf', handleTimeseriesRequest(REPORT_TYPES.medianListPriceSf))

app.get('/zillow/rent-index', handleTimeseriesRequest(REPORT_TYPES.rentIndex))

app.get('/zillow/rent-list-price', handleTimeseriesRequest(REPORT_TYPES.rentListPrice))

app.get('/zillow/rent-list-price-sf', handleTimeseriesRequest(REPORT_TYPES.rentListPriceSf))

app.listen(PORT, () => {
  console.debug(`Server started at http://localhost:${PORT}`)
})
