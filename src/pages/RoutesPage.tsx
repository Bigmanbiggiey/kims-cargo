import { usePageTitle } from '../components/layout/Layout'
import { PageHead } from '../components/layout/PageHead'
import { ButtonLink } from '../components/ui/Button'
import { type AreaGroup, site } from '../content/site'
import { localePath, type MessageKey, useLocale, useT } from '../i18n/locale'

const groupTitle: Record<AreaGroup['id'], MessageKey> = {
  nairobi: 'routes.groupNairobi',
  kajiado: 'routes.groupKajiado',
  machakos: 'routes.groupMachakos',
  thika: 'routes.groupThika',
}

/** A long route drawn as a strip of road: tarmac bar, yellow lane dashes, a marker per stop. */
function RoadStrip({ stops, label }: { stops: readonly string[]; label: string }) {
  return (
    <div className="relative px-3.5">
      <div aria-hidden="true" className="absolute inset-x-3.5 top-0.5 h-6 rounded-sm bg-tarmac">
        <div className="absolute inset-x-3.5 top-2.5 h-1 bg-[repeating-linear-gradient(90deg,var(--color-plate)_0_26px,transparent_26px_46px)]" />
      </div>
      <ol aria-label={label} className="relative m-0 flex list-none justify-between p-0">
        {stops.map((stop, i) => (
          <li key={stop} className="-mx-3.5 flex flex-col items-center gap-3 first:items-start last:items-end">
            <span
              aria-hidden="true"
              className={`size-7 rounded-full border-[5px] border-tarmac ${i === stops.length - 1 ? 'bg-plate' : 'bg-cab'}`}
            />
            <span className="font-display text-lg font-semibold min-[900px]:text-[22px]">{stop}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function RoutesPage() {
  const t = useT()
  const locale = useLocale()
  usePageTitle(t('routes.title'))

  return (
    <>
      <PageHead title={t('routes.title')} intro={t('routes.intro')} />

      <section className="mx-auto flex max-w-[1280px] flex-col gap-10 px-4 py-14 min-[900px]:px-12">
        <h2 className="font-display text-[32px] font-bold min-[900px]:text-[36px]">{t('routes.longTitle')}</h2>
        {site.longRoutes.map((stops) => (
          <RoadStrip key={stops.join('-')} stops={stops} label={`${stops[0]} ${t('routes.to')} ${stops.at(-1)}`} />
        ))}
      </section>

      <section className="border-t border-[#E4E6EA] bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-4 py-14 min-[900px]:px-12">
          <h2 className="font-display text-[32px] font-bold min-[900px]:text-[36px]">{t('routes.aroundTitle')}</h2>
          <div className="grid gap-8 sm:grid-cols-2 min-[900px]:grid-cols-4 min-[900px]:gap-10">
            {site.areaGroups.map((group) => (
              <div key={group.id} className="flex flex-col gap-2.5 border-t-2 border-tarmac pt-4">
                <h3 className="text-lg font-bold">{t(groupTitle[group.id])}</h3>
                <ul className="m-0 list-none p-0 text-base leading-[1.7] text-muted">
                  {group.places.map((place) => (
                    <li key={place}>{place}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-tarmac text-cab">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 py-12 min-[900px]:flex-row min-[900px]:items-center min-[900px]:justify-between min-[900px]:px-12 min-[900px]:py-16">
          <div className="flex max-w-[760px] flex-col gap-2">
            <h2 className="font-display text-[30px] font-bold min-[900px]:text-[34px]">{t('routes.elseTitle')}</h2>
            <p className="text-[17px] leading-relaxed text-muted-dark-2">{t('routes.elseText')}</p>
          </div>
          <ButtonLink to={localePath(locale, '/quote')} variant="primary">
            {t('common.requestQuote')}
          </ButtonLink>
        </div>
      </section>
    </>
  )
}
