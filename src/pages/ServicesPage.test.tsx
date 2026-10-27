import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderAt } from '../test/render'

describe('services page', () => {
  it('lists the five services from the requirements', async () => {
    renderAt('/en/services')
    const main = await screen.findByRole('main')
    expect(within(main).getAllByRole('article')).toHaveLength(5)
  })

  it('names each service by its heading and says which lorry usually does it', async () => {
    renderAt('/en/services')
    const article = await screen.findByRole('article', { name: 'Closed-box commercial distribution' })
    expect(within(article).getByText('Mitsubishi Fuso FH box')).toBeInTheDocument()
  })

  it('ends with a route to the quote page', async () => {
    renderAt('/en/services')
    const main = await screen.findByRole('main')
    expect(within(main).getByRole('link', { name: 'Request a quote' })).toHaveAttribute('href', '/en/quote')
  })
})
