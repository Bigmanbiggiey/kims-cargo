import { usePageTitle } from '../components/layout/Layout'
import { PageHead } from '../components/layout/PageHead'
import { ButtonLink } from '../components/ui/Button'
import { Pending } from '../components/ui/Pending'
import { site } from '../content/site'
import { useT } from '../i18n/locale'
import { mapsHref, telHref, waHref } from '../lib/links'

export function ContactPage() {
  const t = useT()
  usePageTitle(t('contact.title'))
  const maps = mapsHref(site.pending.yardAddress)

  return (
    <>
      <PageHead title={t('contact.title')} intro={t('contact.intro')} />

      <div className="mx-auto grid max-w-[1280px] gap-12 px-4 py-14 min-[900px]:grid-cols-3 min-[900px]:px-12 min-[900px]:py-16">
        <section className="flex flex-col gap-3.5 border-t-[3px] border-tarmac pt-5">
          <h2 className="font-display text-[28px] font-bold">{t('contact.callTitle')}</h2>
          {site.phones.map((p) => (
            <a
              key={p.display}
              href={telHref(p.display)}
              className="focus-light font-display text-[32px] font-bold text-ink no-underline min-[900px]:text-[34px]"
            >
              {p.display}
            </a>
          ))}
          <p className="text-base leading-relaxed text-muted">{t('common.hoursLine')}</p>
        </section>

        <section className="flex flex-col gap-3.5 border-t-[3px] border-tarmac pt-5">
          <h2 className="font-display text-[28px] font-bold">{t('contact.whatsappTitle')}</h2>
          {site.phones.map((p, i) => (
            <ButtonLink key={p.display} href={waHref(p.display)} variant={i === 0 ? 'primary' : 'outline'} surface="light">
              {t('common.whatsapp')} {p.display}
            </ButtonLink>
          ))}
          <p className="text-base leading-relaxed text-muted">{t('contact.whatsappTip')}</p>
        </section>

        <section className="flex flex-col gap-3.5 border-t-[3px] border-tarmac pt-5">
          <h2 className="font-display text-[28px] font-bold">{t('contact.emailTitle')}</h2>
          <a href={`mailto:${site.email}`} className="focus-light text-xl font-bold text-carbon">
            {site.email}
          </a>
          <p className="mt-1.5 rounded border-[1.5px] border-dashed border-[#8E959A] px-4 py-3.5 text-base text-muted">
            {t('contact.yardLabel')}: {site.pending.yardAddress ?? <Pending kind="supply" />}
          </p>
          {maps && (
            <a href={maps} target="_blank" rel="noopener noreferrer" className="focus-light font-bold text-carbon">
              {t('contact.openMaps')}
            </a>
          )}
        </section>
      </div>
    </>
  )
}
