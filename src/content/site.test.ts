import { describe, expect, it } from 'vitest'
import { site } from './site'

describe('site facts', () => {
  it('lists both confirmed phone numbers, WhatsApp default first', () => {
    expect(site.phones.map((p) => p.display)).toEqual(['0745 822 788', '0783 330 889'])
  })

  it('keeps unconfirmed fleet specs empty rather than guessed', () => {
    expect(site.fleet.map((f) => f.id)).toEqual(['isuzu-frr33', 'fuso-fh'])
    expect(site.fleet.every((f) => f.payload === null && f.size === null)).toBe(true)
  })

  it('has the confirmed long-distance routes', () => {
    expect(site.longRoutes).toEqual([
      ['Nairobi', 'Nakuru', 'Eldoret'],
      ['Nairobi', 'Mombasa'],
    ])
  })

  it('has every confirmed area around Nairobi', () => {
    expect(site.areaGroups.flatMap((g) => g.places)).toEqual(
      expect.arrayContaining([
        'Kitengela', 'Birika', 'Ongata Rongai', 'Kajiado Town', 'Athi River', 'Syokimau',
        'Machakos Town', 'Thika', 'Juja', 'Ruiru', 'Gatundu',
      ]),
    )
  })

  it('marks client-supplied facts as pending', () => {
    expect(Object.values(site.pending).every((v) => v === null)).toBe(true)
  })
})
