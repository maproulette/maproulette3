import { type ActionCounts, useActionSummary } from './useActionSummary'

interface Props {
  /** Raw per-status action counts (e.g. from `challengeStats.actions`). */
  actions: ActionCounts | undefined
}

export const StatusBreakdownLegend = ({ actions }: Props) => {
  const { segments } = useActionSummary(actions)
  if (segments.length === 0) return null

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
      {segments.map((segment) => (
        <div key={segment.key} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block size-2.5 shrink-0 rounded-sm"
            style={{ backgroundColor: segment.color }}
          />
          <dt className="flex-1 text-zinc-600 dark:text-slate-400">{segment.label}</dt>
          <dd className="font-mono tabular-nums">{segment.count.toLocaleString()}</dd>
        </div>
      ))}
    </dl>
  )
}
