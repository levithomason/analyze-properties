import Deal from '../common/deal'
import { html, render } from 'lit-html'

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
    <pre>${content}</pre>
  `
}

render(helloTemplate(), document.body)
