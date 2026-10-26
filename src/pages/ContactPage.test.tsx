import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderAt } from '../test/render'

describe('contact page', () => {
  it('links both numbers for calling', async () => {
    renderAt('/en/contact')
    const main = await screen.findByRole('main')
    expect(within(main).getByRole('link', { name: '0745 822 788' })).toHaveAttribute('href', 'tel:+254745822788')
    expect(within(main).getByRole('link', { name: '0783 330 889' })).toHaveAttribute('href', 'tel:+254783330889')
  })

  it('offers WhatsApp on both numbers', async () => {
    renderAt('/en/contact')
    const main = await screen.findByRole('main')
    expect(within(main).getByRole('link', { name: 'WhatsApp 0783 330 889' })).toHaveAttribute(
      'href',
      'https://wa.me/254783330889',
    )
  })

  it('links the email address', async () => {
    renderAt('/en/contact')
    const main = await screen.findByRole('main')
    expect(within(main).getByRole('link', { name: 'kimsandcargos1@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:kimsandcargos1@gmail.com',
    )
  })

  it('hides the maps link while the yard address is unknown', async () => {
    renderAt('/en/contact')
    await screen.findByRole('main')
    expect(screen.queryByRole('link', { name: 'Open in Google Maps' })).toBeNull()
  })
})
