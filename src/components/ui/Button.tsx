import type { ReactNode } from 'react'
import { Link } from 'react-router'

type Variant = 'primary' | 'glass' | 'outline' | 'dark'

const variants: Record<Variant, string> = {
  primary: 'bg-plate font-extrabold text-tarmac',
  glass: 'glass-button font-bold text-cab',
  outline: 'border-2 border-tarmac font-bold text-tarmac',
  dark: 'bg-tarmac font-extrabold text-cab',
}

// Which surface each variant normally sits on, for the focus ring colour (spec §9).
const defaultSurface: Record<Variant, 'dark' | 'light'> = {
  primary: 'dark',
  glass: 'dark',
  outline: 'light',
  dark: 'light',
}

type ButtonLinkProps = {
  variant: Variant
  children: ReactNode
  surface?: 'dark' | 'light'
  className?: string
} & ({ to: string; href?: never } | { href: string; to?: never })

export function ButtonLink({ variant, children, surface, className = '', ...target }: ButtonLinkProps) {
  const focus = (surface ?? defaultSurface[variant]) === 'dark' ? 'focus-dark' : 'focus-light'
  const classes = `${focus} inline-flex min-h-[52px] items-center justify-center rounded px-6 text-[17px] no-underline ${variants[variant]} ${className}`

  if (target.to !== undefined) {
    return (
      <Link to={target.to} className={classes}>
        {children}
      </Link>
    )
  }
  const external = /^https?:/.test(target.href)
  return (
    <a
      href={target.href}
      className={classes}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  )
}
