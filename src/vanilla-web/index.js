import Deal from '../common/deal'
import { html, render } from 'lit-html'
import { usd, percent } from '../common/lib'

const getFormatter = key => {
  if (/rate|ownership|capitalShare|cashOnCash|interest/i.test(key)) return percent
  if (/amount|income|total|cashNeeded|cashFlow|payment|balance|principle/i.test(key)) return usd

  return x => x
}

const table = rows => {
  const totals = {}
  const headers = rows.reduce((uniqueHeaders, row) => {
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
        ${rows.map(
          row =>
            html`
              <tr>
                ${headers.map((header, i) => {
                  const formatter = getFormatter(header)
                  const value = row[header]
                  if (i > 0) {
                    console.log('TOTAL', totals, header, value)

                    totals[header] += value
                  }

                  return html`
                    <td>${formatter(value)}</td>
                  `
                })}
              </tr>
            `,
        )}
        <tr>
          <td><strong>TOTAL</strong></td>
          ${headers.slice(1).map(header => {
            const formatter = getFormatter(header)
            const value = totals[header]

            return html`
              <td>${formatter(value)}</td>
            `
          })}
        </tr>
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
    .addPartner('Levi', 0.4, 0.5)
    .addPartner('Tyrone', 0.6, 0.5)

  const content = JSON.stringify(deal, null, 2)

  return html`
    <h3>Rental Units</h3>
    ${table(deal.rentalUnits)}

    <h3>Repairs</h3>
    ${table(deal.repairs)}

    <h3>Expenses</h3>
    ${table(deal.expenses)}

    <h3>Loans</h3>
    ${table(deal.loans)}

    <h3>Partners</h3>
    ${table(deal.partners)}

    <h3>Partnership</h3>
    ${table(deal.partnership)}

    <h3>Amortization Schedule</h3>
    ${table(deal.amortizationSchedule)}

    <pre>${content}</pre>
  `
}

render(helloTemplate(), document.body)
