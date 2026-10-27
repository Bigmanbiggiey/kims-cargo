// Red-and-white reflective chevrons, used as a section divider (spec §8).
export function ChevronBand({ size = 'lg' }: { size?: 'lg' | 'sm' }) {
  const stripes =
    size === 'lg'
      ? 'h-4 bg-[repeating-linear-gradient(135deg,var(--color-chevron)_0_24px,var(--color-cab)_24px_48px)]'
      : 'h-2 bg-[repeating-linear-gradient(135deg,var(--color-chevron)_0_14px,var(--color-cab)_14px_28px)]'
  return <div aria-hidden="true" className={`shrink-0 ${stripes}`} />
}
