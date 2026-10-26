import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RoadScene } from './components/brand/RoadScene'
import { renderAt } from './test/render'

afterEach(() => vi.restoreAllMocks())

describe('final review fixes', () => {
  it('hides the yellow/red road shapes below 900 px so headlines never sit on them', () => {
    for (const variant of ['hero', 'band'] as const) {
      const { container, unmount } = render(<RoadScene variant={variant} />)
      const decor = container.querySelectorAll('[data-decor]')
      expect(decor.length).toBeGreaterThan(0)
      decor.forEach((el) => expect(el.getAttribute('class')).toContain('max-[899px]:hidden'))
      unmount()
    }
  })

  it('scrolls to the top and moves focus to the main content after navigating', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const user = userEvent.setup()
    renderAt('/en')
    await user.click(await screen.findByRole('button', { name: 'Open menu' }))
    await user.click(within(screen.getByRole('navigation', { name: 'Main' })).getByRole('link', { name: 'Fleet' }))
    await screen.findByRole('heading', { level: 1, name: 'Fleet' })
    expect(scrollTo).toHaveBeenCalledWith(0, 0)
    expect(screen.getByRole('main')).toHaveFocus()
  })

  it('does not steal focus on the first page load', async () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    renderAt('/en/fleet')
    await screen.findByRole('heading', { level: 1, name: 'Fleet' })
    expect(screen.getByRole('main')).not.toHaveFocus()
  })

  it('keeps the page language English while Swahili translations are missing', async () => {
    renderAt('/sw/fleet')
    await screen.findByRole('heading', { level: 1, name: 'Fleet' })
    expect(document.documentElement.lang).toBe('en')
  })

  it('keeps the menu bar on screen while scrolling (spec §7 sticky bar)', async () => {
    renderAt('/en')
    expect((await screen.findByRole('banner')).className).toContain('fixed')
  })

  it('does not promise request numbers before the quote form exists', async () => {
    renderAt('/en/about')
    await screen.findByRole('heading', { level: 1, name: 'About us' })
    expect(screen.queryByText(/request number/i)).toBeNull()
  })

  it('gives footer links a 44 px touch target', async () => {
    renderAt('/en')
    const footerNav = await screen.findByRole('navigation', { name: 'Footer' })
    within(footerNav).getAllByRole('link').forEach((a) => expect(a.className).toContain('min-h-11'))
  })
})
