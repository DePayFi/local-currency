import timezoneToCurrency from './timezoneToCurrency'

class Currency {
  constructor({ amount, code, timeZone = Currency.timeZone() }) {
    this.amount = amount
    this.code = code || window._LocalCurrencyCode || Currency.getCode(timeZone)
    this.timeZone = timeZone
  }

  static getCode(timeZone) {
    return window._LocalCurrencyCode || timezoneToCurrency[timeZone || Currency.timeZone()] || 'USD'
  }

  static async rate({ from, to }) {
    if(to == undefined) { to = Currency.getCode() }
    let fromToUsd = await Currency.fromUSD({ amount: 1, code: from })
    let toToUsd = await Currency.fromUSD({ amount: 1, code: to })
    if(fromToUsd.code != from || toToUsd.code != to) {
      throw('Failed fetching rate!')
    }
    return fromToUsd.amount / toToUsd.amount
  }

  static async fromUSD({ amount, code, timeZone }) {
    let currency = new Currency({ amount, code, timeZone })
    let rate = await fetch('https://public.depay.com/currencies/' + currency.code)
      .then((response) => response.json())
      .then((data) => parseFloat(data))
      .catch(()=>{
        currency.code = "USD"
        return 1
      })
    currency.amount = currency.amount * rate
    return currency
  }

  static timeZone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  }

  toString(options = {}) {
    if(options.minimumFractionDigits == undefined && (this.amount % 1 === 0) && this.amount >= 100) {
      options.minimumFractionDigits = 0
    } else if(options.minimumFractionDigits == undefined) {
      options.minimumFractionDigits = 2
    }
    return new Intl.NumberFormat(navigator.language, {...options,
      style: 'currency',
      currency: this.code,
    }).format(this.amount)
  }
}

export default Currency
