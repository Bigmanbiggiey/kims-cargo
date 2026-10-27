import type { ReactNode } from 'react'

type GlassSheetProps = {
  /** Show the pink and yellow carbon copies peeking out behind the sheet. */
  copies?: boolean
  className?: string
  children: ReactNode
}

// Near-opaque frosted sheet, so body text stays readable over the road scene (spec §7–8).
export function GlassSheet({ copies = false, className = '', children }: GlassSheetProps) {
  return (
    <div className={`relative ${className}`}>
      {copies && (
        <>
          <div
            data-copy
            aria-hidden="true"
            className="absolute inset-0 translate-x-6 translate-y-5 rotate-[4deg] rounded-md bg-copy-pink/55"
          />
          <div
            data-copy
            aria-hidden="true"
            className="absolute inset-0 translate-x-3 translate-y-2.5 -rotate-[2.5deg] rounded-md bg-copy-yellow/60"
          />
        </>
      )}
      <div className="glass-sheet relative rounded-md p-6 text-ink shadow-[0_24px_48px_-24px_rgb(0_0_0/0.6)]">
        {children}
      </div>
    </div>
  )
}
