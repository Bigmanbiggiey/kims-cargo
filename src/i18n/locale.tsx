/* oxlint-disable react/only-export-components -- provider and hooks belong together */
import { createContext, type ReactNode, useCallback, useContext } from 'react'
import { en } from './en'
import { sw } from './sw'
import type { MessageKey } from './types'

export type { MessageKey } from './types'
export type Locale = 'en' | 'sw'
export const locales: readonly Locale[] = ['en', 'sw']

export function isLocale(x: string): x is Locale {
  return (locales as readonly string[]).includes(x)
}

export function localePath(locale: Locale, path: string): string {
  return path === '/' || path === '' ? `/${locale}` : `/${locale}${path.startsWith('/') ? path : `/${path}`}`
}

const dictionaries: Record<Locale, unknown> = { en, sw }

/** The language the page text is actually in: Swahili only once translations exist (WCAG 3.1.1). */
export function contentLang(locale: Locale): Locale {
  return locale === 'sw' && Object.keys(sw).length === 0 ? 'en' : locale
}
const warned = new Set<string>()

function lookup(dict: unknown, key: string): string | undefined {
  let node = dict
  for (const part of key.split('.')) {
    if (node === null || typeof node !== 'object') return undefined
    node = (node as Record<string, unknown>)[part]
  }
  return typeof node === 'string' && node !== '' ? node : undefined
}

const LocaleContext = createContext<Locale>('en')

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
}

export function useLocale(): Locale {
  return useContext(LocaleContext)
}

export function useT(): (key: MessageKey) => string {
  const locale = useLocale()
  return useCallback(
    (key: MessageKey) => {
      const own = lookup(dictionaries[locale], key)
      if (own !== undefined) return own
      if (import.meta.env.DEV && locale !== 'en' && !warned.has(`${locale}:${key}`)) {
        warned.add(`${locale}:${key}`)
        console.warn(`[i18n] missing ${locale} text for "${key}", using English`)
      }
      return lookup(dictionaries.en, key) ?? key
    },
    [locale],
  )
}
