import { type Ref, useEffect, useImperativeHandle, useRef } from 'react'

// Cloudflare Turnstile spam check (D-20). Loads Cloudflare's script only on the quote page.
const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string
  reset: (id: string) => void
  remove: (id: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

let scriptPromise: Promise<TurnstileApi> | null = null

function loadScript(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.async = true
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('turnstile missing')))
    script.onerror = () => {
      scriptPromise = null
      reject(new Error('turnstile failed to load'))
    }
    document.head.appendChild(script)
  })
  return scriptPromise
}

export type TurnstileHandle = { reset: () => void }

type Props = {
  /** Called with a fresh token, or '' when the token expires or the check fails. */
  onToken: (token: string) => void
  label: string
  ref?: Ref<TurnstileHandle>
}

export function Turnstile({ onToken, label, ref }: Props) {
  const box = useRef<HTMLDivElement>(null)
  const widget = useRef<string | null>(null)
  const onTokenRef = useRef(onToken)
  useEffect(() => {
    onTokenRef.current = onToken
  }, [onToken])

  useImperativeHandle(ref, () => ({
    reset() {
      onTokenRef.current('')
      if (widget.current && window.turnstile) window.turnstile.reset(widget.current)
    },
  }))

  useEffect(() => {
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined
    if (!siteKey || !box.current) return
    let cancelled = false
    loadScript()
      .then((api) => {
        if (cancelled || !box.current) return
        widget.current = api.render(box.current, {
          sitekey: siteKey,
          language: 'auto', // follows the visitor's browser; Turnstile has no Swahili option to rely on
          appearance: 'interaction-only',
          callback: (token: string) => onTokenRef.current(token),
          'expired-callback': () => onTokenRef.current(''),
          'error-callback': () => onTokenRef.current(''),
        })
      })
      .catch(() => onTokenRef.current(''))
    return () => {
      cancelled = true
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current)
      widget.current = null
    }
  }, [])

  return <div ref={box} role="group" aria-label={label} className="min-h-0 empty:hidden" />
}
