import { describe, expect, it } from 'vitest'
import {
  cleanText,
  dateRange,
  formatRequestNo,
  isSunday,
  nairobiToday,
  normalisePhone,
  validateQuote,
} from './quoteRules.ts'

// 26 Oct 2026, 22:30 UTC is already 27 Oct (01:30) in Nairobi.
const lateEvening = new Date('2026-10-26T22:30:00Z')
const morning = new Date('2026-10-26T06:00:00Z')

const valid = {
  name: 'Wanjiku Kamau',
  phone: '0712 345 678',
  email: '',
  pickup: 'Kitengela',
  dropoff: 'Westlands, Nairobi',
  cargoType: 'construction',
  description: '',
  weight: '',
  size: '',
  preferredDate: '2026-10-28',
  timeWindow: '06-09',
  notes: '',
}

describe('Nairobi dates', () => {
  it('uses the Nairobi calendar day, not UTC', () => {
    expect(nairobiToday(morning)).toBe('2026-10-26')
    expect(nairobiToday(lateEvening)).toBe('2026-10-27')
  })

  it('allows tomorrow up to 90 days ahead', () => {
    expect(dateRange(morning)).toEqual({ min: '2026-10-27', max: '2027-01-24' })
  })

  it('knows Sundays', () => {
    expect(isSunday('2026-11-01')).toBe(true)
    expect(isSunday('2026-11-02')).toBe(false)
  })
})

describe('phone numbers', () => {
  it.each([
    ['0712 345 678', '+254712345678'],
    ['0112-345-678', '+254112345678'],
    ['+254 712 345 678', '+254712345678'],
    ['254712345678', '+254712345678'],
  ])('accepts %s', (raw, expected) => {
    expect(normalisePhone(raw)).toBe(expected)
  })

  it.each(['12345', '0812345678', '07123456789', '+1 212 555 0100', 'call me'])('rejects %s', (raw) => {
    expect(normalisePhone(raw)).toBeNull()
  })
})

describe('cleanText', () => {
  it('strips control characters and folds line breaks in single-line fields', () => {
    expect(cleanText('  Kite\u0000ngela\r\nRoad\n  ', false)).toBe('Kitengela Road')
  })

  it('keeps paragraphs in multi-line fields', () => {
    expect(cleanText('Line one\r\n\r\n\r\n\r\nLine two', true)).toBe('Line one\n\nLine two')
  })

  it('treats non-strings as empty', () => {
    expect(cleanText(42, false)).toBe('')
  })
})

describe('validateQuote', () => {
  it('accepts a complete request and normalises it', () => {
    const result = validateQuote({ ...valid, email: 'w@example.co.ke', weight: ' about 3 tonnes ' }, morning)
    expect(result).toEqual({
      ok: true,
      value: {
        ...valid,
        phone: '+254712345678',
        email: 'w@example.co.ke',
        description: null,
        weight: 'about 3 tonnes',
        size: null,
        notes: null,
      },
    })
  })

  it('lists every missing required field', () => {
    const result = validateQuote({}, morning)
    expect(result).toEqual({
      ok: false,
      errors: {
        name: 'required',
        phone: 'required',
        pickup: 'required',
        dropoff: 'required',
        cargoType: 'required',
        preferredDate: 'required',
        timeWindow: 'required',
      },
    })
  })

  it('rejects today, past and far-future dates', () => {
    expect(validateQuote({ ...valid, preferredDate: '2026-10-26' }, morning)).toMatchObject({
      errors: { preferredDate: 'tooEarly' },
    })
    expect(validateQuote({ ...valid, preferredDate: '2025-01-01' }, morning)).toMatchObject({
      errors: { preferredDate: 'tooEarly' },
    })
    expect(validateQuote({ ...valid, preferredDate: '2027-01-25' }, morning)).toMatchObject({
      errors: { preferredDate: 'tooLate' },
    })
    expect(validateQuote({ ...valid, preferredDate: '2026-02-30' }, morning)).toMatchObject({
      errors: { preferredDate: 'invalid' },
    })
  })

  it('treats a day as past once it has started in Nairobi', () => {
    // At 01:30 on the 27th in Nairobi, the 27th is today, so the earliest day is the 28th.
    expect(validateQuote({ ...valid, preferredDate: '2026-10-27' }, lateEvening)).toMatchObject({
      errors: { preferredDate: 'tooEarly' },
    })
  })

  it('accepts a Sunday (on request)', () => {
    expect(validateQuote({ ...valid, preferredDate: '2026-11-01' }, morning).ok).toBe(true)
  })

  it('rejects unknown cargo types, time windows and bad emails', () => {
    expect(
      validateQuote({ ...valid, cargoType: 'livestock', timeWindow: '19-22', email: 'not-an-email' }, morning),
    ).toEqual({ ok: false, errors: { cargoType: 'invalid', timeWindow: 'invalid', email: 'invalid' } })
  })

  it('rejects over-long text', () => {
    expect(validateQuote({ ...valid, name: 'x'.repeat(101), notes: 'y'.repeat(1001) }, morning)).toEqual({
      ok: false,
      errors: { name: 'tooLong', notes: 'tooLong' },
    })
  })

  it('ignores anything that is not a known field', () => {
    const result = validateQuote({ ...valid, isAdmin: true }, morning)
    expect(result.ok && Object.keys(result.value)).not.toContain('isAdmin')
  })
})

describe('formatRequestNo', () => {
  it('pads to four digits', () => {
    expect(formatRequestNo(7)).toBe('0007')
    expect(formatRequestNo(12345)).toBe('12345')
  })
})
