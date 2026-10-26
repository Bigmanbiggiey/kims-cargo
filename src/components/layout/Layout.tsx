/* oxlint-disable react/only-export-components -- the page-title hook belongs with the layout */
import { useEffect } from 'react'
import { Outlet } from 'react-router'
import { useT } from '../../i18n/locale'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

/** Sets the browser tab title for the current page. */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | Kim's & Cargo's`
  }, [title])
}

export function Layout() {
  const t = useT()
  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#main"
        className="focus-dark sr-only z-50 bg-plate px-4 py-3 font-bold text-tarmac focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {t('nav.skip')}
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
