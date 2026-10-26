// Quote request rules, shared by the website form (Vite) and the submit-quote Edge Function (Deno).
// Keep this file free of imports so it runs unchanged in both places.

export const CARGO_TYPES = ['construction', 'timber', 'agriculture', 'commercial', 'general'] as const
export type CargoType = (typeof CARGO_TYPES)[number]

/** Preferred loading windows in Nairobi time (D-31). */
export const TIME_WINDOWS = ['06-09', '09-12', '12-15', '15-19'] as const
export type TimeWindow = (typeof TIME_WINDOWS)[number]

/** Earliest bookable day is tomorrow; latest is 90 days ahead, both in Nairobi time (D-31). */
export const MIN_DAYS_AHEAD = 1
export const MAX_DAYS_AHEAD = 90

/** Maximum lengths, in characters, after cleaning. Mirrored by CHECK constraints in the database. */
export const MAX_LENGTH = {
  name: 100,
  phone: 20,
  email: 254,
  pickup: 150,
  dropoff: 150,
  description: 1000,
  weight: 100,
  size: 200,
  notes: 1000,
} as const

export type QuoteInput = {
  name: string
  /** Normalised to +254XXXXXXXXX. */
  phone: string
  email: string | null
  pickup: string
  dropoff: string
  cargoType: CargoType
  description: string | null
  weight: string | null
  size: string | null
  /** YYYY-MM-DD, a Nairobi calendar day. */
  preferredDate: string
  timeWindow: TimeWindow
  notes: string | null
}

export type QuoteField = keyof QuoteInput
export type FieldError = 'required' | 'tooLong' | 'invalid' | 'tooEarly' | 'tooLate'
export type QuoteErrors = Partial<Record<QuoteField, FieldError>>
export type ValidationResult = { ok: true; value: QuoteInput } | { ok: false; errors: QuoteErrors }

const NAIROBI_OFFSET_MS = 3 * 60 * 60 * 1000 // East Africa Time, UTC+3, no daylight saving
const DAY_MS = 24 * 60 * 60 * 1000
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** Today's date in Nairobi, as YYYY-MM-DD. */
export function nairobiToday(now: Date): string {
  return new Date(now.getTime() + NAIROBI_OFFSET_MS).toISOString().slice(0, 10)
}

export function addDays(isoDate: string, days: number): string {
  return new Date(Date.parse(`${isoDate}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10)
}

/** The first and last days a customer may choose. */
export function dateRange(now: Date): { min: string; max: string } {
  const today = nairobiToday(now)
  return { min: addDays(today, MIN_DAYS_AHEAD), max: addDays(today, MAX_DAYS_AHEAD) }
}

export function isRealDate(isoDate: string): boolean {
  if (!ISO_DATE.test(isoDate)) return false
  const parsed = new Date(`${isoDate}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === isoDate
}

/** Sundays are on request only (D-30). */
export function isSunday(isoDate: string): boolean {
  return new Date(`${isoDate}T00:00:00Z`).getUTCDay() === 0
}

/**
 * Kenyan mobile or landline-style number in local (07…, 01…) or international (+254…, 254…) form.
 * Returns +254XXXXXXXXX, or null if it isn't a Kenyan number.
 */
export function normalisePhone(raw: string): string | null {
  const compact = raw.replace(/[\s\-().]/g, '')
  const match = /^(?:\+?254|0)([17]\d{8})$/.exec(compact)
  return match ? `+254${match[1]}` : null
}

const EMAIL = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/

// Control characters other than tab and newline; never useful in a form and risky in email headers.
// oxlint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000B-\u001F\u007F]/g

/** Trim and strip control characters. Single-line fields also fold line breaks into spaces. */
export function cleanText(raw: unknown, multiline: boolean): string {
  if (typeof raw !== 'string') return ''
  let text = raw.replace(/\r\n?/g, '\n').replace(CONTROL, '')
  text = multiline ? text.replace(/\n{3,}/g, '\n\n') : text.replace(/[\n\t]+/g, ' ').replace(/ {2,}/g, ' ')
  return text.trim()
}

function field(source: Record<string, unknown>, key: QuoteField, multiline = false): string {
  return cleanText(source[key], multiline)
}

/** Validate and clean a quote request. The server runs exactly the same checks as the browser. */
export function validateQuote(raw: unknown, now: Date): ValidationResult {
  const source = raw !== null && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const errors: QuoteErrors = {}

  const required = (key: 'name' | 'pickup' | 'dropoff', min = 2): string => {
    const value = field(source, key)
    if (value.length < min) errors[key] = 'required'
    else if (value.length > MAX_LENGTH[key]) errors[key] = 'tooLong'
    return value
  }
  const optional = (key: 'description' | 'weight' | 'size' | 'notes', multiline = false): string | null => {
    const value = field(source, key, multiline)
    if (value.length > MAX_LENGTH[key]) errors[key] = 'tooLong'
    return value === '' ? null : value
  }

  const name = required('name')
  const pickup = required('pickup')
  const dropoff = required('dropoff')

  const rawPhone = field(source, 'phone')
  const phone = normalisePhone(rawPhone)
  if (rawPhone === '') errors.phone = 'required'
  else if (!phone) errors.phone = 'invalid'

  const rawEmail = field(source, 'email')
  if (rawEmail.length > MAX_LENGTH.email) errors.email = 'tooLong'
  else if (rawEmail !== '' && !EMAIL.test(rawEmail)) errors.email = 'invalid'

  const cargoType = source.cargoType
  if (typeof cargoType !== 'string' || cargoType === '') errors.cargoType = 'required'
  else if (!(CARGO_TYPES as readonly string[]).includes(cargoType)) errors.cargoType = 'invalid'

  const preferredDate = field(source, 'preferredDate')
  const { min, max } = dateRange(now)
  if (preferredDate === '') errors.preferredDate = 'required'
  else if (!isRealDate(preferredDate)) errors.preferredDate = 'invalid'
  else if (preferredDate < min) errors.preferredDate = 'tooEarly'
  else if (preferredDate > max) errors.preferredDate = 'tooLate'

  const timeWindow = source.timeWindow
  if (typeof timeWindow !== 'string' || timeWindow === '') errors.timeWindow = 'required'
  else if (!(TIME_WINDOWS as readonly string[]).includes(timeWindow)) errors.timeWindow = 'invalid'

  const description = optional('description', true)
  const weight = optional('weight')
  const size = optional('size')
  const notes = optional('notes', true)

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return {
    ok: true,
    value: {
      name,
      phone: phone as string,
      email: rawEmail === '' ? null : rawEmail,
      pickup,
      dropoff,
      cargoType: cargoType as CargoType,
      description,
      weight,
      size,
      preferredDate,
      timeWindow: timeWindow as TimeWindow,
      notes,
    },
  }
}

/** Request numbers are shown as at least four digits: "0412". */
export function formatRequestNo(id: number): string {
  return String(id).padStart(4, '0')
}
