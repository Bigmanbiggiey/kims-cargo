import { type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { ChevronBand } from '../components/brand/ChevronBand'
import { Logo } from '../components/brand/Logo'
import { RoadScene } from '../components/brand/RoadScene'
import { usePageTitle } from '../components/layout/Layout'
import { ButtonLink } from '../components/ui/Button'
import { GlassSheet } from '../components/ui/GlassSheet'
import { site } from '../content/site'
import { localePath, type MessageKey, useLocale, useT } from '../i18n/locale'
import { telHref, waHref } from '../lib/links'

const whatsappDefault = site.phones[0].display

const carry: [title: MessageKey, text: MessageKey][] = [
  ['home.carry1Title', 'home.carry1Text'],
  ['home.carry2Title', 'home.carry2Text'],
  ['home.carry3Title', 'home.carry3Text'],
  ['home.carry4Title', 'home.carry4Text'],
]

const steps: [title: MessageKey, text: MessageKey][] = [
  ['home.step1Title', 'home.step1Text'],
  ['home.step2Title', 'home.step2Text'],
  ['home.step3Title', 'home.step3Text'],
]

const handInput =
  'focus-light h-10 w-full border-0 border-b-[1.5px] border-ink bg-transparent p-0 font-hand text-[22px] text-carbon placeholder:font-sans placeholder:text-base placeholder:text-muted'

export function HomePage() {
  const t = useT()
  const locale = useLocale()
  const navigate = useNavigate()
  usePageTitle(t('home.title'))

  // Phase 2: carry what was typed to the quote page; Phase 3 replaces this with the real form.
  const onStart = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const params = new URLSearchParams()
    for (const key of ['pickup', 'dropoff', 'day']) {
      const value = String(data.get(key) ?? '').trim()
      if (value) params.set(key, value)
    }
    const query = params.toString()
    navigate(`${localePath(locale, '/quote')}${query ? `?${query}` : ''}`)
  }

  return (
    <>
      <section className="relative overflow-hidden bg-road text-cab">
        <RoadScene variant="hero" />
        <div className="relative mx-auto grid max-w-[1280px] gap-12 px-4 pb-16 pt-28 min-[900px]:grid-cols-[minmax(0,1fr)_380px] min-[900px]:px-12 min-[900px]:pb-24 min-[900px]:pt-[120px]">
          <div className="flex flex-col gap-6">
            <Logo kind="full" tone="light" className="h-[100px] w-auto self-start min-[900px]:h-32" />
            <h1 className="font-display text-[40px] font-bold leading-[1.02] min-[900px]:text-[58px]">
              {t('home.headline')}
            </h1>
            <p className="max-w-[500px] text-lg leading-relaxed text-muted-dark-2 min-[900px]:text-[19px]">
              {t('home.intro')}
            </p>
            <div className="flex flex-col gap-3.5 sm:flex-row">
              <ButtonLink to={localePath(locale, '/quote')} variant="primary">
                {t('common.requestQuote')}
              </ButtonLink>
              <ButtonLink href={waHref(whatsappDefault)} variant="glass">
                {t('common.whatsapp')} {whatsappDefault}
              </ButtonLink>
            </div>
          </div>

          <GlassSheet copies className="self-start">
            <form onSubmit={onStart} className="flex flex-col gap-4" aria-labelledby="start-quote">
              <h2 id="start-quote" className="font-display text-[26px] font-bold">
                {t('home.startTitle')}
              </h2>
              <label className="flex flex-col text-[13px] font-semibold text-muted">
                {t('home.pickup')}
                <input name="pickup" type="text" placeholder={t('home.townOrArea')} className={handInput} />
              </label>
              <label className="flex flex-col text-[13px] font-semibold text-muted">
                {t('home.dropoff')}
                <input name="dropoff" type="text" placeholder={t('home.townOrArea')} className={handInput} />
              </label>
              <label className="flex flex-col text-[13px] font-semibold text-muted">
                {t('home.preferredDay')}
                <input name="day" type="text" className={handInput} />
              </label>
              <p className="text-sm leading-normal text-muted">{t('home.startNext')}</p>
              <button
                type="submit"
                className="focus-light min-h-[52px] rounded bg-tarmac text-[17px] font-extrabold text-cab"
              >
                {t('home.continue')}
              </button>
            </form>
          </GlassSheet>
        </div>
      </section>

      <ChevronBand />

      <section className="mx-auto grid max-w-[1280px] px-4 min-[900px]:grid-cols-3 min-[900px]:px-12">
        {[
          { title: 'Isuzu FRR 33', text: t('home.isuzuStrip'), to: '/fleet', link: t('home.seeFleet') },
          { title: 'Mitsubishi Fuso FH', text: t('home.fusoStrip'), to: '/fleet', link: t('home.seeFleet') },
          { title: t('home.whereTitle'), text: t('home.whereText'), to: '/routes', link: t('home.seeRoutes') },
        ].map((item, i) => (
          <div
            key={item.title}
            className={`flex flex-col gap-2 border-rule py-8 min-[900px]:py-10 ${i < 2 ? 'border-b min-[900px]:border-b-0 min-[900px]:border-r min-[900px]:pr-8' : ''} ${i > 0 ? 'min-[900px]:pl-8' : ''}`}
          >
            <h2 className="font-display text-[26px] font-semibold">{item.title}</h2>
            <p className="text-[17px] leading-relaxed text-muted">{item.text}</p>
            <Link to={localePath(locale, item.to)} className="focus-light inline-flex min-h-11 items-center self-start font-bold text-carbon">
              {item.link}
            </Link>
          </div>
        ))}
      </section>

      <section className="border-t border-[#E4E6EA] bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-10 px-4 py-16 min-[900px]:flex-row min-[900px]:gap-16 min-[900px]:px-12">
          <div className="flex flex-col gap-4 min-[900px]:w-[340px] min-[900px]:shrink-0">
            <h2 className="font-display text-[36px] font-bold leading-tight min-[900px]:text-[44px]">
              {t('home.carryTitle')}
            </h2>
            <p className="text-[17px] leading-relaxed text-muted">{t('home.carryIntro')}</p>
            <Link to={localePath(locale, '/services')} className="focus-light text-[17px] font-bold text-carbon">
              {t('home.allServices')}
            </Link>
          </div>
          <dl className="grid flex-1 content-start gap-x-12 sm:grid-cols-2">
            {carry.map(([title, text]) => (
              <div key={title} className="border-t-2 border-tarmac py-5">
                <dt className="font-display text-[22px] font-semibold">{t(title)}</dt>
                <dd className="mt-1.5 text-base leading-relaxed text-muted">{t(text)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="bg-tarmac text-cab">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-4 py-14 min-[900px]:px-12">
          <h2 id="how-title" className="font-display text-[34px] font-bold min-[900px]:text-[40px]">
            {t('home.howTitle')}
          </h2>
          <ol aria-labelledby="how-title" className="grid gap-8 min-[900px]:grid-cols-3 min-[900px]:gap-12">
            {steps.map(([title, text], i) => (
              <li key={title} className="flex gap-4">
                <span aria-hidden="true" className="font-display text-[56px] font-bold leading-[0.9] text-plate">
                  {i + 1}
                </span>
                <span className="flex flex-col gap-1.5">
                  <strong className="text-[19px]">{t(title)}</strong>
                  <span className="text-base leading-relaxed text-muted-dark-2">{t(text)}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-plate text-tarmac">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 py-12 min-[900px]:flex-row min-[900px]:items-center min-[900px]:justify-between min-[900px]:px-12 min-[900px]:py-16">
          <div className="flex flex-col gap-1.5">
            <h2 className="font-display text-[34px] font-bold min-[900px]:text-[40px]">{t('home.talkTitle')}</h2>
            <p className="text-lg">{t('home.talkText')}</p>
          </div>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
            <span className="flex flex-col sm:text-right">
              {site.phones.map((p) => (
                <a
                  key={p.display}
                  href={telHref(p.display)}
                  className="focus-light font-display text-[30px] font-bold text-tarmac no-underline min-[900px]:text-[34px]"
                >
                  {p.display}
                </a>
              ))}
            </span>
            <ButtonLink href={waHref(whatsappDefault)} variant="dark">
              {t('common.whatsappUs')}
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}
