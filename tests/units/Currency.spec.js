import fetchMock from 'fetch-mock'
import timezoneToCurrency from '../../src/timezoneToCurrency'
import { Currency } from 'dist/cjs/index.js'

describe('Currency', () => {

  beforeEach(()=>fetchMock.reset())

  it('provides current timezone', async ()=> {
    expect(Currency.timeZone()).toBeDefined()
  })

  it('sets user time zone if not provided', async ()=> {
    expect(
      (new Currency({ amount: 1 })).timeZone
    ).toEqual(Intl.DateTimeFormat().resolvedOptions().timeZone)
  })

  it('sets given time zone', async ()=> {
    expect(
      (new Currency({ amount: 1, timeZone: 'Pacific/Rarotonga' })).timeZone
    ).toEqual('Pacific/Rarotonga')
  })

  it('provides currency code based on timeZone', async ()=> {
    expect(
      (new Currency({ amount: 1, timeZone: 'Pacific/Rarotonga' })).code
    ).toEqual('NZD')
    expect(
      (new Currency({ amount: 1, timeZone: 'Europe/Berlin' })).code
    ).toEqual('EUR')
    expect(
      (new Currency({ amount: 1, timeZone: 'Europe/Zurich' })).code
    ).toEqual('CHF')
  })

  it('falls back to USD if timezone to currency is unknown', async ()=> {
    expect(
      (new Currency({ amount: 1, timeZone: 'Pacific/Unknown' })).code
    ).toEqual('USD')
  })

  it('converts currency to string', async ()=> {
    expect(
      (new Currency({ amount: 22.321, timeZone: 'Europe/Berlin' })).toString()
    ).toEqual('€22.32')
    expect(
      (new Currency({ amount: 22.325, timeZone: 'Europe/Zurich' })).toString()
    ).toEqual('CHF 22.33')
    expect(
      (new Currency({ amount: 12322.21, timeZone: 'Europe/Kaliningrad' })).toString()
    ).toEqual('RUB 12,322.21')
  })

  it('converts all known timezones to a currency string without error', async ()=> {
    Object.keys(timezoneToCurrency).forEach((key)=>{
      let currency = new Currency({ amount: 1, timeZone: key })
      currency.toString()
    })
  })

  describe('fetch currency rate', ()=>{

    beforeEach(()=>{
      fetchMock.get({
          url: 'https://api.depay.pro/v1/fiat?symbol=EUR',
          headers: { 'X-Api-Key': 'Test123' },
          overwriteRoutes: true
        }, { usd: '5.32' }
      )
    })

    it('converts currency via API', async ()=> {
      let currency = await Currency.fromUSD({ amount: 20, timeZone: 'Europe/Berlin', apiKey: 'Test123' })
      expect(currency.toString()).toEqual('€106.40')
    })

    it('converts currency via API also for given code', async ()=> {
      let currency = await Currency.fromUSD({ amount: 20, code: 'EUR', apiKey: 'Test123' })
      expect(currency.toString()).toEqual('€106.40')
    })
  })

  describe('set code explicitly', ()=> {
    
    it('converts currency to string', async ()=> {
      expect(
        (new Currency({ amount: 22.321, code: 'EUR' })).toString()
      ).toEqual('€22.32')
      expect(
        (new Currency({ amount: 22.321, code: 'CHF' })).toString()
      ).toEqual('CHF 22.32')
      expect(
        (new Currency({ amount: 22.321, code: 'USD' })).toString()
      ).toEqual('$22.32')
    })
  })
});
