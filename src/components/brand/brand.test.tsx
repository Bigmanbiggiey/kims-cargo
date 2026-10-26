import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { ButtonLink } from '../ui/Button'
import { GlassSheet } from '../ui/GlassSheet'
import { Pending } from '../ui/Pending'
import { ChevronBand } from './ChevronBand'
import { Logo } from './Logo'
import { RoadScene } from './RoadScene'

describe('Logo', () => {
  it('renders the full light logo with its name as alt text', () => {
    render(<Logo kind="full" tone="light" />)
    expect(screen.getByRole('img', { name: 'Kims Cargo & Logistics' })).toHaveAttribute('src', '/brand/logo-light.png')
  })

  it('renders a decorative mark with empty alt text', () => {
    const { container } = render(<Logo kind="mark" tone="dark" decorative />)
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', '/brand/mark-dark.png')
    expect(img).toHaveAttribute('alt', '')
  })
})

describe('Pending', () => {
  it('marks unconfirmed facts visibly', () => {
    render(<Pending kind="confirm" />)
    expect(screen.getByText('[to be confirmed]')).toHaveAttribute('data-pending')
  })

  it('marks facts the client must supply', () => {
    render(<Pending kind="supply" />)
    expect(screen.getByText('[to be supplied]')).toHaveAttribute('data-pending')
  })
})

describe('ButtonLink', () => {
  it('uses a router link for internal paths', () => {
    render(
      <MemoryRouter>
        <ButtonLink to="/en/quote" variant="primary">
          Request a quote
        </ButtonLink>
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Request a quote' })).toHaveAttribute('href', '/en/quote')
  })

  it('opens external WhatsApp links safely in a new tab', () => {
    render(
      <ButtonLink href="https://wa.me/254745822788" variant="glass">
        WhatsApp
      </ButtonLink>,
    )
    const link = screen.getByRole('link', { name: 'WhatsApp' })
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('keeps tel: links in the same tab', () => {
    render(
      <ButtonLink href="tel:+254745822788" variant="outline">
        Call
      </ButtonLink>,
    )
    expect(screen.getByRole('link', { name: 'Call' })).not.toHaveAttribute('target')
  })
})

describe('decorative brand elements', () => {
  it('hides the chevron band from assistive technology', () => {
    const { container } = render(<ChevronBand />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('hides the road scene from assistive technology', () => {
    const { container } = render(<RoadScene variant="band" />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('draws carbon copies behind a glass sheet only when asked', () => {
    const { container, rerender } = render(<GlassSheet copies>content</GlassSheet>)
    expect(container.querySelectorAll('[data-copy]')).toHaveLength(2)
    rerender(<GlassSheet>content</GlassSheet>)
    expect(container.querySelectorAll('[data-copy]')).toHaveLength(0)
  })
})
