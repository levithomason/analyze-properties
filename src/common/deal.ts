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
  profitShare: number
  lossShare: number
  capitalShare: number

  constructor(name, profitShare, lossShare, capitalShare) {
    this.name = name
    this.profitShare = profitShare
    this.lossShare = lossShare
    this.capitalShare = capitalShare
  }
}

export default class Deal {
  grossAnnualIncome: number
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

    Object.defineProperties(this, {
      //
      // Repairs
      //

      repairAmount: {
        enumerable: true,
        get() {
          return this.repairs.reduce((acc, next) => acc + next.amount, 0)
        },
      },

      //
      // Income
      //

      grossAnnualIncome: {
        enumerable: true,
        get() {
          return this.rentalUnits.reduce((acc, next) => acc + next.annualIncome, 0)
        },
      },

      grossMonthlyIncome: {
        enumerable: true,
        get() {
          return this.rentalUnits.reduce((acc, next) => acc + next.monthlyIncome, 0)
        },
      },

      income: {
        enumerable: true,
        get() {
          return {
            grossMonthlyIncome: this.grossMonthlyIncome,
            grossAnnualIncome: this.grossAnnualIncome,
          }
        },
      },

      //
      // Expenses
      //

      annualExpenses: {
        enumerable: true,
        get() {
          return this.expenses.reduce((acc, next) => acc + next.annualAmount, 0)
        },
      },

      monthlyExpenses: {
        enumerable: true,
        get() {
          return this.expenses.reduce((acc, next) => acc + next.monthlyAmount, 0)
        },
      },

      //
      // Analysis & Returns
      //

      cashNeeded: {
        enumerable: true,
        get() {
          return usd(this.downPayment + this.purchaseCost + this.repairAmount)
        },
      },

      rentToValue: {
        enumerable: true,
        get() {
          return percent(this.grossMonthlyIncome / this.purchasePrice)
        },
      },

      monthlyCashFlow: {
        enumerable: true,
        get() {
          return usd(this.grossMonthlyIncome - this.monthlyExpenses - this.monthlyDebtService)
        },
      },

      annualCashFlow: {
        enumerable: true,
        get() {
          return usd(this.monthlyCashFlow * 12)
        },
      },

      cashOnCash: {
        enumerable: true,
        get() {
          return percent(this.annualCashFlow / this.cashNeeded)
        },
      },

      capRate: {
        enumerable: true,
        get() {
          return usd(this.netOperatingIncome / this.purchasePrice)
        },
      },

      netOperatingIncome: {
        enumerable: true,
        get() {
          return this.grossAnnualIncome - this.annualExpenses
        },
      },

      debtServiceCoverageRatio: {
        enumerable: true,
        get() {
          return percent(this.grossMonthlyIncome / this.monthlyDebtService)
        },
      },

      analysis: {
        enumerable: true,
        get() {
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
        },
      },

      //
      // Rules
      //
      fiftyPercentRule: {
        enumerable: true,
        get() {
          return this.grossMonthlyIncome / 2 - this.monthlyDebtService > 0
        },
      },

      onePercentRule: {
        enumerable: true,
        get() {
          return this.rentToValue > 0.01
        },
      },

      rules: {
        enumerable: true,
        get() {
          return {
            fiftyPercentRule: this.fiftyPercentRule,
            onePercentRule: this.onePercentRule,
          }
        },
      },

      //
      // Financing
      //

      downPayment: {
        enumerable: true,
        get() {
          return this.loans.reduce((acc, next) => acc + next.downAmount, 0)
        },
      },

      financedAmount: {
        enumerable: true,
        get() {
          return this.loans.reduce((acc, next) => acc + next.financedAmount, 0)
        },
      },

      monthlyDebtService: {
        enumerable: true,
        get() {
          return this.loans.reduce((acc, loan) => acc + loan.monthlyPayment, 0)
        },
      },

      annualDebtService: {
        enumerable: true,
        get() {
          return usd(this.monthlyDebtService * 12)
        },
      },

      amortizationSchedule: {
        enumerable: true,
        get() {
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
        },
      },

      financing: {
        enumerable: true,
        get() {
          return {
            downPayment: this.downPayment,
            financedAmount: this.financedAmount,
            monthlyDebtService: this.monthlyDebtService,
            annualDebtService: this.annualDebtService,
            amortizationSchedule: this.amortizationSchedule,
          }
        },
      },

      //
      // Partners
      //

      partnership: {
        enumerable: true,
        get() {
          return this.partners.reduce((acc, next) => {
            const myCashNeeded = usd(this.cashNeeded * next.capitalShare)
            const myMonthlyCashFlow = usd(this.monthlyCashFlow * next.profitShare)
            const myAnnualCashFlow = usd(this.annualCashFlow * next.profitShare)
            const myNetOperatingIncome = usd(this.netOperatingIncome * next.profitShare)
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
        },
      },
    })
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

  addPartner(name, profitShare, lossShare, capitalShare) {
    this.partners.push(new Partner(name, profitShare, lossShare, capitalShare))
    return this
  }
}
