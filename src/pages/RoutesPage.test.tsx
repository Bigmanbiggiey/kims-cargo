import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderAt } from '../test/render'

describe('routes page', () => {
  it('lists the stops of each long-distance route in order', async () => {
    renderAt('/en/routes')
    const route = await screen.findByRole('list', { name: 'Nairobi to Eldoret' })
    expect(within(route).getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'Nairobi',
      'Nakuru',
      'Eldoret',
    ])
    expect(screen.getByRole('list', { name: 'Nairobi to Mombasa' })).toBeInTheDocument()
  })

  it('lists the confirmed areas around Nairobi', async () => {
    renderAt('/en/routes')
    expect(await screen.findByText('Ongata Rongai')).toBeInTheDocument()
    expect(screen.getByText('Gatundu')).toBeInTheDocument()
  })
})
