import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderAt } from '../../test/render'

describe('mobile menu', () => {
  it('opens and reports its state', async () => {
    const user = userEvent.setup()
    renderAt('/en')
    await user.click(await screen.findByRole('button', { name: 'Open menu' }))
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes on Escape and returns focus to the toggle', async () => {
    const user = userEvent.setup()
    renderAt('/en')
    await user.click(await screen.findByRole('button', { name: 'Open menu' }))
    await user.keyboard('{Escape}')
    const toggle = screen.getByRole('button', { name: 'Open menu' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveFocus()
  })

  it('closes after choosing a page', async () => {
    const user = userEvent.setup()
    renderAt('/en')
    await user.click(await screen.findByRole('button', { name: 'Open menu' }))
    await user.click(within(screen.getByRole('navigation', { name: 'Main' })).getByRole('link', { name: 'Routes' }))
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false')
    expect(await screen.findByRole('heading', { level: 1, name: 'Service areas and routes' })).toBeVisible()
  })
})
