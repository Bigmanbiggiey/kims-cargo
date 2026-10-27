import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderAt } from '../test/render'

describe('home page', () => {
  it('explains the quote process in three ordered steps', async () => {
    renderAt('/en')
    const steps = await screen.findByRole('list', { name: 'How a quote works' })
    expect(within(steps).getAllByRole('listitem')).toHaveLength(3)
  })

  it('continues from the start-a-quote sheet to the quote page', async () => {
    const user = userEvent.setup()
    renderAt('/en')
    await user.type(await screen.findByLabelText('Pickup'), 'Kitengela')
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Request a quote' })).toBeVisible()
  })

  it('never shows a request number before anything is submitted', async () => {
    renderAt('/en')
    await screen.findByRole('heading', { level: 1 })
    expect(screen.queryByText(/No\.\s*\d+/)).not.toBeInTheDocument()
  })

  it('puts the WhatsApp default number on the main WhatsApp button', async () => {
    renderAt('/en')
    const main = await screen.findByRole('main')
    expect(within(main).getAllByRole('link', { name: /WhatsApp/ })[0]).toHaveAttribute(
      'href',
      'https://wa.me/254745822788',
    )
  })

  it('shows the full logo in the hero', async () => {
    renderAt('/en')
    const main = await screen.findByRole('main')
    expect(within(main).getByRole('img', { name: "Kim's & Cargo's Logistics" })).toHaveAttribute(
      'src',
      '/brand/logo-light.png',
    )
  })
})
