import { Link } from 'react-router'
import { site } from '../../content/site'
import { localePath, useLocale, useT } from '../../i18n/locale'
import { telHref } from '../../lib/links'
import { ChevronBand } from '../brand/ChevronBand'
import { Logo } from '../brand/Logo'

const YEAR = new Date().getFullYear()

export function SiteFooter() {
  const t = useT()
  const locale = useLocale()
  const linkClass = 'focus-dark text-muted-dark-2 no-underline hover:text-cab'

  return (
    <footer className="bg-tarmac text-cab">
      <ChevronBand />
      <div className="mx-auto flex max-w-[1280px] flex-col gap-10 px-4 py-10 min-[900px]:flex-row min-[900px]:gap-16 min-[900px]:px-12">
        <Logo kind="full" tone="light" className="h-24 w-auto self-start min-[900px]:h-28" />
        <div className="grid flex-1 gap-8 text-base leading-relaxed sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <h2 className="font-display text-[19px] font-semibold">{t('footer.callOrWhatsapp')}</h2>
            {site.phones.map((p) => (
              <a key={p.display} href={telHref(p.display)} className="focus-dark text-lg font-bold text-cab no-underline">
                {p.display}
              </a>
            ))}
            <a href={`mailto:${site.email}`} className={linkClass}>
              {site.email}
            </a>
          </div>
          <div className="flex flex-col gap-1.5 text-muted-dark-2">
            <h2 className="font-display text-[19px] font-semibold text-cab">{t('footer.hoursTitle')}</h2>
            <span>{t('footer.hoursDays')}</span>
            <span>{t('footer.hoursTime')}</span>
            <span>{t('footer.hoursSunday')}</span>
          </div>
          <nav aria-label={t('footer.label')} className="flex flex-col gap-1.5">
            <h2 className="font-display text-[19px] font-semibold">{t('footer.pages')}</h2>
            <Link to={localePath(locale, '/services')} className={linkClass}>{t('nav.services')}</Link>
            <Link to={localePath(locale, '/fleet')} className={linkClass}>{t('nav.fleet')}</Link>
            <Link to={localePath(locale, '/routes')} className={linkClass}>{t('nav.routes')}</Link>
            <Link to={localePath(locale, '/quote')} className={linkClass}>{t('common.requestQuote')}</Link>
          </nav>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 border-t border-white/15 px-4 py-4 text-sm text-muted-dark min-[900px]:mx-12 min-[900px]:px-0">
        <span>
          © {YEAR} {t('footer.copyright')}
        </span>
        <a href="#privacy" className="focus-dark text-muted-dark">
          {t('footer.privacy')}
        </a>
      </div>
    </footer>
  )
}
