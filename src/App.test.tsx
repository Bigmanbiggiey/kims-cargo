import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderAt } from './test/render'

describe('routing', () => {
  it('sends the bare root to the English home page', async () => {
    renderAt('/')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Loaded from 6 am, Monday to Saturday' }),
    ).toBeVisible()
  })

  it('redirects an unknown language prefix to English, keeping the page', async () => {
    renderAt('/fr/fleet')
    expect(await screen.findByRole('heading', { level: 1, name: 'Fleet' })).toBeVisible()
  })

  it('redirects a path with no language prefix to English', async () => {
    renderAt('/fleet')
    expect(await screen.findByRole('heading', { level: 1, name: 'Fleet' })).toBeVisible()
  })

  it('shows a not-found page for unknown pages', async () => {
    renderAt('/en/nope')
    expect(await screen.findByRole('heading', { level: 1, name: "We can't find that page" })).toBeVisible()
  })

  it('sets the document language to the language of the text shown', async () => {
    document.documentElement.lang = ''
    renderAt('/en/fleet')
    await screen.findByRole('heading', { level: 1, name: 'Fleet' })
    expect(document.documentElement.lang).toBe('en')
  })

  it('sets a page title', async () => {
    renderAt('/en/fleet')
    await screen.findByRole('heading', { level: 1, name: 'Fleet' })
    expect(document.title).toBe('Fleet | Kims Cargo & Logistics')
  })

  it('marks the current page in the main menu', async () => {
    renderAt('/en/fleet')
    const nav = await screen.findByRole('navigation', { name: 'Main' })
    expect(within(nav).getByRole('link', { name: 'Fleet' })).toHaveAttribute('aria-current', 'page')
  })

  it('offers a skip link to the main content', async () => {
    renderAt('/en')
    expect(await screen.findByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main')
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main')
  })

  it('links the language switch to the same page in Swahili', async () => {
    renderAt('/en/routes')
    expect(await screen.findByRole('link', { name: 'Kiswahili' })).toHaveAttribute('href', '/sw/routes')
  })
})
