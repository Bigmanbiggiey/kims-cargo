// Request handling for submit-quote, with every outside service passed in so it can be tested without
// Deno, a database or a mail server. index.ts wires in the real services.
import { formatRequestNo, type QuoteInput, validateQuote } from '../_shared/quoteRules.ts'

export const MAX_BODY_BYTES = 16 * 1024
export const MAX_PER_IP_PER_HOUR = 5

export type SaveResult =
  | { status: 'saved'; id: number }
  | { status: 'duplicate'; id: number; emailSent: boolean }
  | { status: 'rate_limited' }

export type Deps = {
  now: () => Date
  allowedOrigins: readonly string[]
  ipHashSalt: string
  verifyTurnstile: (token: string, ip: string | null) => Promise<boolean>
  saveQuote: (quote: QuoteInput, ipHash: string, dedupeKey: string) => Promise<SaveResult>
  /** Sends the notification email. Resolves false (never throws) if it could not be sent. */
  notify: (quote: QuoteInput, requestNo: string) => Promise<boolean>
  markEmail: (id: number, sent: boolean) => Promise<void>
  /** Operational log. Never pass submission contents here. */
  log: (message: string) => void
}

export type SubmitResponse =
  | { ok: true; requestNo: string; notified: boolean; duplicate: boolean }
  | { ok: false; error: 'invalid'; fields: Record<string, string> }
  | { ok: false; error: 'bad_request' | 'captcha' | 'rate_limited' | 'too_large' | 'forbidden' | 'server' }

/** The honeypot field. People never see it; simple bots fill it in. */
export const HONEYPOT_FIELD = 'website'

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

/** Same phone, route, day and window counts as the same request. */
export function dedupeKey(q: QuoteInput): string {
  const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
  return [q.phone, norm(q.pickup), norm(q.dropoff), q.preferredDate, q.timeWindow].join('|')
}

// Prefer headers set by the platform's proxy (a visitor can't override them) over X-Forwarded-For,
// whose first entry a visitor can write themselves. Which header Supabase sets is to be re-checked on deploy.
function clientIp(req: Request): string | null {
  const forwarded = req.headers.get('x-forwarded-for')
  return (
    req.headers.get('cf-connecting-ip')?.trim() ||
    req.headers.get('x-real-ip')?.trim() ||
    forwarded?.split(',')[0]?.trim() ||
    null
  )
}

function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type, authorization, apikey, x-client-info',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

export async function handle(req: Request, deps: Deps): Promise<Response> {
  const origin = req.headers.get('origin') ?? ''
  const allowed = deps.allowedOrigins.includes(origin)
  const headers: Record<string, string> = allowed ? corsHeaders(origin) : {}
  const reply = (status: number, body: SubmitResponse) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...headers, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    })

  if (!allowed) return reply(403, { ok: false, error: 'forbidden' })
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })
  if (req.method !== 'POST') return reply(405, { ok: false, error: 'bad_request' })

  const declared = Number(req.headers.get('content-length') ?? '0')
  if (declared > MAX_BODY_BYTES) return reply(413, { ok: false, error: 'too_large' })
  const text = await req.text()
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) return reply(413, { ok: false, error: 'too_large' })

  let body: Record<string, unknown>
  try {
    const parsed: unknown = JSON.parse(text)
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not an object')
    body = parsed as Record<string, unknown>
  } catch {
    return reply(400, { ok: false, error: 'bad_request' })
  }

  if (typeof body[HONEYPOT_FIELD] === 'string' && body[HONEYPOT_FIELD] !== '') {
    deps.log('rejected: honeypot filled')
    return reply(400, { ok: false, error: 'bad_request' })
  }

  const result = validateQuote(body, deps.now())
  if (!result.ok) return reply(400, { ok: false, error: 'invalid', fields: result.errors })
  const quote = result.value

  const ip = clientIp(req)
  const token = typeof body.turnstileToken === 'string' ? body.turnstileToken : ''
  try {
    if (token === '' || !(await deps.verifyTurnstile(token, ip))) {
      deps.log('rejected: security check failed')
      return reply(403, { ok: false, error: 'captcha' })
    }
  } catch {
    deps.log('error: security check unavailable')
    return reply(503, { ok: false, error: 'server' })
  }

  let saved: SaveResult
  try {
    const ipHash = await sha256Hex(`${deps.ipHashSalt}:${ip ?? 'unknown'}`)
    saved = await deps.saveQuote(quote, ipHash, await sha256Hex(dedupeKey(quote)))
  } catch {
    deps.log('error: could not save request')
    return reply(500, { ok: false, error: 'server' })
  }

  if (saved.status === 'rate_limited') {
    deps.log('rejected: rate limit')
    return reply(429, { ok: false, error: 'rate_limited' })
  }

  const requestNo = formatRequestNo(saved.id)
  if (saved.status === 'duplicate') {
    deps.log(`duplicate of request ${requestNo}`)
    return reply(200, { ok: true, requestNo, notified: saved.emailSent, duplicate: true })
  }

  // The request is saved, so the customer is told it was received even if the email fails.
  // The page then asks them to also send it on WhatsApp (notified: false).
  const notified = await deps.notify(quote, requestNo)
  try {
    await deps.markEmail(saved.id, notified)
  } catch {
    deps.log(`error: could not record email status for request ${requestNo}`)
  }
  deps.log(`saved request ${requestNo}; email ${notified ? 'sent' : 'FAILED'}`)
  return reply(200, { ok: true, requestNo, notified, duplicate: false })
}
