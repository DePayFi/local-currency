import timezoneToCurrency from './timezoneToCurrency'

class Currency {
  constructor({ amount, code, timeZone = Currency.timeZone() }) {
    this.amount = amount
    this.code = code || Currency.getCode(timeZone)
    this.timeZone = timeZone
  }

  static getCode(timeZone) {
    return timezoneToCurrency[timeZone || Currency.timeZone()] || 'USD'
  }

  static async fromUSD({ amount, code, timeZone }) {
    let currency = new Currency({ amount, code, timeZone })
    let rate = await fetch('https://public.depay.fi/currencies/' + currency.code)
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

  toString() {
    return new Intl.NumberFormat(navigator.language, {
      style: 'currency',
      currency: this.code,
    }).format(this.amount)
  }
}

export default Currency
