import { usePageTitle } from '../components/layout/Layout'
import { PageHead } from '../components/layout/PageHead'
import { ButtonLink } from '../components/ui/Button'
import { localePath, type MessageKey, useLocale, useT } from '../i18n/locale'

const services = [1, 2, 3, 4, 5].map((n) => ({
  id: `service-${n}`,
  title: `services.s${n}Title` as MessageKey,
  text: `services.s${n}Text` as MessageKey,
  lorry: `services.s${n}Lorry` as MessageKey,
}))

export function ServicesPage() {
  const t = useT()
  const locale = useLocale()
  usePageTitle(t('services.title'))

  return (
    <>
      <PageHead title={t('services.title')} intro={t('services.intro')} />

      <div className="mx-auto max-w-[1280px] px-4 py-10 min-[900px]:px-12 min-[900px]:pb-14">
        {services.map((s, i) => (
          <article
            key={s.id}
            aria-labelledby={s.id}
            className={`grid gap-4 py-8 min-[900px]:grid-cols-[380px_minmax(0,1fr)_260px] min-[900px]:gap-12 ${i < services.length - 1 ? 'border-b border-rule' : ''}`}
          >
            <h2 id={s.id} className="font-display text-[28px] font-bold leading-tight min-[900px]:text-[30px]">
              {t(s.title)}
            </h2>
            <p className="text-[17px] leading-relaxed text-muted">{t(s.text)}</p>
            <p className="flex flex-col gap-1 text-[15px] text-muted">
              {t('common.usuallyOn')}
              <strong className="text-lg text-ink">{t(s.lorry)}</strong>
            </p>
          </article>
        ))}
      </div>

      <section className="bg-tarmac text-cab">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 py-12 min-[900px]:flex-row min-[900px]:items-center min-[900px]:justify-between min-[900px]:px-12 min-[900px]:py-16">
          <div className="flex flex-col gap-2">
            <h2 className="font-display text-[32px] font-bold min-[900px]:text-[36px]">{t('services.ctaTitle')}</h2>
            <p className="text-lg text-muted-dark-2">{t('services.ctaText')}</p>
          </div>
          <ButtonLink to={localePath(locale, '/quote')} variant="primary">
            {t('common.requestQuote')}
          </ButtonLink>
        </div>
      </section>
    </>
  )
}
