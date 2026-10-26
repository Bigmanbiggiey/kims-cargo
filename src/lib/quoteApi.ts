// Sends a quote request to the submit-quote Edge Function. The browser never talks to the database.
import type { QuoteErrors } from '../../supabase/functions/_shared/quoteRules.ts'

export type SubmitResult =
  | { kind: 'ok'; requestNo: string; notified: boolean; duplicate: boolean }
  | { kind: 'invalid'; fields: QuoteErrors }
  | { kind: 'captcha' | 'rate_limited' | 'server' | 'network' }

const TIMEOUT_MS = 20_000

export function submitUrl(): string | null {
  const base = import.meta.env.VITE_SUPABASE_URL as string | undefined
  return base ? `${base.replace(/\/+$/, '')}/functions/v1/submit-quote` : null
}

export async function submitQuote(payload: Record<string, unknown>): Promise<SubmitResult> {
  const url = submitUrl()
  if (!url) return { kind: 'server' }

  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch {
    return { kind: 'network' }
  }

  let body: Record<string, unknown> = {}
  try {
    body = (await res.json()) as Record<string, unknown>
  } catch {
    return { kind: 'server' }
  }

  // Only a 200 with a request number counts as received. Anything else is shown as not sent.
  if (res.ok && body.ok === true && typeof body.requestNo === 'string') {
    return {
      kind: 'ok',
      requestNo: body.requestNo,
      notified: body.notified === true,
      duplicate: body.duplicate === true,
    }
  }
  if (body.error === 'invalid' && body.fields && typeof body.fields === 'object') {
    return { kind: 'invalid', fields: body.fields as QuoteErrors }
  }
  if (body.error === 'captcha' || body.error === 'rate_limited') return { kind: body.error }
  return { kind: 'server' }
}
