// Server-side check of a Cloudflare Turnstile token. The token is single-use and expires after 300 s.
const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export async function verifyTurnstile(
  secret: string,
  token: string,
  ip: string | null,
  fetchFn: typeof fetch = fetch,
): Promise<boolean> {
  const form = new FormData()
  form.append('secret', secret)
  form.append('response', token)
  if (ip) form.append('remoteip', ip)
  const res = await fetchFn(SITEVERIFY, { method: 'POST', body: form, signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`siteverify HTTP ${res.status}`)
  const data = (await res.json()) as { success?: unknown }
  return data.success === true
}
