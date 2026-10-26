// The notification email to the business. Plain text only, so customer input can never become HTML.
import type { CargoType, QuoteInput, TimeWindow } from '../_shared/quoteRules.ts'

const cargoLabels: Record<CargoType, string> = {
  construction: 'Construction and industrial materials',
  timber: 'Timber and hardware',
  agriculture: 'Farm produce',
  commercial: 'Shop stock or packaged goods (closed box)',
  general: 'Something else',
}

const windowLabels: Record<TimeWindow, string> = {
  '06-09': '6 to 9 am',
  '09-12': '9 am to 12',
  '12-15': '12 to 3 pm',
  '15-19': '3 to 7 pm',
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

// Built by hand rather than with Intl, so the wording is identical in Deno and Node.
function longDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00Z`)
  return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

/** Subject lines must stay on one line; cleanText already removed line breaks, this is a second guard. */
function oneLine(text: string, max: number): string {
  const flat = text.replace(/[\r\n]+/g, ' ')
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat
}

export function buildEmail(q: QuoteInput, requestNo: string): { subject: string; text: string } {
  const sunday = new Date(`${q.preferredDate}T00:00:00Z`).getUTCDay() === 0
  const lines = [
    `Quote request No. ${requestNo}`,
    '',
    'The customer asked for this day and time. It is a preference only: call them to agree the price and day.',
    '',
    `Name: ${q.name}`,
    `Phone: ${q.phone}`,
    `Email: ${q.email ?? '(not given)'}`,
    '',
    `Pickup: ${q.pickup}`,
    `Drop-off: ${q.dropoff}`,
    `Cargo: ${cargoLabels[q.cargoType]}`,
    `What it is: ${q.description ?? '(not given)'}`,
    `Weight: ${q.weight ?? '(not given)'}`,
    `Size or number of items: ${q.size ?? '(not given)'}`,
    '',
    `Preferred day: ${longDate(q.preferredDate)}${sunday ? ' (Sunday: on request)' : ''}`,
    `Preferred time: ${windowLabels[q.timeWindow]} (Nairobi time)`,
    '',
    `Notes: ${q.notes ?? '(none)'}`,
  ]
  return {
    subject: oneLine(`Quote request No. ${requestNo}: ${q.pickup} to ${q.dropoff}`, 150),
    text: lines.join('\n'),
  }
}
