console.clear()
console.log('----------------------------------')

const usd = x => Math.floor(x * 100) / 100
const percent = x => Math.floor(x * 100000) / 100000
const positive = x => Math.max(0, x)

const pmt = (amount, rate, periods) => {
  return (amount * rate * Math.pow(1 + rate, periods)) / (Math.pow(1 + rate, periods) - 1)
}

class Repair {
  name: string
  amount: number

  constructor(name, amount) {
    this.name = name
    this.amount = amount
  }
}

class RentalUnit {
  name: string
  monthlyIncome: number
  beds: number
  baths: number
  squareFeet: number

  constructor(name, monthlyRate, beds, baths, squareFeet) {
    this.name = name
    this.monthlyIncome = monthlyRate
    this.beds = beds
    this.baths = baths
    this.squareFeet = squareFeet

    Object.defineProperties(this, {
      annualIncome: { enumerable: true, value: this.annualIncome },
      rentPerSquareFoot: { enumerable: true, value: this.rentPerSquareFoot },
    })
  }

  get annualIncome() {
    return usd(this.monthlyIncome * 12)
  }

  get rentPerSquareFoot() {
    return usd(this.monthlyIncome / this.squareFeet)
  }
}

class Expense {
  name: string
  private _annualAmount: number
  private _monthlyAmount: number

  constructor(name, annualAmount) {
    this.name = name
    this.annualAmount = annualAmount

    Object.defineProperties(this, {
      _annualAmount: { enumerable: false },
      _monthlyAmount: { enumerable: false },
    })

    Object.defineProperties(this, {
      annualAmount: { enumerable: true, value: this.annualAmount },
      monthlyAmount: { enumerable: true, value: this.monthlyAmount },
    })
  }

  get annualAmount() {
    return this._annualAmount
  }

  set annualAmount(val) {
    this._annualAmount = usd(val)
    this._monthlyAmount = usd(this._annualAmount / 12)
  }

  get monthlyAmount() {
    return this._monthlyAmount
  }

  set monthlyAmount(val) {
    this._monthlyAmount = usd(val)
    this._annualAmount = this._monthlyAmount * 12
  }
}

/** A down less than 1 is considered a down percentage. */
class Loan {
  private _downAmount
  private _downRate

  name: string
  total: number
  rate: number
  periods: number
  financedAmount: number

  constructor(name, total, down, rate, periods) {
    this.name = name
    this.total = total
    this.rate = rate
    this.periods = periods

    if (down < 1) {
      this.downAmount = this.total * down
    } else {
      this.downRate = percent(down / total)
    }

    this.financedAmount = this.total - this.downAmount

    Object.defineProperties(this, {
      _downAmount: { enumerable: false },
      _downRate: { enumerable: false },
    })

    Object.defineProperties(this, {
      downAmount: { enumerable: true, value: this.downAmount },
      downRate: { enumerable: true, value: this.downRate },
    })
  }

  get downAmount() {
    return this._downAmount
  }

  set downAmount(val) {
    this._downAmount = usd(val)
    this._downRate = percent(this._downAmount / this.total)
  }

  get downRate() {
    return this._downRate
  }

  set downRate(val) {
    this._downRate = val
    this._downAmount = usd(this._downRate * this.total)
  }

  get monthlyPayment() {
    return usd(pmt(this.financedAmount, this.rate / 12, this.periods))
  }

  get schedule() {
    const schedule = []
    let balance = this.financedAmount
    let interest
    let principle

    for (let i = 0; i <= this.periods; i += 1) {
      interest = usd(balance * (this.rate / 12))
      principle = usd(this.monthlyPayment - interest)

      schedule.push({
        period: i,
        principle: usd(positive(Math.min(principle, this.monthlyPayment))),
        interest: usd(positive(interest)),
        payment: this.monthlyPayment,
        balance: usd(positive(balance)),
      })

      balance -= principle
    }

    return schedule
  }
}

class Partner {
  name: string
  capitalShare: number
  ownership: number

  constructor(name, capitalShare, ownership) {
    this.name = name
    this.capitalShare = capitalShare
    this.ownership = ownership
  }
}

class Deal {
  purchasePrice: number
  purchaseCost: number
  repairs: Repair[]
  rentalUnits: RentalUnit[]
  expenses: Expense[]
  loans: Loan[]
  partners: Partner[]

  constructor() {
    this.purchasePrice = 0
    this.purchaseCost = 0.02
    this.repairs = []
    this.rentalUnits = []
    this.expenses = []
    this.loans = []
    this.partners = []
  }

  //
  // Purchase
  //

  setPurchasePrice(val) {
    this.purchasePrice = usd(val)
    return this
  }

  /** An amount less than 1 is considered a percentage of the purchase price. */
  setPurchaseCost(val) {
    this.purchaseCost = usd(val < 1 ? val * this.purchasePrice : val)
    return this
  }

  //
  // Repairs
  //

  get repairAmount() {
    return this.repairs.reduce((acc, next) => acc + next.amount, 0)
  }

  //
  // Income
  //

  get grossAnnualIncome() {
    return this.rentalUnits.reduce((acc, next) => acc + next.annualIncome, 0)
  }

  get grossMonthlyIncome() {
    return this.rentalUnits.reduce((acc, next) => acc + next.monthlyIncome, 0)
  }

  get income() {
    return {
      grossMonthlyIncome: this.grossMonthlyIncome,
      grossAnnualIncome: this.grossAnnualIncome,
    }
  }

  //
  // Expenses
  //

  get annualExpenses() {
    return this.expenses.reduce((acc, next) => acc + next.annualAmount, 0)
  }

  get monthlyExpenses() {
    return this.expenses.reduce((acc, next) => acc + next.monthlyAmount, 0)
  }

  //
  // Analysis & Returns
  //

  get cashNeeded() {
    return usd(this.downPayment + this.purchaseCost + this.repairAmount)
  }

  get rentToValue() {
    return percent(this.grossMonthlyIncome / this.purchasePrice)
  }

  get monthlyCashFlow() {
    return usd(this.grossMonthlyIncome - this.monthlyExpenses - this.monthlyDebtService)
  }

  get annualCashFlow() {
    return usd(this.monthlyCashFlow * 12)
  }

  get cashOnCash() {
    return percent(this.annualCashFlow / this.cashNeeded)
  }

  get capRate() {
    return usd(this.netOperatingIncome / this.purchasePrice)
  }

  get netOperatingIncome() {
    return this.grossAnnualIncome - this.annualExpenses
  }

  get debtServiceCoverageRatio() {
    return percent(this.grossMonthlyIncome / this.monthlyDebtService)
  }

  get analysis() {
    return {
      cashNeeded: this.cashNeeded,
      rentToValue: this.rentToValue,
      monthlyCashFlow: this.monthlyCashFlow,
      annualCashFlow: this.annualCashFlow,
      cashOnCash: this.cashOnCash,
      capRate: this.capRate,
      netOperatingIncome: this.netOperatingIncome,
      debtServiceCoverageRatio: this.debtServiceCoverageRatio,
    }
  }

  //
  // Checks
  //
  get fiftyPercentRule() {
    return this.grossMonthlyIncome / 2 - this.monthlyDebtService > 0
  }

  get onePercentRule() {
    return this.rentToValue > 0.01
  }

  get checks() {
    return {
      fiftyPercentRule: this.fiftyPercentRule,
      onePercentRule: this.onePercentRule,
    }
  }

  //
  // Financing
  //

  get downPayment() {
    return this.loans.reduce((acc, next) => acc + next.downAmount, 0)
  }

  get financedAmount() {
    return this.loans.reduce((acc, next) => acc + next.financedAmount, 0)
  }

  get monthlyDebtService() {
    return this.loans.reduce((acc, loan) => acc + loan.monthlyPayment, 0)
  }

  get annualDebtService() {
    return usd(this.monthlyDebtService * 12)
  }

  get amortizationSchedule() {
    return this.loans.reduce((acc, loan) => {
      loan.schedule.forEach((next, i) => {
        const current = acc[i] || { principle: 0, interest: 0, payment: 0, balance: 0 }

        acc[i] = {
          period: next.period,
          principle: current.principle + next.principle,
          interest: current.interest + next.interest,
          payment: current.payment + next.payment,
          balance: current.balance + next.balance,
        }
      })

      return acc
    }, [])
  }

  get financing() {
    return {
      downPayment: this.downPayment,
      financedAmount: this.financedAmount,
      monthlyDebtService: this.monthlyDebtService,
      annualDebtService: this.annualDebtService,
      amortizationSchedule: this.amortizationSchedule,
    }
  }

  //
  // Deal Structure
  //

  addRepair(name, amount) {
    this.repairs.push(new Repair(name, amount))
    return this
  }

  addRentalUnit(name, rate, beds, baths, squareFeet) {
    this.rentalUnits.push(new RentalUnit(name, rate, beds, baths, squareFeet))
    return this
  }

  /** An amount less than 1 is considered a percentage of gross income. */
  addExpense(name, annualAmount) {
    const amount = annualAmount < 1 ? annualAmount * this.grossAnnualIncome : annualAmount
    this.expenses.push(new Expense(name, amount))
    return this
  }

  /** A total less than 1 is considered a percentage of the purchase price. */
  addAmortizedLoan(name, total, down, rate, periods) {
    const totalAmount = total < 1 ? total * this.purchasePrice : total
    this.loans.push(new Loan(name, totalAmount, down, rate, periods))
    return this
  }

  addPartner(name, capitalShare, ownership) {
    this.partners.push(new Partner(name, capitalShare, ownership))
    return this
  }

  //
  // Partners
  //
  get partnership() {
    return this.partners.reduce((acc, next) => {
      const myCashNeeded = usd(this.cashNeeded * next.capitalShare)
      const myMonthlyCashFlow = usd(this.monthlyCashFlow * next.ownership)
      const myAnnualCashFlow = usd(this.annualCashFlow * next.ownership)
      const myNetOperatingIncome = usd(this.netOperatingIncome * next.ownership)
      const myCashOnCash = percent(myAnnualCashFlow / myCashNeeded)

      acc.push({
        name: next.name,
        cashNeeded: myCashNeeded,
        monthlyCashFlow: myMonthlyCashFlow,
        annualCashFlow: myAnnualCashFlow,
        cashOnCash: myCashOnCash,
        netOperatingIncome: myNetOperatingIncome,
      })

      return acc
    }, [])
  }
}

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

console.log(deal)
console.log('===========================================')
console.log(
  JSON.stringify(
    {
      financing: deal.financing,
      income: deal.income,
      analysis: deal.analysis,
      checks: deal.checks,
      partnership: deal.partnership,
    },
    null,
    2,
  ),
)
