import { api } from '@/api'
import type { ProgressSegment } from '@/components/shared/ProgressBar'
import { STATUS_HEX, STATUS_KEY_TO_ID } from '@/lib/taskConstants'

const colorForKey = (key: string): string => STATUS_HEX[STATUS_KEY_TO_ID[key] ?? -1] ?? '#9ca3af'

const STATUS_COLORS: Record<string, string> = {
  fixed: colorForKey('fixed'),
  falsePositive: colorForKey('falsePositive'),
  skipped: colorForKey('skipped'),
  deleted: colorForKey('deleted'),
  alreadyFixed: colorForKey('alreadyFixed'),
  tooHard: colorForKey('tooHard'),
  available: colorForKey('available'),
  validated: colorForKey('validated'),
  answered: colorForKey('answered'),
  disabled: colorForKey('disabled'),
}

const STATUS_LABELS: Record<string, string> = {
  fixed: 'Fixed',
  falsePositive: 'Not an Issue',
  alreadyFixed: 'Already Fixed',
  validated: 'Validated',
  answered: 'Answered',
  deleted: 'Deleted',
  disabled: 'Disabled',
  tooHard: "Can't Complete",
  skipped: 'Skipped',
  available: 'Created',
}

// Left side: completed statuses (count toward completion %)
const COMPLETED_STATUSES = ['fixed', 'falsePositive', 'alreadyFixed'] as const

// Right side: statuses indicating more work needed
const REMAINING_STATUSES = ['tooHard', 'skipped', 'available'] as const

export const useChallengeProgress = (challengeId: number) => {
  const { data: challengeStatsData } = api.challenge.getChallengeStats(challengeId)
  const actions = challengeStatsData?.[0]?.actions

  const completionPercentage = (() => {
    if (!actions || actions.total === undefined || actions.total === 0) return 0
    const completed =
      (actions.fixed || 0) + (actions.falsePositive || 0) + (actions.alreadyFixed || 0)
    return Math.round((completed / actions.total) * 100)
  })()

  const buildSegments = (): ProgressSegment[] => {
    if (!actions || actions.total === undefined || actions.total === 0) return []

    const completed: ProgressSegment[] = []
    const remaining: ProgressSegment[] = []

    for (const status of COMPLETED_STATUSES) {
      const count = actions[status as keyof typeof actions] as number | undefined
      if (count && count > 0) {
        completed.push({
          key: status,
          percentage: (count / actions.total) * 100,
          color: STATUS_COLORS[status] || '#9ca3af',
          title: `${STATUS_LABELS[status]}: ${count}`,
        })
      }
    }

    for (const status of REMAINING_STATUSES) {
      const count = actions[status as keyof typeof actions] as number | undefined
      if (count && count > 0) {
        remaining.push({
          key: status,
          percentage: (count / actions.total) * 100,
          color: STATUS_COLORS[status] || '#9ca3af',
          title: `${STATUS_LABELS[status]}: ${count}`,
          opacity: 0.6,
        })
      }
    }

    return [...completed, ...remaining]
  }

  const segments = buildSegments()
  const hasActions = !!(actions && actions.total !== undefined && actions.total > 0)

  const total = actions?.total ?? 0
  const tasksRemaining =
    (actions?.available ?? 0) + (actions?.skipped ?? 0) + (actions?.tooHard ?? 0)

  return { completionPercentage, segments, hasActions, total, tasksRemaining }
}
