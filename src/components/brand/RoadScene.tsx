// Flat tarmac planes with yellow lane dashes and plate shapes, behind dark page tops (spec §8).
// Decorative only; a client photo can replace it later.
export function RoadScene({ variant }: { variant: 'hero' | 'band' }) {
  if (variant === 'band') {
    return (
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full"
        viewBox="0 0 1280 320"
        preserveAspectRatio="xMaxYMid slice"
      >
        <rect width="1280" height="320" fill="var(--color-road)" />
        <path d="M760 0 L1280 0 L1280 320 L640 320 Z" fill="var(--color-road-2)" />
        <path d="M960 40 L984 40 L900 220 L876 220 Z" fill="var(--color-plate)" />
        <rect x="1060" y="140" width="200" height="140" rx="10" fill="var(--color-plate)" />
      </svg>
    )
  }
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full"
      viewBox="0 0 1280 680"
      preserveAspectRatio="xMaxYMid slice"
    >
      <rect width="1280" height="680" fill="var(--color-road)" />
      <path d="M700 0 L1280 0 L1280 680 L470 680 Z" fill="var(--color-road-2)" />
      <path d="M880 0 L904 0 L790 230 L766 230 Z M740 320 L764 320 L650 550 L626 550 Z" fill="var(--color-plate)" />
      <rect x="1000" y="110" width="250" height="160" rx="10" fill="var(--color-plate)" />
      <rect x="1030" y="350" width="210" height="130" rx="10" fill="var(--color-chevron)" />
      <circle cx="1120" cy="600" r="90" fill="var(--color-plate)" opacity="0.5" />
    </svg>
  )
}
