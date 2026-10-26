// End-to-end check of the submit-quote Edge Function against the LOCAL Supabase stack.
// Prereqs: Docker running, `npm run supabase -- start`, `npx supabase migration up --local`,
// supabase/functions/.env pointing SMTP at the local test inbox, then
// `npx supabase functions serve --env-file supabase/functions/.env`.
// The rate-limit check expects no requests from this machine in the last hour; clear local test rows first:
//   docker exec supabase_db_kims-cargo psql -U postgres -c "delete from public.quote_requests where name = 'Test Customer'"
// Usage: npm run e2e:quote. Prints statuses only, never personal data.
const URL_ = 'http://127.0.0.1:54321/functions/v1/submit-quote'
const ORIGIN = 'http://localhost:5173'
const run = Date.now() % 100000
const ip = `10.9.${Math.floor(run / 256) % 256}.${run % 256}`

function day(offset) {
  const d = new Date(Date.now() + 3 * 3600e3 + offset * 864e5)
  return d.toISOString().slice(0, 10)
}

const base = () => ({
  name: 'Test Customer',
  phone: '0712 345 678',
  email: '',
  pickup: `Kitengela ${run}`,
  dropoff: 'Westlands',
  cargoType: 'construction',
  description: 'E2E test <script>alert(1)</script>',
  weight: '2 tonnes',
  size: '',
  preferredDate: day(2),
  timeWindow: '09-12',
  notes: '',
  website: '',
  turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX',
})

async function post(body, { origin = ORIGIN, fwd = ip } = {}) {
  const res = await fetch(URL_, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin, 'X-Forwarded-For': fwd },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
  let json = null
  try { json = await res.json() } catch {}
  return { status: res.status, json }
}

const results = []
const check = (name, cond, detail) => { results.push([cond ? 'PASS' : 'FAIL', name, JSON.stringify(detail)]) }

const first = await post(base())
check('valid request saved', first.status === 200 && /^\d{4,}$/.test(first.json?.requestNo ?? ''), first)
check('email sent to test inbox', first.json?.notified === true, first.json)

const dup = await post(base())
check('duplicate returns same number, not saved twice', dup.status === 200 && dup.json?.duplicate === true && dup.json?.requestNo === first.json?.requestNo, dup)

const past = await post({ ...base(), preferredDate: day(0), pickup: `Past ${run}` })
check('today/past date rejected by server', past.status === 400 && past.json?.fields?.preferredDate === 'tooEarly', past)

const bad = await post({ ...base(), phone: '999', cargoType: 'rockets', pickup: `Bad ${run}` })
check('invalid fields rejected by server', bad.status === 400 && bad.json?.fields?.phone === 'invalid' && bad.json?.fields?.cargoType === 'invalid', bad)

const trap = await post({ ...base(), website: 'http://spam', pickup: `Trap ${run}` })
check('honeypot rejected', trap.status === 400, trap)

const noToken = await post({ ...base(), turnstileToken: '', pickup: `NoTok ${run}` })
check('missing Turnstile token rejected', noToken.status === 403 && noToken.json?.error === 'captcha', noToken)

const evil = await post({ ...base(), pickup: `Evil ${run}` }, { origin: 'https://evil.example' })
check('other origin refused', evil.status === 403, evil)

const malformed = await post('{oops')
check('malformed JSON rejected', malformed.status === 400, malformed)

const huge = await post({ ...base(), notes: 'x'.repeat(20000) })
check('oversized body rejected', huge.status === 413, huge)

// Rate limit: 5 saves per IP per hour. One saved already, so 4 more succeed and the 6th is refused.
const statuses = []
for (let i = 0; i < 5; i++) statuses.push((await post({ ...base(), pickup: `Rate ${run} ${i}` })).status)
check('6th request in an hour from one IP is rate limited', JSON.stringify(statuses) === '[200,200,200,200,429]', statuses)

const otherIp = await post({ ...base(), pickup: `OtherIp ${run}` }, { fwd: `10.8.${run % 256}.1` })
check('a spoofed X-Forwarded-For does not get round the limit', otherIp.status === 429, otherIp.status)

console.log(JSON.stringify({ firstRequestNo: first.json?.requestNo, run }))
for (const r of results) console.log(r.join('  '))
process.exitCode = results.some((r) => r[0] === 'FAIL') ? 1 : 0
