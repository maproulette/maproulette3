import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { statusHexByKey, statusLabelByKey } from './statusColors'

interface Props {
  counts: Record<string, number>
  height?: number
}

export const StatusBreakdownBar = ({ counts, height = 10 }: Props) => {
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  if (total === 0) {
    return (
      <div
        role="img"
        aria-label="No tasks yet"
        className="w-full rounded-full bg-zinc-200 dark:bg-slate-700"
        style={{ height }}
      />
    )
  }

  return (
    <div
      className="flex w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-slate-700"
      style={{ height }}
      role="progressbar"
      aria-valuenow={counts.fixed ?? 0}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label="Status breakdown"
    >
      {Object.entries(counts).map(([key, value]) => {
        if (!value) return null
        const percent = (value / total) * 100
        const color = statusHexByKey[key] ?? '#71717a'
        const label = statusLabelByKey[key] ?? key
        return (
          <Tooltip key={key}>
            <TooltipTrigger asChild>
              <span
                aria-hidden="true"
                style={{ backgroundColor: color, width: `${percent}%` }}
                className="h-full"
              />
            </TooltipTrigger>
            <TooltipContent>
              <span className="text-xs">
                {label}: {value.toLocaleString()} ({percent.toFixed(1)}%)
              </span>
            </TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}
