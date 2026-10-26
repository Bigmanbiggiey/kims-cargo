import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderAt } from '../test/render'

describe('fleet page', () => {
  it('shows both lorries', async () => {
    renderAt('/en/fleet')
    expect(await screen.findByRole('article', { name: 'Isuzu FRR 33' })).toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'Mitsubishi Fuso FH' })).toBeInTheDocument()
  })

  it('shows unconfirmed payload as pending, never a guessed figure', async () => {
    renderAt('/en/fleet')
    const isuzu = await screen.findByRole('article', { name: 'Isuzu FRR 33' })
    expect(within(isuzu).getByText('Payload').nextElementSibling).toHaveTextContent('[to be confirmed]')
    expect(within(isuzu).queryByText(/\d+\s*(t|tons?|tonnes?|kg)\b/i)).toBeNull()
  })

  it('shows the confirmed body type', async () => {
    renderAt('/en/fleet')
    const fuso = await screen.findByRole('article', { name: 'Mitsubishi Fuso FH' })
    expect(within(fuso).getByText('Body').nextElementSibling).toHaveTextContent('Enclosed box')
  })
})
