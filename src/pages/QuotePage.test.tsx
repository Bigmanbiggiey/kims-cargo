import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { addDays, dateRange, nairobiToday } from '../../supabase/functions/_shared/quoteRules.ts'
import { renderAt } from '../test/render'

// Stand-in for Cloudflare's widget: hands over a token straight away.
vi.mock('../components/quote/Turnstile', async () => {
  const { useEffect } = await import('react')
  return {
    Turnstile: ({ onToken }: { onToken: (t: string) => void }) => {
      useEffect(() => onToken('test-token'), [onToken])
      return null
    },
  }
})

const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => {
  vi.stubEnv('VITE_SUPABASE_URL', 'http://api.test')
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockReset()
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

function reply(status: number, body: unknown) {
  fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(body), { status }))
}

/** A Monday-to-Saturday day within the allowed range. */
function weekday(): string {
  let day = dateRange(new Date()).min
  while (new Date(`${day}T00:00:00Z`).getUTCDay() === 0) day = addDays(day, 1)
  return day
}

function sundayInRange(): string {
  let day = dateRange(new Date()).min
  while (new Date(`${day}T00:00:00Z`).getUTCDay() !== 0) day = addDays(day, 1)
  return day
}

async function fillValid(user: ReturnType<typeof userEvent.setup>, day = weekday()) {
  await user.type(await screen.findByLabelText(/Your name or business/), 'Wanjiku Kamau')
  await user.type(screen.getByLabelText(/Phone number/), '0712 345 678')
  await user.type(screen.getByLabelText(/^Pickup/), 'Kitengela')
  await user.type(screen.getByLabelText(/^Drop-off/), 'Westlands')
  await user.selectOptions(screen.getByLabelText(/Type of load/), 'timber')
  fireEvent.change(screen.getByLabelText(/Preferred day/), { target: { value: day } })
  await user.click(screen.getByRole('radio', { name: '9 am to 12' }))
}

describe('quote form', () => {
  it('picks up pickup, drop-off and day from the home page', async () => {
    const day = weekday()
    renderAt(`/en/quote?pickup=Kitengela&dropoff=Westlands%2C%20Nairobi&day=${day}`)
    expect(await screen.findByLabelText(/^Pickup/)).toHaveValue('Kitengela')
    expect(screen.getByLabelText(/^Drop-off/)).toHaveValue('Westlands, Nairobi')
    expect(screen.getByLabelText(/Preferred day/)).toHaveValue(day)
  })

  it('ignores a day from the URL that is outside the allowed range', async () => {
    renderAt(`/en/quote?day=${nairobiToday(new Date())}`)
    expect(await screen.findByLabelText(/Preferred day/)).toHaveValue('')
  })

  it('limits the calendar to tomorrow up to 90 days ahead', async () => {
    renderAt('/en/quote')
    const { min, max } = dateRange(new Date())
    const input = await screen.findByLabelText(/Preferred day/)
    expect(input).toHaveAttribute('type', 'date')
    expect(input).toHaveAttribute('min', min)
    expect(input).toHaveAttribute('max', max)
  })

  it('offers the four approved time windows', async () => {
    renderAt('/en/quote')
    const group = await screen.findByRole('group', { name: /Preferred time/ })
    expect(within(group).getAllByRole('radio').map((r) => r.closest('label')?.textContent)).toEqual([
      '6 to 9 am',
      '9 am to 12',
      '12 to 3 pm',
      '3 to 7 pm',
    ])
  })

  it('lists every missing required field and sends nothing', async () => {
    const user = userEvent.setup()
    renderAt('/en/quote')
    await user.click(await screen.findByRole('button', { name: 'Send quote request' }))
    const summary = await screen.findByRole('alert')
    expect(within(summary).getAllByRole('link').map((a) => a.textContent)).toEqual([
      'Enter your name or business name.',
      'Enter your phone number.',
      'Enter where we collect the load.',
      'Enter where the load is going.',
      'Choose the type of load.',
      'Choose a preferred day.',
      'Choose a preferred time.',
    ])
    expect(screen.getByLabelText(/Phone number/)).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText(/Phone number/)).toHaveAccessibleDescription(
      'We use this only to call or WhatsApp you about this request. Enter your phone number.',
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('explains a non-Kenyan phone number', async () => {
    const user = userEvent.setup()
    renderAt('/en/quote')
    await fillValid(user)
    await user.clear(screen.getByLabelText(/Phone number/))
    await user.type(screen.getByLabelText(/Phone number/), '12345')
    await user.click(screen.getByRole('button', { name: 'Send quote request' }))
    expect(await screen.findAllByText('Enter a Kenyan phone number, for example 0712 345 678.')).not.toHaveLength(0)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('shows the chosen day and time before sending, and flags Sundays', async () => {
    const user = userEvent.setup()
    renderAt('/en/quote')
    await fillValid(user, sundayInRange())
    expect(screen.getByText('Sundays are on request, subject to confirmation.')).toBeInTheDocument()
    expect(screen.getByText(/You are asking for/)).toHaveTextContent(/Sunday.*9 am to 12/)
  })

  it('says the day is a request, not a booking, right above the button', async () => {
    renderAt('/en/quote')
    const button = await screen.findByRole('button', { name: 'Send quote request' })
    expect(button.previousElementSibling).toHaveTextContent(
      "Your chosen day is a request, not a booking. We'll call to confirm.",
    )
  })

  it('sends the request and shows the request number only after the server saves it', async () => {
    const user = userEvent.setup()
    renderAt('/en/quote')
    await fillValid(user)
    expect(screen.queryByText(/Request No\./)).toBeNull()
    expect(screen.queryByText('Received')).toBeNull()

    reply(200, { ok: true, requestNo: '0412', notified: true, duplicate: false })
    await user.click(screen.getByRole('button', { name: 'Send quote request' }))

    const heading = await screen.findByRole('heading', { name: 'Thank you, we have your request' })
    expect(heading).toHaveFocus()
    expect(screen.getByText('Received')).toBeInTheDocument()
    expect(screen.getByText('Request No. 0412')).toBeInTheDocument()
    expect(screen.getByText("We'll call you to agree a price and the day. Nothing is booked yet.")).toBeInTheDocument()

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('http://api.test/functions/v1/submit-quote')
    const sent = JSON.parse(String(init?.body))
    expect(sent).toMatchObject({
      name: 'Wanjiku Kamau',
      phone: '0712 345 678',
      pickup: 'Kitengela',
      dropoff: 'Westlands',
      cargoType: 'timber',
      timeWindow: '09-12',
      website: '',
      turnstileToken: 'test-token',
    })

    const wa = screen.getByRole('link', { name: 'Send it on WhatsApp too' })
    const text = decodeURIComponent(wa.getAttribute('href')!.split('?text=')[1])
    expect(text).toContain('Request No. 0412')
    expect(text).toContain('Pickup: Kitengela')
    expect(text).toContain('Load: Timber and hardware')
    expect(text).not.toContain('0712') // the customer's own number stays out of the message
  })

  it('asks the customer to WhatsApp too when the email alert failed', async () => {
    const user = userEvent.setup()
    renderAt('/en/quote')
    await fillValid(user)
    reply(200, { ok: true, requestNo: '0413', notified: false, duplicate: false })
    await user.click(screen.getByRole('button', { name: 'Send quote request' }))
    expect(await screen.findByText(/our email alert didn't go through/)).toBeInTheDocument()
  })

  it.each([
    ['network', () => fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch')), "We couldn't reach our server."],
    ['server error', () => reply(500, { ok: false, error: 'server' }), 'Something went wrong on our side.'],
    ['security check', () => reply(403, { ok: false, error: 'captcha' }), 'The security check did not pass.'],
    ['rate limit', () => reply(429, { ok: false, error: 'rate_limited' }), 'Too many requests'],
    ['non-JSON reply', () => fetchMock.mockResolvedValueOnce(new Response('<html>', { status: 502 })), 'Something went wrong'],
  ])('never claims success after a %s failure', async (_name, arrange, message) => {
    const user = userEvent.setup()
    renderAt('/en/quote')
    await fillValid(user)
    arrange()
    await user.click(screen.getByRole('button', { name: 'Send quote request' }))
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Your request was not sent')
    expect(alert).toHaveTextContent(message)
    expect(screen.queryByText('Received')).toBeNull()
    expect(screen.queryByText(/Request No\./)).toBeNull()
    expect(within(alert).getByRole('link', { name: 'Send these details on WhatsApp' })).toBeInTheDocument()
    // What they typed is kept so they can try again.
    expect(screen.getByLabelText(/^Pickup/)).toHaveValue('Kitengela')
  })

  it("shows the server's field errors", async () => {
    const user = userEvent.setup()
    renderAt('/en/quote')
    await fillValid(user)
    reply(400, { ok: false, error: 'invalid', fields: { preferredDate: 'tooEarly' } })
    await user.click(screen.getByRole('button', { name: 'Send quote request' }))
    const summary = await screen.findByRole('alert')
    expect(summary).toHaveTextContent('Choose a day from tomorrow onwards.')
    expect(screen.getByLabelText(/Preferred day/)).toHaveAttribute('aria-invalid', 'true')
  })

  it('blocks a second click while sending', async () => {
    const user = userEvent.setup()
    renderAt('/en/quote')
    await fillValid(user)
    let release: (r: Response) => void = () => {}
    fetchMock.mockReturnValueOnce(new Promise<Response>((r) => (release = r)))
    await user.click(screen.getByRole('button', { name: 'Send quote request' }))
    const busy = screen.getByRole('button', { name: 'Sending…' })
    expect(busy).toBeDisabled()
    await user.click(busy)
    release(new Response(JSON.stringify({ ok: true, requestNo: '0414', notified: true, duplicate: false })))
    await screen.findByText('Request No. 0414')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('clips the tilted carbon copies so phones never scroll sideways', async () => {
    renderAt('/en/quote')
    const form = await screen.findByRole('form', { name: 'Quote request' })
    expect(form.closest('.overflow-x-clip')).not.toBeNull()
  })

  it('has a hidden honeypot field that people never see', async () => {
    renderAt('/en/quote')
    await screen.findByRole('heading', { level: 1 })
    const trap = document.querySelector<HTMLInputElement>('input[name="website"]')
    expect(trap).not.toBeNull()
    expect(trap!.tabIndex).toBe(-1)
    expect(trap!.closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('starts a fresh form after a successful request', async () => {
    const user = userEvent.setup()
    renderAt('/en/quote')
    await fillValid(user)
    reply(200, { ok: true, requestNo: '0415', notified: true, duplicate: false })
    await user.click(screen.getByRole('button', { name: 'Send quote request' }))
    await user.click(await screen.findByRole('button', { name: 'Send another request' }))
    await waitFor(() => expect(screen.getByLabelText(/^Pickup/)).toHaveValue(''))
  })
})
