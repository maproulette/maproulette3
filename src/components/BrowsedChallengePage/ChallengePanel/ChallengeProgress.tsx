import { BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface ChallengeProgressProps {
  actions?: {
    total?: number
    available?: number
    fixed?: number
    falsePositive?: number
    skipped?: number
    deleted?: number
    alreadyFixed?: number
    tooHard?: number
    answered?: number
    validated?: number
    disabled?: number
    avgTimeSpent?: number
    tasksWithTime?: number
  }
  onViewDetails?: () => void
}

// Status colors based on STATUS_CONFIG
const STATUS_COLORS: Record<string, string> = {
  fixed: 'bg-[#65D2DA]', // cyan/blue
  falsePositive: 'bg-[#F7BB59]', // yellow
  skipped: 'bg-[#E87CE0]', // pink
  deleted: 'bg-[#737373]', // gray
  alreadyFixed: 'bg-[#CCB186]', // tan/yellow
  tooHard: 'bg-[#FF5E63]', // red
  validated: 'bg-green-500', // green
  answered: 'bg-purple-500', // purple
  disabled: 'bg-slate-500', // slate
}

interface StatusSegment {
  status: string
  count: number
  percentage: number
  color: string
}

export const ChallengeProgress = ({ actions, onViewDetails }: ChallengeProgressProps) => {
  const calculateCompletionPercentage = () => {
    if (!actions || actions.total === undefined || actions.total === 0) {
      return 0
    }
    const completed = actions.total - (actions.available || 0)
    return Math.round((completed / actions.total) * 100)
  }

  const getStatusSegments = (): StatusSegment[] => {
    if (!actions || actions.total === undefined || actions.total === 0) {
      return []
    }

    const segments: StatusSegment[] = []
    const statusOrder = [
      'fixed',
      'validated',
      'falsePositive',
      'skipped',
      'alreadyFixed',
      'answered',
      'tooHard',
      'deleted',
      'disabled',
    ] as const

    for (const status of statusOrder) {
      const count = actions[status as keyof typeof actions] as number | undefined
      if (count && count > 0 && actions.total !== undefined && actions.total > 0) {
        segments.push({
          status,
          count,
          percentage: (count / actions.total) * 100,
          color: STATUS_COLORS[status] || 'bg-gray-500',
        })
      }
    }

    return segments
  }

  const completionPercentage = calculateCompletionPercentage()
  const hasActions = actions && actions.total !== undefined && actions.total > 0
  const statusSegments = getStatusSegments()

  if (!hasActions) return null

  return (
    <div className="mb-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">Progress</span>
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs"
              onClick={onViewDetails}
            >
              <BarChart3 className="size-3.5" />
              Details
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg text-zinc-900 dark:text-zinc-50">
            {completionPercentage}%
          </span>
        </div>
      </div>
      <div className="relative h-2 w-full rounded-full bg-zinc-200/30 dark:bg-zinc-700/30">
        {statusSegments.length > 0 ? (
          <div className="flex h-full overflow-hidden rounded-full">
            {statusSegments.map((segment, index) => {
              const segmentWidth = segment.percentage
              const isFirst = index === 0
              const isLast = index === statusSegments.length - 1
              return (
                <div
                  key={segment.status}
                  className={cn(
                    'h-full transition-all duration-300',
                    segment.color,
                    isFirst && 'rounded-l-full',
                    isLast && 'rounded-r-full'
                  )}
                  style={{
                    width: `${segmentWidth}%`,
                  }}
                  title={`${segment.status}: ${segment.count}`}
                />
              )
            })}
          </div>
        ) : (
          <div
            className="h-full rounded-full bg-zinc-400 transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        )}
      </div>
    </div>
  )
}
