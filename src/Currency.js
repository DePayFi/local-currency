import timezoneToCurrency from './timezoneToCurrency'

class Currency {
  constructor({ amount, timeZone = Currency.timeZone() }) {
    this.amount = amount
    this.timeZone = timeZone
    this.code = timezoneToCurrency[this.timeZone] || 'USD'
  }

  static async fromUSD({ amount, timeZone }) {
    let currency = new Currency({ amount, timeZone })
    let rate = await fetch('https://api.depay.pro/v1/fiat?symbol=' + currency.code, {
      headers: { 'X-Api-Key': Currency.apiKey },
    })
      .then((response) => response.json())
      .then((data) => parseFloat(data.usd))
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
