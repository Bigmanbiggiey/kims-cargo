import { useT } from '../../i18n/locale'

type LogoProps = {
  kind: 'full' | 'mark'
  tone: 'light' | 'dark'
  /** True when the brand name is written next to the logo, so the image needs no alt text. */
  decorative?: boolean
  className?: string
}

// Logo files and usage rules: spec §4. Light on tarmac/road, dark on white/cab.
export function Logo({ kind, tone, decorative = false, className }: LogoProps) {
  const t = useT()
  return (
    <img
      src={`/brand/${kind === 'full' ? 'logo' : 'mark'}-${tone}.png`}
      alt={decorative ? '' : t('common.logoAlt')}
      className={className}
    />
  )
}
