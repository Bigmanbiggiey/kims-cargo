import type { ReactNode } from 'react'
import { usePageTitle } from '../components/layout/Layout'
import { PageHead } from '../components/layout/PageHead'
import { Pending } from '../components/ui/Pending'
import { type FleetItem, site } from '../content/site'
import { type MessageKey, useT } from '../i18n/locale'

const copy: Record<FleetItem['id'], { text: MessageKey; best: MessageKey; photo: MessageKey }> = {
  'isuzu-frr33': { text: 'fleet.isuzuText', best: 'fleet.isuzuBest', photo: 'fleet.isuzuPhoto' },
  'fuso-fh': { text: 'fleet.fusoText', best: 'fleet.fusoBest', photo: 'fleet.fusoPhoto' },
}

function Row({ label, children, first = false }: { label: string; children: ReactNode; first?: boolean }) {
  return (
    <div className={`flex justify-between gap-6 py-3 ${first ? 'border-t-2 border-tarmac' : 'border-t border-rule'}`}>
      <dt className="text-muted">{label}</dt>
      <dd className="m-0 text-right font-bold">{children}</dd>
    </div>
  )
}

export function FleetPage() {
  const t = useT()
  usePageTitle(t('fleet.title'))

  return (
    <>
      <PageHead title={t('fleet.title')} intro={t('fleet.intro')} />

      <div className="mx-auto flex max-w-[1280px] flex-col gap-14 px-4 py-14 min-[900px]:px-12">
        {site.fleet.map((lorry, i) => {
          const c = copy[lorry.id]
          return (
            <article
              key={lorry.id}
              aria-labelledby={lorry.id}
              className={`flex flex-col gap-8 min-[900px]:items-start min-[900px]:gap-14 ${i % 2 ? 'min-[900px]:flex-row-reverse' : 'min-[900px]:flex-row'}`}
            >
              {/* Photo placeholder until the client supplies photos. */}
              <div className="flex aspect-[600/380] w-full items-end rounded-md bg-[#E6E8EA] p-5 text-[15px] text-muted min-[900px]:w-[600px] min-[900px]:shrink-0">
                {t(c.photo)}
              </div>
              <div className="flex flex-1 flex-col gap-4">
                <h2 id={lorry.id} className="font-display text-[36px] font-bold leading-none min-[900px]:text-[40px]">
                  {lorry.name}
                </h2>
                <p className="text-[17px] leading-relaxed text-muted">{t(c.text)}</p>
                <dl className="m-0 border-b border-rule text-base">
                  <Row label={t('fleet.body')} first>
                    {t(lorry.bodyKey)}
                  </Row>
                  <Row label={t('fleet.payload')}>{lorry.payload ?? <Pending kind="confirm" />}</Row>
                  <Row label={t('fleet.size')}>{lorry.size ?? <Pending kind="confirm" />}</Row>
                  <Row label={t('fleet.bestFor')}>{t(c.best)}</Row>
                </dl>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}
