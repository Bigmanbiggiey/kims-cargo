import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderAt } from '../test/render'

describe('about page', () => {
  it('marks the company story and details the client must supply', async () => {
    renderAt('/en/about')
    await screen.findByRole('heading', { level: 1, name: 'About us' })
    // company story, KRA PIN, yard address
    expect(screen.getAllByText('[to be supplied]').length).toBeGreaterThanOrEqual(3)
    expect(screen.getByText('[to be confirmed]')).toBeInTheDocument() // goods in transit cover
  })

  it('states what customers can expect', async () => {
    renderAt('/en/about')
    expect(
      await screen.findByText('A price and a day agreed with you before anything is booked.'),
    ).toBeInTheDocument()
  })
})
