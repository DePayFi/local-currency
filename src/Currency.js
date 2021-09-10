import timezoneToCurrency from './timezoneToCurrency'

class Currency {
  constructor({ amount, code, timeZone = Currency.timeZone() }) {
    this.amount = amount
    this.code = code || timezoneToCurrency[timeZone] || 'USD'
    this.timeZone = timeZone
  }

  static async fromUSD({ amount, code, timeZone, apiKey }) {
    let currency = new Currency({ amount, code, timeZone })
    let rate = await fetch('https://api.depay.pro/v1/fiat?symbol=' + currency.code, {
      headers: { 'X-Api-Key': apiKey },
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
