import { statusHexByKey, statusLabelByKey } from './statusColors'

interface Props {
  counts: Record<string, number>
}

export const StatusBreakdownLegend = ({ counts }: Props) => {
  const entries = Object.entries(counts).filter(([, v]) => v > 0)
  if (entries.length === 0) return null

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
      {entries.map(([key, value]) => (
        <div key={key} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block size-2.5 shrink-0 rounded-sm"
            style={{ backgroundColor: statusHexByKey[key] ?? '#71717a' }}
          />
          <dt className="flex-1 text-zinc-600 dark:text-slate-400">
            {statusLabelByKey[key] ?? key}
          </dt>
          <dd className="font-mono tabular-nums">{value.toLocaleString()}</dd>
        </div>
      ))}
    </dl>
  )
}
