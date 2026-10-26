import { usePageTitle } from '../components/layout/Layout'
import { useT } from '../i18n/locale'

// Placeholder until its Phase 2 task builds the full page.
export function QuotePage() {
  const t = useT()
  usePageTitle(t('quote.title'))
  return (
    <section className="bg-road px-4 pb-16 pt-32 text-cab min-[900px]:px-12">
      <h1 className="font-display text-5xl font-bold">{t('quote.title')}</h1>
    </section>
  )
}
