export const usd = x =>
  (+x).toLocaleString('en', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

export const percent = x =>
  (+x).toLocaleString('en', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  })

export const ratio = x =>
  (+x).toLocaleString('en', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

export const year = x => x + (+x === 1 ? 'yr' : 'yrs')
export const month = x => x + (+x === 1 ? 'mo' : 'mos')
export const day = x => x + (+x === 1 ? 'dy' : 'dys')

export const perYear = x => x + '/yr'
export const perMonth = x => x + '/mo'
export const perDay = x => x + '/dy'
