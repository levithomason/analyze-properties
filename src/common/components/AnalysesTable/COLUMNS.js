import { usd, percent, ratio } from '../../lib'

// TODO abstract to top level for the entire app to use, include help text and presentational component
const COLUMNS = [
  {
    key: 'cashFlow',
    label: 'Cash Flow',
    format: usd,
  },
  {
    key: 'capRate',
    label: 'Cap Rate',
    format: percent,
  },
  {
    key: 'rentToValue',
    label: 'Rent Value',
    format: percent,
  },
  {
    key: 'totalCashNeeded',
    label: 'Cash Needed',
    format: usd,
  },
  {
    key: 'netOperatingIncome',
    label: 'NOI',
    format: usd,
  },
  {
    key: 'cashOnCash',
    label: 'COC',
    format: percent,
  },
  {
    key: 'grossRentMultiplier',
    label: 'GRM',
    format: ratio,
  },
  {
    key: 'debtServiceCoverageRatio',
    label: 'DSCR',
    format: ratio,
  },
  {
    key: 'returnOnInvestment',
    label: 'ROI',
    format: percent,
  },
]

export default COLUMNS
