import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderAt } from '../test/render'

describe('quote placeholder page', () => {
  it('builds a pre-filled WhatsApp message from what was typed on the home page', async () => {
    renderAt('/en/quote?pickup=Kitengela&dropoff=Westlands%2C%20Nairobi')
    const link = await screen.findByRole('link', { name: 'Send these details on WhatsApp' })
    expect(link.getAttribute('href')).toBe(
      'https://wa.me/254745822788?text=' +
        encodeURIComponent("Hello Kim's & Cargo's, I'd like a quote.\nPickup: Kitengela\nDrop-off: Westlands, Nairobi"),
    )
  })

  it('offers no pre-filled message when nothing was typed', async () => {
    renderAt('/en/quote')
    await screen.findByRole('heading', { level: 1, name: 'Request a quote' })
    expect(screen.queryByRole('link', { name: 'Send these details on WhatsApp' })).toBeNull()
  })

  it('still gives both numbers to call', async () => {
    renderAt('/en/quote')
    const main = await screen.findByRole('main')
    expect(within(main).getByRole('link', { name: '0783 330 889' })).toHaveAttribute('href', 'tel:+254783330889')
  })
})
