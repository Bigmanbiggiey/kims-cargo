import { type ChangeEvent, type FormEvent, type ReactNode, useId, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import {
  CARGO_TYPES,
  dateRange,
  isRealDate,
  isSunday,
  MAX_LENGTH,
  type FieldError,
  type QuoteErrors,
  type QuoteField,
  TIME_WINDOWS,
  validateQuote,
} from '../../supabase/functions/_shared/quoteRules.ts'
import { usePageTitle } from '../components/layout/Layout'
import { PageHead } from '../components/layout/PageHead'
import { Turnstile, type TurnstileHandle } from '../components/quote/Turnstile'
import { ButtonLink } from '../components/ui/Button'
import { GlassSheet } from '../components/ui/GlassSheet'
import { site } from '../content/site'
import { contentLang, type MessageKey, useLocale, useT } from '../i18n/locale'
import { telHref, waHref } from '../lib/links'
import { submitQuote, type SubmitResult } from '../lib/quoteApi'

type Values = Record<QuoteField, string>
type Failure = Exclude<SubmitResult['kind'], 'ok' | 'invalid'>
type Status =
  | { kind: 'editing'; failure?: Failure }
  | { kind: 'sending' }
  | { kind: 'done'; requestNo: string; notified: boolean; duplicate: boolean; sent: Values }

const empty: Values = {
  name: '',
  phone: '',
  email: '',
  pickup: '',
  dropoff: '',
  cargoType: '',
  description: '',
  weight: '',
  size: '',
  preferredDate: '',
  timeWindow: '',
  notes: '',
}

// Order of fields in the error summary, matching the order on the page.
const fieldOrder: QuoteField[] = [
  'name',
  'phone',
  'email',
  'pickup',
  'dropoff',
  'cargoType',
  'description',
  'weight',
  'size',
  'preferredDate',
  'timeWindow',
  'notes',
]

const requiredMessage: Partial<Record<QuoteField, MessageKey>> = {
  name: 'quote.errors.name',
  phone: 'quote.errors.phone',
  pickup: 'quote.errors.pickup',
  dropoff: 'quote.errors.dropoff',
  cargoType: 'quote.errors.cargoType',
  preferredDate: 'quote.errors.date',
  timeWindow: 'quote.errors.window',
}

function errorKey(field: QuoteField, error: FieldError): MessageKey {
  if (error === 'tooLong') return 'quote.tooLong'
  if (field === 'phone' && error === 'invalid') return 'quote.errors.phoneInvalid'
  if (field === 'email') return 'quote.errors.emailInvalid'
  if (field === 'preferredDate') {
    if (error === 'tooEarly') return 'quote.errors.dateTooEarly'
    if (error === 'tooLate') return 'quote.errors.dateTooLate'
    if (error === 'invalid') return 'quote.errors.dateInvalid'
  }
  return requiredMessage[field] ?? 'quote.tooLong'
}

const failureKey: Record<Failure, MessageKey> = {
  network: 'quote.failNetwork',
  server: 'quote.failServer',
  captcha: 'quote.failCaptcha',
  rate_limited: 'quote.failRateLimited',
}

const singleLine =
  'focus-light h-11 w-full border-0 border-b-[1.5px] border-ink bg-transparent p-0 font-hand text-[22px] text-carbon aria-[invalid=true]:border-chevron'
const boxed =
  'focus-light w-full rounded border-[1.5px] border-rule bg-white px-3 py-2.5 text-[17px] text-ink aria-[invalid=true]:border-chevron'
const labelText = 'text-[14px] font-semibold text-muted'

function useInitialValues(): Values {
  const [params] = useSearchParams()
  const [initial] = useState(() => {
    const day = params.get('day')?.trim() ?? ''
    const { min, max } = dateRange(new Date())
    return {
      ...empty,
      pickup: params.get('pickup')?.trim().slice(0, MAX_LENGTH.pickup) ?? '',
      dropoff: params.get('dropoff')?.trim().slice(0, MAX_LENGTH.dropoff) ?? '',
      preferredDate: isRealDate(day) && day >= min && day <= max ? day : '',
    }
  })
  return initial
}

export function QuotePage() {
  const t = useT()
  const locale = useLocale()
  usePageTitle(t('quote.title'))

  const initial = useInitialValues()
  const [values, setValues] = useState<Values>(initial)
  const [errors, setErrors] = useState<QuoteErrors>({})
  const [status, setStatus] = useState<Status>({ kind: 'editing' })
  const [token, setToken] = useState('')
  const [range] = useState(() => dateRange(new Date()))
  const honeypot = useRef<HTMLInputElement>(null)
  const summary = useRef<HTMLDivElement>(null)
  const failureBox = useRef<HTMLDivElement>(null)
  const successHeading = useRef<HTMLHeadingElement>(null)
  const turnstile = useRef<TurnstileHandle>(null)

  const lang = contentLang(locale)
  const formatDay = (iso: string) =>
    new Intl.DateTimeFormat(lang === 'sw' ? 'sw-KE' : 'en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${iso}T00:00:00Z`))

  const set = (field: QuoteField) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.value
    setValues((v) => ({ ...v, [field]: value }))
    if (errors[field]) setErrors(({ [field]: _cleared, ...rest }) => rest)
  }

  const whatsappMessage = (v: Values, requestNo?: string) => {
    const lines = [t('quote.waGreeting')]
    if (requestNo) lines.push(`${t('quote.waRequestNo')} ${requestNo}`)
    if (v.pickup.trim()) lines.push(`${t('quote.waPickup')}: ${v.pickup.trim()}`)
    if (v.dropoff.trim()) lines.push(`${t('quote.waDropoff')}: ${v.dropoff.trim()}`)
    if ((CARGO_TYPES as readonly string[]).includes(v.cargoType))
      lines.push(`${t('quote.waLoad')}: ${t(`quote.cargo.${v.cargoType}` as MessageKey)}`)
    if (isRealDate(v.preferredDate)) {
      const time = (TIME_WINDOWS as readonly string[]).includes(v.timeWindow)
        ? `, ${t(`quote.windows.${v.timeWindow}` as MessageKey)}`
        : ''
      lines.push(`${t('quote.waDay')}: ${formatDay(v.preferredDate)}${time}`)
    }
    return lines.join('\n')
  }

  const fail = (failure: Failure) => {
    turnstile.current?.reset() // tokens are single-use
    setStatus({ kind: 'editing', failure })
    requestAnimationFrame(() => failureBox.current?.focus())
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (status.kind === 'sending') return

    const checked = validateQuote(values, new Date())
    if (!checked.ok) {
      setErrors(checked.errors)
      setStatus({ kind: 'editing' })
      requestAnimationFrame(() => summary.current?.focus())
      return
    }
    setErrors({})
    if (!token) return fail('captcha')

    setStatus({ kind: 'sending' })
    const result = await submitQuote({ ...values, website: honeypot.current?.value ?? '', turnstileToken: token })
    if (result.kind === 'ok') {
      setStatus({ kind: 'done', requestNo: result.requestNo, notified: result.notified, duplicate: result.duplicate, sent: values })
      requestAnimationFrame(() => successHeading.current?.focus())
    } else if (result.kind === 'invalid') {
      turnstile.current?.reset()
      setErrors(result.fields)
      setStatus({ kind: 'editing' })
      requestAnimationFrame(() => summary.current?.focus())
    } else {
      fail(result.kind)
    }
  }

  const startAgain = () => {
    setValues(empty)
    setStatus({ kind: 'editing' })
    turnstile.current?.reset()
  }

  const whatsappDefault = site.phones[0].display
  const errorList = fieldOrder.filter((f) => errors[f])
  const sunday = isRealDate(values.preferredDate) && isSunday(values.preferredDate)

  return (
    <>
      <PageHead title={t('quote.title')} intro={t('quote.intro')} />

      {/* overflow-x-clip: the tilted carbon copies behind the sheet must not cause sideways scrolling. */}
      <div className="mx-auto max-w-[1280px] overflow-x-clip px-4 py-14 min-[900px]:px-12 min-[900px]:py-16">
        <GlassSheet copies className="max-w-[760px]">
          {status.kind === 'done' ? (
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-4">
                <span className="-rotate-6 rounded border-[3px] border-chevron px-3 py-1 font-display text-[22px] font-bold uppercase tracking-wider text-chevron">
                  {t('quote.receivedStamp')}
                </span>
                <p className="font-display text-[26px] font-bold text-chevron">
                  {t('quote.requestNo')} {status.requestNo}
                </p>
              </div>
              <h2 ref={successHeading} tabIndex={-1} className="font-display text-[28px] font-bold outline-none">
                {t('quote.successTitle')}
              </h2>
              <p className="text-[17px] leading-relaxed">{t('quote.successText')}</p>
              {status.duplicate && <p className="text-[17px] leading-relaxed">{t('quote.duplicateText')}</p>}
              {!status.notified && (
                <p className="rounded border-l-4 border-plate bg-copy-yellow px-4 py-3 text-[17px] leading-relaxed">
                  {t('quote.notNotified')}
                </p>
              )}
              <div className="flex flex-col gap-3 sm:flex-row">
                <ButtonLink
                  href={waHref(whatsappDefault, whatsappMessage(status.sent, status.requestNo))}
                  variant={status.notified ? 'outline' : 'primary'}
                  surface="light"
                >
                  {t('quote.sendOnWhatsapp')}
                </ButtonLink>
                <button
                  type="button"
                  onClick={startAgain}
                  className="focus-light min-h-[52px] rounded px-6 text-[17px] font-bold text-carbon underline"
                >
                  {t('quote.another')}
                </button>
              </div>
            </div>
          ) : (
            <form noValidate onSubmit={onSubmit} aria-labelledby="quote-form-title" className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <h2 id="quote-form-title" className="font-display text-[28px] font-bold">
                  {t('quote.formTitle')}
                </h2>
                <p className="text-[15px] text-muted">{t('quote.required')}</p>
              </div>

              {errorList.length > 0 && (
                <div
                  ref={summary}
                  tabIndex={-1}
                  role="alert"
                  aria-labelledby="quote-error-summary"
                  className="focus-light rounded border-l-4 border-chevron bg-white px-4 py-3"
                >
                  <h3 id="quote-error-summary" className="text-[17px] font-bold text-chevron">
                    {t('quote.errorSummary')}
                  </h3>
                  <ul className="mt-2 list-disc pl-5">
                    {errorList.map((f) => (
                      <li key={f}>
                        <a
                          href={`#quote-${f}`}
                          onClick={(e) => {
                            // Centre the field so the fixed header doesn't cover it, then focus it.
                            const el = document.getElementById(`quote-${f}`)
                            if (!el) return
                            e.preventDefault()
                            el.scrollIntoView({ block: 'center' })
                            el.focus({ preventScroll: true })
                          }}
                          className="focus-light text-[16px] text-chevron underline"
                        >
                          {t(errorKey(f, errors[f] as FieldError))}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Section title={t('quote.sectionYou')}>
                <Field id="name" label={t('quote.name')} required error={errors.name} t={t}>
                  {(a) => <input {...a} type="text" autoComplete="name" value={values.name} onChange={set('name')} maxLength={MAX_LENGTH.name} className={singleLine} />}
                </Field>
                <Field id="phone" label={t('quote.phone')} hint={t('quote.phoneHint')} required error={errors.phone} t={t}>
                  {(a) => <input {...a} type="tel" inputMode="tel" autoComplete="tel" value={values.phone} onChange={set('phone')} maxLength={MAX_LENGTH.phone} className={singleLine} />}
                </Field>
                <Field id="email" label={t('quote.email')} hint={t('quote.emailHint')} error={errors.email} t={t}>
                  {(a) => <input {...a} type="email" autoComplete="email" value={values.email} onChange={set('email')} maxLength={MAX_LENGTH.email} className={singleLine} />}
                </Field>
              </Section>

              <Section title={t('quote.sectionLoad')}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="pickup" label={t('quote.pickup')} hint={t('quote.placeHint')} required error={errors.pickup} t={t}>
                    {(a) => <input {...a} type="text" value={values.pickup} onChange={set('pickup')} maxLength={MAX_LENGTH.pickup} className={singleLine} />}
                  </Field>
                  <Field id="dropoff" label={t('quote.dropoff')} hint={t('quote.placeHint')} required error={errors.dropoff} t={t}>
                    {(a) => <input {...a} type="text" value={values.dropoff} onChange={set('dropoff')} maxLength={MAX_LENGTH.dropoff} className={singleLine} />}
                  </Field>
                </div>
                <Field id="cargoType" label={t('quote.cargoType')} required error={errors.cargoType} t={t}>
                  {(a) => (
                    <select {...a} value={values.cargoType} onChange={set('cargoType')} className={`${boxed} min-h-11`}>
                      <option value="">{t('quote.chooseCargo')}</option>
                      {CARGO_TYPES.map((c) => (
                        <option key={c} value={c}>
                          {t(`quote.cargo.${c}` as MessageKey)}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
                <Field id="description" label={t('quote.description')} hint={t('quote.descriptionHint')} error={errors.description} t={t}>
                  {(a) => <textarea {...a} rows={3} value={values.description} onChange={set('description')} maxLength={MAX_LENGTH.description} className={boxed} />}
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="weight" label={t('quote.weight')} hint={t('quote.weightHint')} error={errors.weight} t={t}>
                    {(a) => <input {...a} type="text" value={values.weight} onChange={set('weight')} maxLength={MAX_LENGTH.weight} className={singleLine} />}
                  </Field>
                  <Field id="size" label={t('quote.size')} error={errors.size} t={t}>
                    {(a) => <input {...a} type="text" value={values.size} onChange={set('size')} maxLength={MAX_LENGTH.size} className={singleLine} />}
                  </Field>
                </div>
              </Section>

              <Section title={t('quote.sectionWhen')}>
                <Field id="preferredDate" label={t('quote.date')} hint={t('quote.dateHint')} required error={errors.preferredDate} t={t}>
                  {(a) => (
                    <input
                      {...a}
                      type="date"
                      min={range.min}
                      max={range.max}
                      value={values.preferredDate}
                      onChange={set('preferredDate')}
                      className={`${boxed} min-h-11 max-w-[260px]`}
                    />
                  )}
                </Field>
                {sunday && <p className="-mt-2 text-[15px] font-semibold text-ink">{t('quote.sundayNote')}</p>}

                <fieldset
                  aria-describedby={`quote-timeWindow-hint${errors.timeWindow ? ' quote-timeWindow-error' : ''}`}
                  className="flex flex-col gap-2"
                >
                  <legend className={labelText}>
                    {t('quote.window')} <span aria-hidden="true">*</span>
                  </legend>
                  <p id="quote-timeWindow-hint" className="text-[14px] text-muted">
                    {t('quote.windowHint')}
                  </p>
                  {errors.timeWindow && (
                    <p id="quote-timeWindow-error" className="text-[15px] font-semibold text-chevron">
                      {t(errorKey('timeWindow', errors.timeWindow))}
                    </p>
                  )}
                  <div id="quote-timeWindow" tabIndex={-1} className="grid grid-cols-2 gap-3 outline-none sm:grid-cols-4">
                    {TIME_WINDOWS.map((w) => (
                      <label
                        key={w}
                        className="flex min-h-[52px] cursor-pointer items-center justify-center rounded border-2 border-rule bg-white px-2 text-center text-[16px] font-bold text-ink has-[:checked]:border-tarmac has-[:checked]:bg-plate has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-carbon"
                      >
                        <input
                          type="radio"
                          name="timeWindow"
                          value={w}
                          checked={values.timeWindow === w}
                          onChange={set('timeWindow')}
                          required
                          className="sr-only"
                        />
                        {t(`quote.windows.${w}` as MessageKey)}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <p className="rounded bg-copy-yellow px-4 py-3 text-[16px]" aria-live="polite">
                  {isRealDate(values.preferredDate) && values.timeWindow ? (
                    <>
                      {t('quote.yourRequest')}{' '}
                      <strong>
                        {formatDay(values.preferredDate)}, {t(`quote.windows.${values.timeWindow}` as MessageKey)}
                      </strong>
                    </>
                  ) : (
                    t('quote.noDayYet')
                  )}
                </p>

                <Field id="notes" label={t('quote.notes')} hint={t('quote.notesHint')} error={errors.notes} t={t}>
                  {(a) => <textarea {...a} rows={3} value={values.notes} onChange={set('notes')} maxLength={MAX_LENGTH.notes} className={boxed} />}
                </Field>
              </Section>

              {/* Honeypot: hidden from people and screen readers; bots that fill it are rejected by the server. */}
              <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
                <label>
                  Website
                  <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
                </label>
              </div>

              <Turnstile ref={turnstile} onToken={setToken} label={t('quote.securityCheck')} />

              {status.kind === 'editing' && status.failure && (
                <div
                  ref={failureBox}
                  tabIndex={-1}
                  role="alert"
                  className="focus-light flex flex-col gap-3 rounded border-l-4 border-chevron bg-white px-4 py-3"
                >
                  <h3 className="text-[17px] font-bold text-chevron">{t('quote.failTitle')}</h3>
                  <p className="text-[16px]">{t(failureKey[status.failure])}</p>
                  <p className="text-[16px]">{t('quote.failFallback')}</p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <ButtonLink href={waHref(whatsappDefault, whatsappMessage(values))} variant="outline" surface="light">
                      {t('quote.sendDetails')}
                    </ButtonLink>
                    <a href={telHref(whatsappDefault)} className="focus-light inline-flex min-h-11 items-center font-bold text-carbon">
                      {whatsappDefault}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <p className="text-[16px] font-semibold leading-normal text-ink">{t('common.preference')}</p>
                <button
                  type="submit"
                  disabled={status.kind === 'sending'}
                  aria-busy={status.kind === 'sending'}
                  className="focus-light min-h-[52px] rounded bg-tarmac px-6 text-[17px] font-extrabold text-cab disabled:opacity-70"
                >
                  {status.kind === 'sending' ? t('quote.sending') : t('quote.submit')}
                </button>
                <p className="text-[14px] leading-normal text-muted">{t('quote.privacy')}</p>
              </div>
            </form>
          )}
        </GlassSheet>
      </div>
    </>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const id = useId()
  return (
    <section aria-labelledby={id} className="flex flex-col gap-5">
      <h3 id={id} className="border-b border-rule pb-2 font-display text-[20px] font-bold">
        {title}
      </h3>
      {children}
    </section>
  )
}

type FieldAttrs = {
  id: string
  name: string
  'aria-invalid': boolean
  'aria-describedby'?: string
  'aria-required'?: boolean
}

function Field({
  id,
  label,
  hint,
  required = false,
  error,
  t,
  children,
}: {
  id: QuoteField
  label: string
  hint?: string
  required?: boolean
  error?: FieldError
  t: (key: MessageKey) => string
  children: (attrs: FieldAttrs) => ReactNode
}) {
  const inputId = `quote-${id}`
  const describedBy = [hint && `${inputId}-hint`, error && `${inputId}-error`].filter(Boolean).join(' ')
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className={labelText}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {hint && (
        <p id={`${inputId}-hint`} className="text-[14px] text-muted">
          {hint}
        </p>
      )}
      {children({
        id: inputId,
        name: id,
        'aria-invalid': Boolean(error),
        ...(describedBy ? { 'aria-describedby': describedBy } : {}),
        ...(required ? { 'aria-required': true } : {}),
      })}
      {error && (
        <p id={`${inputId}-error`} className="text-[15px] font-semibold text-chevron">
          {t(errorKey(id, error))}
        </p>
      )}
    </div>
  )
}
