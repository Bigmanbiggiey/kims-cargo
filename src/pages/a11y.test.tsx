import { screen } from '@testing-library/react'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'
import { renderAt } from '../test/render'

const paths = ['/en', '/en/services', '/en/fleet', '/en/routes', '/en/about', '/en/contact', '/en/quote', '/sw', '/en/nope']

describe('accessibility sweep', () => {
  it.each(paths)('%s has no axe violations and exactly one h1', async (path) => {
    const { container } = renderAt(path)
    await screen.findByRole('heading', { level: 1 })
    // jsdom has no layout, so colour contrast is checked by brand.tokens.test.ts instead.
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })
})
