import type { ReactNode } from 'react'
import { usePageTitle } from '../components/layout/Layout'
import { PageHead } from '../components/layout/PageHead'
import { Pending } from '../components/ui/Pending'
import { site } from '../content/site'
import { type MessageKey, useT } from '../i18n/locale'

const expectations: MessageKey[] = ['about.expect1', 'about.expect3', 'about.expect4']

function Detail({ label, children, first = false }: { label: string; children: ReactNode; first?: boolean }) {
  return (
    <div className={`flex justify-between gap-6 py-3 ${first ? 'border-t-2 border-tarmac' : 'border-t border-rule'}`}>
      <dt className="text-muted">{label}</dt>
      <dd className="m-0 text-right font-bold">{children}</dd>
    </div>
  )
}

export function AboutPage() {
  const t = useT()
  usePageTitle(t('about.title'))

  return (
    <>
      <PageHead title={t('about.title')} intro={t('about.intro')} />

      <section className="mx-auto flex max-w-[1280px] flex-col gap-10 px-4 py-14 min-[900px]:flex-row min-[900px]:gap-16 min-[900px]:px-12 min-[900px]:py-16">
        <div className="flex flex-1 flex-col gap-4">
          <h2 className="font-display text-[32px] font-bold min-[900px]:text-[36px]">{t('about.whoTitle')}</h2>
          <p className="max-w-[560px] rounded border-[1.5px] border-dashed border-[#8E959A] px-5 py-4 text-[17px] leading-relaxed text-muted">
            {t('about.storyLabel')}: {site.pending.companyStory ?? <Pending kind="supply" />}
          </p>
          <p className="max-w-[560px] text-[17px] leading-relaxed text-muted">{t('about.whoFleet')}</p>
        </div>
        {/* Photo placeholder until the client supplies it. */}
        <div className="flex aspect-[520/292] w-full items-end rounded-md bg-[#E6E8EA] p-5 text-[15px] text-muted min-[900px]:w-[520px] min-[900px]:shrink-0">
          {t('about.teamPhoto')}
        </div>
      </section>

      <section className="border-t border-[#E4E6EA] bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-12 px-4 py-14 min-[900px]:flex-row min-[900px]:gap-16 min-[900px]:px-12">
          <div className="flex flex-1 flex-col gap-5">
            <h2 className="font-display text-[30px] font-bold min-[900px]:text-[32px]">{t('about.expectTitle')}</h2>
            <ul className="m-0 list-none border-b border-rule p-0 text-[17px] leading-normal">
              {expectations.map((key, i) => (
                <li key={key} className={`py-3 ${i === 0 ? 'border-t-2 border-tarmac' : 'border-t border-rule'}`}>
                  {t(key)}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-5 min-[900px]:w-[460px] min-[900px]:shrink-0">
            <h2 className="font-display text-[30px] font-bold min-[900px]:text-[32px]">{t('about.detailsTitle')}</h2>
            <dl className="m-0 border-b border-rule text-base">
              <Detail label={t('about.name')} first>
                {site.legalName}
              </Detail>
              <Detail label={t('about.kraPin')}>{site.pending.kraPin ?? <Pending kind="supply" />}</Detail>
              <Detail label={t('about.transitCover')}>{site.pending.transitCover ?? <Pending kind="confirm" />}</Detail>
              <Detail label={t('about.yard')}>{site.pending.yardAddress ?? <Pending kind="supply" />}</Detail>
            </dl>
          </div>
        </div>
      </section>
    </>
  )
}
