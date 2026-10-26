import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { isLocale, LocaleProvider, localePath, type MessageKey, useLocale, useT } from './locale'

function Probe({ k }: { k: MessageKey }) {
  const t = useT()
  return (
    <p>
      {t(k)} ({useLocale()})
    </p>
  )
}

describe('useT', () => {
  it('returns English text for the English locale', () => {
    render(
      <LocaleProvider locale="en">
        <Probe k="home.headline" />
      </LocaleProvider>,
    )
    expect(screen.getByText('Loaded from 6 am, Monday to Saturday (en)')).toBeInTheDocument()
  })

  it('falls back to English when a Swahili string is missing', () => {
    render(
      <LocaleProvider locale="sw">
        <Probe k="home.headline" />
      </LocaleProvider>,
    )
    expect(screen.getByText('Loaded from 6 am, Monday to Saturday (sw)')).toBeInTheDocument()
  })

  it('returns the key itself rather than blank for an unknown key', () => {
    render(
      <LocaleProvider locale="sw">
        <Probe k={'home.nope' as MessageKey} />
      </LocaleProvider>,
    )
    expect(screen.getByText('home.nope (sw)')).toBeInTheDocument()
  })
})

describe('localePath', () => {
  it('prefixes paths with the locale', () => {
    expect(localePath('sw', '/fleet')).toBe('/sw/fleet')
  })

  it('maps the root to the bare locale', () => {
    expect(localePath('en', '/')).toBe('/en')
  })
})

describe('isLocale', () => {
  it('accepts en and sw only', () => {
    expect(isLocale('en')).toBe(true)
    expect(isLocale('sw')).toBe(true)
    expect(isLocale('fr')).toBe(false)
  })
})
