import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { contrastRatio } from './lib/contrast'

// index.css is the single source of the Waybill colour tokens (spec §5).
// Read from disk: Vitest stubs CSS imports (including ?raw) to empty strings.
const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8')
const tok: Record<string, string> = Object.fromEntries(
  [...css.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})/g)].map((m) => [m[1], m[2].toUpperCase()]),
)

describe('Waybill colour tokens', () => {
  it('pins the spec values for the signature colours', () => {
    expect(tok.plate).toBe('#F6C400')
    expect(tok.tarmac).toBe('#26292B')
    expect(tok.chevron).toBe('#C8102E')
    expect(tok.carbon).toBe('#2B3990')
  })

  const pairs: [fg: string, bg: string][] = [
    ['tarmac', 'plate'],
    ['cab', 'tarmac'],
    ['ink', 'cab'],
    ['muted', 'cab'],
    ['carbon', 'cab'],
    ['chevron', 'cab'],
    ['muted-dark', 'tarmac'],
    ['muted-dark-2', 'road'],
  ]

  it.each(pairs)('%s text on %s meets WCAG AA (4.5:1)', (fg, bg) => {
    expect(tok[fg], `missing token ${fg}`).toBeDefined()
    expect(tok[bg], `missing token ${bg}`).toBeDefined()
    expect(contrastRatio(tok[fg], tok[bg])).toBeGreaterThanOrEqual(4.5)
  })
})
