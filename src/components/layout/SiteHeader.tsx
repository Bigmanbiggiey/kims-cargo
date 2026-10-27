import { type MouseEvent, useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { localePath, useLocale, useT } from '../../i18n/locale'
import { Logo } from '../brand/Logo'

const pages = [
  ['/services', 'nav.services'],
  ['/fleet', 'nav.fleet'],
  ['/routes', 'nav.routes'],
  ['/about', 'nav.about'],
  ['/contact', 'nav.contact'],
] as const

export function SiteHeader() {
  const t = useT()
  const locale = useLocale()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const closeOnLink = (e: MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest('a')) setOpen(false)
  }

  const other = locale === 'en' ? 'sw' : 'en'
  const otherPath = pathname.replace(/^\/(en|sw)(?=\/|$)/, `/${other}`)

  return (
    <header className="glass-bar fixed inset-x-0 top-0 z-40 text-cab">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-6 px-4 min-[900px]:h-[72px] min-[900px]:px-12">
        <Link to={localePath(locale, '/')} className="focus-dark flex items-center gap-3 no-underline">
          <Logo kind="mark" tone="light" decorative className="h-7 w-auto min-[900px]:h-[34px]" />
          <span className="font-display text-lg font-bold min-[900px]:text-[21px]">{t('common.brand')}</span>
        </Link>

        <button
          ref={toggleRef}
          type="button"
          aria-expanded={open}
          aria-controls="main-menu"
          onClick={() => setOpen((o) => !o)}
          className="focus-dark flex size-12 items-center justify-center rounded border border-white/35 min-[900px]:hidden"
        >
          <span className="sr-only">{open ? t('nav.closeMenu') : t('nav.openMenu')}</span>
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d={open ? 'M5 5l14 14M19 5L5 19' : 'M3 6h18M3 12h18M3 18h18'}
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <nav
          id="main-menu"
          aria-label={t('nav.label')}
          onClick={closeOnLink}
          className={`${open ? 'flex' : 'hidden'} absolute inset-x-0 top-full flex-col gap-1 bg-tarmac px-4 pb-6 pt-2 min-[900px]:static min-[900px]:flex min-[900px]:flex-row min-[900px]:items-center min-[900px]:gap-7 min-[900px]:bg-transparent min-[900px]:p-0`}
        >
          {pages.map(([path, key]) => (
            <NavLink
              key={path}
              to={localePath(locale, path)}
              className={({ isActive }) =>
                `focus-dark border-b-[3px] py-3 font-semibold no-underline min-[900px]:py-2 ${isActive ? 'border-plate' : 'border-transparent'}`
              }
            >
              {t(key)}
            </NavLink>
          ))}
          <Link
            to={otherPath}
            lang={other}
            className="focus-dark py-3 font-semibold text-muted-dark no-underline min-[900px]:py-2"
          >
            {other === 'sw' ? t('nav.swahili') : t('nav.english')}
          </Link>
          <Link
            to={localePath(locale, '/quote')}
            className="focus-dark mt-2 inline-flex min-h-[46px] items-center justify-center rounded bg-plate px-5 font-extrabold text-tarmac no-underline min-[900px]:mt-0"
          >
            {t('common.requestQuote')}
          </Link>
        </nav>
      </div>
    </header>
  )
}
