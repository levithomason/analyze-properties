import axios from 'axios'
import * as express from 'express'
import * as httpErrors from 'http-errors'
import * as morgan from 'morgan'
import * as XML from 'pixl-xml'

//
// HTTP Errors
//
type HTTPErrorObject = {
  code: number
  message: string
  details?: object
}

const createHTTPError = (
  codeOrName: keyof httpErrors.NamedConstructors,
  message: string,
  details?: object,
): HTTPErrorObject => {
  const error = new httpErrors[codeOrName](message)

  return {
    code: error.statusCode,
    message: error.message,
    details,
  }
}

const { ZWSID } = process.env

//
// Zillow AJAX Types
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
    .filter(layer => layer.route && layer.route.path && layer.route.path !== '/')
    .map(layer => {
      console.log(layer)
      const apiDefinition = zillowWebServiceAPIs.find(api => api.endpoint === layer.route.path)

      if (apiDefinition && apiDefinition.requiredQueryParams.length) {
        const queryString = apiDefinition.requiredQueryParams
          .map(key => `${key}=${encodeURIComponent(exampleQueryParams[key])}`)
          .join('&')

        return `<p>
          <strong>${layer.route.path}</strong>
          <br>
          <a href="${layer.route.path}?${queryString}">${layer.route.path}?${queryString}</a>
        </p>`
      }

      return `<p>
          <a href="${layer.route.path}">${layer.route.path}</a>
        </p>`
    })
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
    .then(({ data }) => res.json(data.results))
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

//
// Zillow Web Service
//
const zillowParameters = {
  zpid:
    'The Zillow Property ID for the property for which to obtain information; the parameter type is an integer.',
  'unit-type':
    'A string value that specifies whether to show the percent change, parameter value of "percent," or dollar change, parameter value of "dollar".',
}

const exampleQueryParams = {
  address: () => '1915 n foxglove ln',
  citystatezip: () => 83854,
  count: () => 2,
  price: () => 120000,
  'unit-type': () => _.sample(['percent', 'dollar']),
  zpid: () => 113147994,
}

const zillowWebServiceAPIs = [
  {
    docs: 'https://www.zillow.com/howto/api/GetDeepSearchResults.htm',
    endpoint: '/zillow/get-deep-search-results',
    requiredQueryParams: ['address', 'citystatezip'],
    zillowAPIName: 'GetDeepSearchResults',
  },
  {
    docs: 'https://www.zillow.com/howto/api/GetUpdatedPropertyDetails.htm',
    endpoint: '/zillow/get-updated-property-details',
    requiredQueryParams: ['zpid'],
    zillowAPIName: 'GetUpdatedPropertyDetails',
  },
  {
    docs: 'https://www.zillow.com/howto/api/GetDeepComps.htm',
    endpoint: '/zillow/get-deep-comps',
    requiredQueryParams: ['zpid', 'count'],
    zillowAPIName: 'GetDeepComps',
  },
  {
    docs: 'https://www.zillow.com/howto/api/GetRateSummary.htm',
    endpoint: '/zillow/get-rate-summary',
    requiredQueryParams: [],
    zillowAPIName: 'GetRateSummary',
  },
  {
    docs: 'https://www.zillow.com/howto/api/GetMonthlyPayments.htm',
    endpoint: '/zillow/get-monthly-payments',
    requiredQueryParams: ['price'],
    zillowAPIName: 'GetMonthlyPayments',
  },
  {
    docs: 'https://www.zillow.com/howto/api/GetDemographics.htm',
    endpoint: '/zillow/get-demographics',
    requiredQueryParams: [],
    zillowAPIName: 'GetDemographics',
  },
  {
    docs: 'https://www.zillow.com/howto/api/GetRegionChildren.htm',
    endpoint: '/zillow/get-region-children',
    requiredQueryParams: [],
    zillowAPIName: 'GetRegionChildren',
  },
  {
    docs: 'https://www.zillow.com/howto/api/GetRegionChart.htm',
    endpoint: '/zillow/get-region-chart',
    requiredQueryParams: ['unit-type'],
    zillowAPIName: 'GetRegionChart',
  },
  {
    docs: 'https://www.zillow.com/howto/api/GetSearchResults.htm',
    endpoint: '/zillow/get-search-results',
    requiredQueryParams: ['address', 'citystatezip'],
    zillowAPIName: 'GetSearchResults',
  },
  {
    docs: 'https://www.zillow.com/howto/api/GetZestimate.htm',
    endpoint: '/zillow/get-zestimate',
    requiredQueryParams: ['zpid'],
    zillowAPIName: 'GetZestimate',
  },
  {
    docs: 'https://www.zillow.com/howto/api/GetChart.htm',
    endpoint: '/zillow/get-chart',
    requiredQueryParams: ['zpid', 'unit-type'],
    zillowAPIName: 'GetChart',
  },
  {
    docs: 'https://www.zillow.com/howto/api/GetComps.htm',
    endpoint: '/zillow/get-comps',
    requiredQueryParams: ['zpid', 'count'],
    zillowAPIName: 'GetComps',
  },
]

//
// Zillow Axios Web Service Instance
//
type InterceptedZillowResponse = {
  code: string
  message: string
}

const zillow = axios.create({
  baseURL: 'https://www.zillow.com/webservice/',
  timeout: 1000,
  responseType: 'text',
  params: { 'zws-id': ZWSID },
})
zillow.interceptors.request.use(config => {
  config.url += '.htm'
  return config
})
zillow.interceptors.response.use(
  response => {
    const json = XML.parse(response.data)
    console.log('INTERCEPT FULFILLED JSON', json)

    if (+json.message.code !== 0) {
      return createHTTPError(json.message.code, `Zillow Error: ${json.message.text}`)
    }

    // some responses return `results.result`, but if not present the `response` IS the result
    return json.response.results ? json.response.results.result : json.response
  },

  err => {
    console.log('INTERCEPT REJECTED', Object.keys(err))
    console.log({ ...err.response, data: '...REMOVED FOR LOGGING' })
    return Promise.reject(err.response)
  },
)

zillowWebServiceAPIs.forEach(({ docs, endpoint, requiredQueryParams }) => {
  app.get(endpoint, (req, res) => {
    console.log('START')

    const missingQueryParams = requiredQueryParams.filter(p => !req.query[p])
    console.log('MISSING PARAMS', missingQueryParams)

    if (missingQueryParams.length) {
      const error = createHTTPError('BadRequest', 'Missing required params.', {
        missingParams: missingQueryParams,
        docs,
      })
      res.status(error.code).send(error)
      return
    }

    zillow
      .get<InterceptedZillowResponse>(endpoint, { params: { ...req.query } })
      .then(data => {
        console.log('THEN', data)
        res.json(data)
      })

      .catch(err => {
        console.log('CATCH', err)
        const error = createHTTPError(err.status, err.statusText, { docs })
        res.status(error.code).send(error)
      })
  })
})

//
// Start
//

app.listen(PORT, () => {
  console.debug(`Server started at http://localhost:${PORT}`)
})
