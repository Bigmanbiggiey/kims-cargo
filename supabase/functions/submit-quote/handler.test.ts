import { describe, expect, it, vi } from 'vitest'
import { buildEmail } from './email.ts'
import { type Deps, dedupeKey, handle, MAX_BODY_BYTES, type SaveResult } from './handler.ts'
import { verifyTurnstile } from './turnstile.ts'

const ORIGIN = 'https://kimscargo.example'
const now = new Date('2026-10-26T06:00:00Z')

const valid = {
  name: 'Wanjiku Kamau',
  phone: '0712 345 678',
  email: '',
  pickup: 'Kitengela',
  dropoff: 'Westlands, Nairobi',
  cargoType: 'construction',
  description: '40 bags of cement',
  weight: '2 tonnes',
  size: '',
  preferredDate: '2026-10-28',
  timeWindow: '06-09',
  notes: '',
  website: '',
  turnstileToken: 'token-ok',
}

function makeDeps(overrides: Partial<Deps> = {}) {
  const logs: string[] = []
  const deps: Deps = {
    now: () => now,
    allowedOrigins: [ORIGIN],
    ipHashSalt: 'salt',
    verifyTurnstile: vi.fn(async (token: string) => token === 'token-ok'),
    saveQuote: vi.fn(async (): Promise<SaveResult> => ({ status: 'saved', id: 412 })),
    notify: vi.fn(async () => true),
    markEmail: vi.fn(async () => {}),
    log: (m: string) => logs.push(m),
    ...overrides,
  }
  return { deps, logs }
}

function post(body: unknown, init: { origin?: string; ip?: string; raw?: string } = {}) {
  return new Request('https://fn.example/submit-quote', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: init.origin ?? ORIGIN,
      'X-Forwarded-For': init.ip ?? '196.201.214.10, 10.0.0.1',
    },
    body: init.raw ?? JSON.stringify(body),
  })
}

async function json(res: Response) {
  return (await res.json()) as Record<string, unknown>
}

describe('submit-quote handler', () => {
  it('saves a valid request, emails it and returns the request number', async () => {
    const { deps, logs } = makeDeps()
    const res = await handle(post(valid), deps)
    expect(res.status).toBe(200)
    expect(await json(res)).toEqual({ ok: true, requestNo: '0412', notified: true, duplicate: false })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(ORIGIN)
    expect(deps.verifyTurnstile).toHaveBeenCalledWith('token-ok', '196.201.214.10')
    expect(deps.notify).toHaveBeenCalledWith(expect.objectContaining({ phone: '+254712345678' }), '0412')
    expect(deps.markEmail).toHaveBeenCalledWith(412, true)
    expect(logs).toEqual(['saved request 0412; email sent'])
  })

  it('stores a hashed IP, never the IP itself', async () => {
    const { deps } = makeDeps()
    await handle(post(valid), deps)
    const [, ipHash, key] = vi.mocked(deps.saveQuote).mock.calls[0]
    expect(ipHash).toMatch(/^[0-9a-f]{64}$/)
    expect(ipHash).not.toContain('196.201')
    expect(key).toMatch(/^[0-9a-f]{64}$/)
  })

  it("prefers the proxy's own IP header over X-Forwarded-For", async () => {
    const { deps } = makeDeps()
    const req = post(valid)
    req.headers.set('CF-Connecting-IP', '41.90.1.2')
    await handle(req, deps)
    expect(deps.verifyTurnstile).toHaveBeenCalledWith('token-ok', '41.90.1.2')
  })

  it('rejects invalid input with per-field reasons and saves nothing', async () => {
    const { deps } = makeDeps()
    const res = await handle(post({ ...valid, phone: '12', preferredDate: '2026-10-26' }), deps)
    expect(res.status).toBe(400)
    expect(await json(res)).toEqual({
      ok: false,
      error: 'invalid',
      fields: { phone: 'invalid', preferredDate: 'tooEarly' },
    })
    expect(deps.saveQuote).not.toHaveBeenCalled()
  })

  it('rejects a failed or missing security check', async () => {
    for (const turnstileToken of ['token-bad', '', undefined]) {
      const { deps } = makeDeps()
      const res = await handle(post({ ...valid, turnstileToken }), deps)
      expect(res.status).toBe(403)
      expect(await json(res)).toEqual({ ok: false, error: 'captcha' })
      expect(deps.saveQuote).not.toHaveBeenCalled()
    }
  })

  it('does not save when the security check service is down', async () => {
    const { deps } = makeDeps({ verifyTurnstile: vi.fn(async () => Promise.reject(new Error('timeout'))) })
    const res = await handle(post(valid), deps)
    expect(res.status).toBe(503)
    expect(deps.saveQuote).not.toHaveBeenCalled()
  })

  it('rejects a filled-in honeypot without saving', async () => {
    const { deps } = makeDeps()
    const res = await handle(post({ ...valid, website: 'http://spam.example' }), deps)
    expect(res.status).toBe(400)
    expect(deps.saveQuote).not.toHaveBeenCalled()
    expect(deps.verifyTurnstile).not.toHaveBeenCalled()
  })

  it('returns 429 when the rate limit is reached', async () => {
    const { deps } = makeDeps({ saveQuote: vi.fn(async (): Promise<SaveResult> => ({ status: 'rate_limited' })) })
    const res = await handle(post(valid), deps)
    expect(res.status).toBe(429)
    expect(await json(res)).toEqual({ ok: false, error: 'rate_limited' })
    expect(deps.notify).not.toHaveBeenCalled()
  })

  it('answers a duplicate with the original request number and does not email again', async () => {
    const { deps } = makeDeps({
      saveQuote: vi.fn(async (): Promise<SaveResult> => ({ status: 'duplicate', id: 398, emailSent: true })),
    })
    const res = await handle(post(valid), deps)
    expect(await json(res)).toEqual({ ok: true, requestNo: '0398', notified: true, duplicate: true })
    expect(deps.notify).not.toHaveBeenCalled()
  })

  it('still confirms a saved request when the email fails, but reports notified: false', async () => {
    const { deps, logs } = makeDeps({ notify: vi.fn(async () => false) })
    const res = await handle(post(valid), deps)
    expect(await json(res)).toEqual({ ok: true, requestNo: '0412', notified: false, duplicate: false })
    expect(deps.markEmail).toHaveBeenCalledWith(412, false)
    expect(logs).toEqual(['saved request 0412; email FAILED'])
  })

  it('reports a server error, not success, when saving fails', async () => {
    const { deps } = makeDeps({ saveQuote: vi.fn(async () => Promise.reject(new Error('db down'))) })
    const res = await handle(post(valid), deps)
    expect(res.status).toBe(500)
    expect(await json(res)).toEqual({ ok: false, error: 'server' })
    expect(deps.notify).not.toHaveBeenCalled()
  })

  it('never logs what the customer typed', async () => {
    for (const overrides of [{}, { notify: vi.fn(async () => false) }]) {
      const { deps, logs } = makeDeps(overrides)
      await handle(post(valid), deps)
      const all = logs.join('\n')
      for (const secret of ['Wanjiku', '0712', '712345678', 'Kitengela', 'cement', '196.201']) {
        expect(all).not.toContain(secret)
      }
    }
  })

  it('refuses other websites, with no CORS headers', async () => {
    const { deps } = makeDeps()
    const res = await handle(post(valid, { origin: 'https://evil.example' }), deps)
    expect(res.status).toBe(403)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
    expect(deps.saveQuote).not.toHaveBeenCalled()
  })

  it('answers the CORS preflight for the website', async () => {
    const { deps } = makeDeps()
    const res = await handle(
      new Request('https://fn.example/submit-quote', { method: 'OPTIONS', headers: { Origin: ORIGIN } }),
      deps,
    )
    expect(res.status).toBe(204)
    expect(res.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS')
  })

  it('rejects other methods, malformed JSON and oversized bodies', async () => {
    const { deps } = makeDeps()
    const get = new Request('https://fn.example/submit-quote', { headers: { Origin: ORIGIN } })
    expect((await handle(get, deps)).status).toBe(405)
    expect((await handle(post(null, { raw: '{not json' }), deps)).status).toBe(400)
    expect((await handle(post(null, { raw: '[1,2]' }), deps)).status).toBe(400)
    const big = { ...valid, notes: 'x'.repeat(MAX_BODY_BYTES) }
    expect((await handle(post(big), deps)).status).toBe(413)
    expect(deps.saveQuote).not.toHaveBeenCalled()
  })
})

describe('dedupeKey', () => {
  it('ignores case and punctuation in place names', () => {
    const base = {
      name: 'A',
      phone: '+254712345678',
      email: null,
      cargoType: 'general' as const,
      description: null,
      weight: null,
      size: null,
      preferredDate: '2026-10-28',
      timeWindow: '06-09' as const,
      notes: null,
    }
    expect(dedupeKey({ ...base, pickup: 'Kitengela', dropoff: 'Westlands, Nairobi' })).toBe(
      dedupeKey({ ...base, pickup: 'kitengela ', dropoff: 'Westlands Nairobi' }),
    )
  })
})

describe('notification email', () => {
  it('is plain text, says the day is only a preference, and flags Sundays', () => {
    const { subject, text } = buildEmail(
      {
        name: 'Wanjiku <b>Kamau</b>',
        phone: '+254712345678',
        email: null,
        pickup: 'Kitengela',
        dropoff: 'Westlands',
        cargoType: 'timber',
        description: null,
        weight: null,
        size: null,
        preferredDate: '2026-11-01',
        timeWindow: '15-19',
        notes: null,
      },
      '0412',
    )
    expect(subject).toBe('Quote request No. 0412: Kitengela to Westlands')
    expect(text).toContain('Name: Wanjiku <b>Kamau</b>')
    expect(text).toContain('It is a preference only')
    expect(text).toContain('Preferred day: Sunday 1 November 2026 (Sunday: on request)')
    expect(text).toContain('Preferred time: 3 to 7 pm (Nairobi time)')
    expect(text).toContain('Cargo: Timber and hardware')
  })
})

describe('verifyTurnstile', () => {
  it('posts the secret, token and IP to Cloudflare and reads success', async () => {
    const fetchFn = vi.fn(async () => new Response(JSON.stringify({ success: true })))
    expect(await verifyTurnstile('secret', 'tok', '1.2.3.4', fetchFn as typeof fetch)).toBe(true)
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify')
    const form = init.body as FormData
    expect([form.get('secret'), form.get('response'), form.get('remoteip')]).toEqual(['secret', 'tok', '1.2.3.4'])
  })

  it('returns false for a rejected token and throws if Cloudflare is unreachable', async () => {
    const no = vi.fn(async () => new Response(JSON.stringify({ success: false })))
    expect(await verifyTurnstile('s', 't', null, no as typeof fetch)).toBe(false)
    const down = vi.fn(async () => new Response('', { status: 502 }))
    await expect(verifyTurnstile('s', 't', null, down as typeof fetch)).rejects.toThrow()
  })
})
