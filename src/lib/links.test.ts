import { describe, expect, it } from 'vitest'
import { mapsHref, telHref, waHref } from './links'

describe('telHref', () => {
  it('turns a spaced local mobile number into an international tel: link', () => {
    expect(telHref('0745 822 788')).toBe('tel:+254745822788')
  })

  it('rejects something that is not a Kenyan mobile number', () => {
    expect(() => telHref('12345')).toThrow()
  })
})

describe('waHref', () => {
  it('builds a wa.me link without a message', () => {
    expect(waHref('0783 330 889')).toBe('https://wa.me/254783330889')
  })

  it('encodes apostrophes, ampersands and newlines in the message', () => {
    const text = "Hello Kims Cargo & Logistics\nPickup: Mama Njeri's shop, Kitengela"
    expect(waHref('0745 822 788', text)).toBe('https://wa.me/254745822788?text=' + encodeURIComponent(text))
  })

  it('rejects an invalid number', () => {
    expect(() => waHref('0745')).toThrow()
  })
})

describe('mapsHref', () => {
  it('returns null while the address is unknown', () => {
    expect(mapsHref(null)).toBeNull()
  })

  it('builds a Google Maps search link for an address', () => {
    expect(mapsHref('Kitengela, Kenya')).toBe(
      'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Kitengela, Kenya'),
    )
  })
})
