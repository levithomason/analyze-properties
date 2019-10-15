import Deal from '../common/deal'
import { html, render } from 'lit-html'
import { usd, percent, ratio } from '../common/lib'

const getFormatter = key => {
  if (/ratio|toValue/i.test(key)) return ratio
  if (/rate|ownership|share|cashOnCash/i.test(key)) return percent
  if (/amount|income|total|cash|payment|balance|principle|interest/i.test(key)) return usd

  if (/rule/i.test(key)) {
    return x =>
      html`
        <div class="ui-indicator ${x ? 'positive' : 'negative'}">${x}</div>
      `
  }

  return x => x
}

const table = (rows, { title, total } = {}) => {
  const rowsArr = [].concat(rows).filter(Boolean)
  const totals = {}
  const headers = rowsArr.reduce((uniqueHeaders, row) => {
    Object.keys(row).forEach((header, i) => {
      if (!uniqueHeaders.includes(header)) {
        uniqueHeaders.push(header)
        if (i > 0) {
          totals[header] = 0
        }
      }
    })

    return uniqueHeaders
  }, [])

  return html`
    ${title &&
      html`
        <h3 style="margin-bottom:0;">${title}</h3>
      `}
    <table>
      <thead>
        <tr>
          ${headers.map(
            header =>
              html`
                <th>${header}</th>
              `,
          )}
        </tr>
      </thead>
      <tbody>
        ${rowsArr.map(
          row =>
            html`
              <tr>
                ${headers.map((header, i) => {
                  const formatter = getFormatter(header)
                  const value = row[header]
                  if (i > 0) {
                    totals[header] += value
                  }

                  return html`
                    <td>${formatter(value)}</td>
                  `
                })}
              </tr>
            `,
        )}
        ${total &&
          html`
            <tr>
              <td><strong>TOTAL</strong></td>
              ${headers.slice(1).map(header => {
                const formatter = getFormatter(header)
                const value = totals[header]

                return html`
                  <td><strong>${formatter(value)}</strong></td>
                `
              })}
            </tr>
          `}
      </tbody>
    </table>
  `
}

// This is a lit-html template function. It returns a lit-html template.
const helloTemplate = () => {
  const deal = new Deal()

  deal
    .setPurchasePrice(171823)
    .setPurchaseCost(0.02)
    .addRentalUnit('1506', 875, 2, 1, 720)
    .addRentalUnit('1504', 1040, 2, 1, 720)
    .addRepair('1504 Remodel', 11000)
    .addRepair('Water spigot', 140)
    .addExpense('Tax', 1800)
    .addExpense('Insurance', 1200)
    .addExpense('WSG', 120 * 12)
    .addExpense('Vacancy', 0.05)
    .addExpense('CapEx', 0.05)
    .addExpense('Maintenance', 0.05)
    .addExpense('Management', 0.1)
    .addAmortizedLoan('HELOC', 0.25, 0, 0.0499, 180)
    .addAmortizedLoan('Bank', 0.75, 0.25, 0.04875, 360)
    .addPartner('Levi', 0.5, 0.5, 0.4)
    .addPartner('Tyrone', 0.5, 0.5, 0.6)

  const content = JSON.stringify(deal, null, 2)

  return html`
    ${table(deal.analysis, {
      title: 'Analysis',
    })}
    ${table(deal.rules, {
      title: 'Rules',
    })}

    <hr />

    ${table(deal.rentalUnits, {
      title: 'Rental Units',
      total: true,
    })}
    ${table(deal.repairs, {
      title: 'Repairs',
      total: true,
    })}
    ${table(deal.expenses, {
      title: 'Expenses',
      total: true,
    })}
    ${table(deal.loans, {
      title: 'Loans',
      total: true,
    })}
    ${table(deal.partners, {
      title: 'Partners',
      total: true,
    })}
    ${table(deal.partnership, {
      title: 'Partnership',
      total: true,
    })}
    ${table(deal.amortizationSchedule, {
      title: 'Amortization Schedule',
      total: true,
    })}

    <pre>${content}</pre>
  `
}

render(helloTemplate(), document.body)
