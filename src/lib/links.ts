// Link builders for phone, WhatsApp and Maps. Numbers are entered as Kenyan local mobiles ("0745 822 788").
const KENYAN_MOBILE = /^0[17]\d{8}$/

function international(display: string): string {
  const digits = display.replace(/\s+/g, '')
  if (!KENYAN_MOBILE.test(digits)) throw new Error(`Not a Kenyan mobile number: "${display}"`)
  return `254${digits.slice(1)}`
}

export function telHref(display: string): string {
  return `tel:+${international(display)}`
}

export function waHref(display: string, text?: string): string {
  const base = `https://wa.me/${international(display)}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}

export function mapsHref(query: string | null): string | null {
  if (!query) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
