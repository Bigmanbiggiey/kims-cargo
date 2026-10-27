import { useSearchParams } from 'react-router'
import { usePageTitle } from '../components/layout/Layout'
import { PageHead } from '../components/layout/PageHead'
import { ButtonLink } from '../components/ui/Button'
import { GlassSheet } from '../components/ui/GlassSheet'
import { site } from '../content/site'
import { type MessageKey, useT } from '../i18n/locale'
import { telHref, waHref } from '../lib/links'

const fields: [param: string, label: MessageKey][] = [
  ['pickup', 'quote.waPickup'],
  ['dropoff', 'quote.waDropoff'],
  ['day', 'quote.waDay'],
]

// Phase 2 placeholder. Phase 3 replaces it with the real form, calendar and server submission.
export function QuotePage() {
  const t = useT()
  usePageTitle(t('quote.title'))
  const [params] = useSearchParams()

  const lines = fields
    .map(([param, label]) => [t(label), params.get(param)?.trim()] as const)
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`)
  const message = lines.length ? [t('quote.waGreeting'), ...lines].join('\n') : null
  const whatsappDefault = site.phones[0].display

  return (
    <>
      <PageHead title={t('quote.title')} intro={t('quote.intro')} />

      <div className="mx-auto max-w-[1280px] px-4 py-14 min-[900px]:px-12 min-[900px]:py-16">
        <GlassSheet className="max-w-[720px]">
          <div className="flex flex-col gap-5">
            <h2 className="font-display text-[28px] font-bold">{t('quote.soonTitle')}</h2>
            <p className="text-[17px] leading-relaxed">{t('quote.soonText')}</p>
            <div className="flex flex-col gap-1">
              {site.phones.map((p) => (
                <a
                  key={p.display}
                  href={telHref(p.display)}
                  className="focus-light font-display text-[30px] font-bold text-ink no-underline"
                >
                  {p.display}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {message ? (
                <ButtonLink href={waHref(whatsappDefault, message)} variant="primary" surface="light">
                  {t('quote.sendDetails')}
                </ButtonLink>
              ) : (
                <ButtonLink href={waHref(whatsappDefault)} variant="primary" surface="light">
                  {t('common.whatsappUs')}
                </ButtonLink>
              )}
            </div>
            <p className="text-[15px] leading-normal text-muted">{t('common.preference')}</p>
          </div>
        </GlassSheet>
      </div>
    </>
  )
}
