import { useT } from '../../i18n/locale'

// Stands in for a fact the client hasn't confirmed or supplied yet. Never replace with a guess.
export function Pending({ kind }: { kind: 'confirm' | 'supply' }) {
  const t = useT()
  return (
    <span data-pending className="text-muted">
      {kind === 'confirm' ? t('common.toBeConfirmed') : t('common.toBeSupplied')}
    </span>
  )
}
