/* oxlint-disable react/only-export-components -- the page-title hook belongs with the layout */
import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router'
import { useT } from '../../i18n/locale'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

/** Sets the browser tab title for the current page. */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | Kims Cargo & Logistics`
  }, [title])
}

export function Layout() {
  const t = useT()
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const firstRender = useRef(true)

  // On navigation (not first load): start the new page at the top and move focus to its content,
  // so keyboard and screen-reader users land on the new page instead of a hidden menu link.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    window.scrollTo(0, 0)
    mainRef.current?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#main"
        className="focus-dark sr-only z-50 bg-plate px-4 py-3 font-bold text-tarmac focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {t('nav.skip')}
      </a>
      <SiteHeader />
      <main ref={mainRef} id="main" tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
