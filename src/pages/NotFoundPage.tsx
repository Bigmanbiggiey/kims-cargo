import { Link } from 'react-router'
import { usePageTitle } from '../components/layout/Layout'
import { localePath, useLocale, useT } from '../i18n/locale'

export function NotFoundPage() {
  const t = useT()
  const locale = useLocale()
  usePageTitle(t('notFound.title'))
  return (
    <section className="bg-road px-4 pb-20 pt-32 text-cab min-[900px]:px-12">
      <h1 className="font-display text-5xl font-bold">{t('notFound.title')}</h1>
      <p className="mt-4 max-w-xl text-lg text-muted-dark-2">{t('notFound.text')}</p>
      <Link
        to={localePath(locale, '/')}
        className="focus-dark mt-8 inline-flex min-h-[52px] items-center rounded bg-plate px-6 font-extrabold text-tarmac no-underline"
      >
        {t('notFound.home')}
      </Link>
    </section>
  )
}
