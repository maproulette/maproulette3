import { Activity } from 'lucide-react'
import { useMemo } from 'react'
import { api } from '@/api'
import { Loader } from '@/components/ui/Loader'

const STATUS_LABELS: Record<number, string> = {
  1: 'Set Status on Task as Fixed',
  2: 'Set Status on Task as Not an Issue',
  3: 'Set Status on Task as Skipped',
  5: 'Set Status on Task as Already Fixed',
  6: 'Set Status on Task as Too Hard',
}

const STATUS_COLORS: Record<number, string> = {
  1: 'text-emerald-400',
  2: 'text-yellow-400',
  3: 'text-blue-400',
  5: 'text-purple-400',
  6: 'text-orange-400',
}

interface GroupedActivity {
  date: string
  challenges: {
    name: string
    parentId: number
    actions: { status: number; count: number }[]
  }[]
}

export const ContributionsSection = () => {
  const { data: activityData, isLoading, error } = api.user.activity()

  // Group activity data by date, then by challenge, then aggregate by status
  const { groupedActivities, totalTasks } = useMemo(() => {
    if (!activityData || activityData.length === 0) {
      return { groupedActivities: [] as GroupedActivity[], totalTasks: 0 }
    }

    // Group by date string (e.g., "JANUARY 26")
    const dateMap = new Map<string, Map<number, Map<number, number>>>()

    // Track challenge names by parentId
    const challengeNames = new Map<number, string>()

    let total = 0

    for (const entry of activityData) {
      const date = new Date(entry.created)
      const dateKey = date
        .toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
        .toUpperCase()

      challengeNames.set(entry.parentId, entry.parentName)

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, new Map())
      }
      const challengeMap = dateMap.get(dateKey) as Map<number, Map<number, number>>

      if (!challengeMap.has(entry.parentId)) {
        challengeMap.set(entry.parentId, new Map())
      }
      const statusMap = challengeMap.get(entry.parentId) as Map<number, number>

      statusMap.set(entry.status, (statusMap.get(entry.status) || 0) + 1)
      total++
    }

    // Convert to array format, sorted by date (most recent first)
    const grouped: GroupedActivity[] = []
    const sortedDates = Array.from(dateMap.entries()).sort((a, b) => {
      // Parse dates back to compare
      const dateA = new Date(a[0])
      const dateB = new Date(b[0])
      return dateB.getTime() - dateA.getTime()
    })

    for (const [dateKey, challengeMap] of sortedDates) {
      const challenges: GroupedActivity['challenges'] = []

      for (const [parentId, statusMap] of challengeMap) {
        const actions: { status: number; count: number }[] = []
        for (const [status, count] of statusMap) {
          actions.push({ status, count })
        }
        // Sort actions by status
        actions.sort((a, b) => a.status - b.status)

        challenges.push({
          name: challengeNames.get(parentId) || `Challenge ${parentId}`,
          parentId,
          actions,
        })
      }

      grouped.push({ date: dateKey, challenges })
    }

    return { groupedActivities: grouped, totalTasks: total }
  }, [activityData])

  const hasContributions = totalTasks > 0

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-xl bg-white/80 shadow-sm backdrop-blur-sm dark:bg-zinc-800/50 dark:shadow-none">
      <div className="flex shrink-0 items-center gap-2 px-4 py-3">
        <Activity className="h-4 w-4 text-indigo-400" />
        <h3 className="font-medium text-sm text-zinc-800 dark:text-zinc-200">Contributions</h3>
        {hasContributions && (
          <span className="ml-auto font-bold text-indigo-400 text-sm">
            {totalTasks.toLocaleString()}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {isLoading && (
          <div className="flex justify-center py-4">
            <Loader />
          </div>
        )}

        {error && <div className="py-2 text-center text-red-400 text-sm">Failed to load</div>}

        {!isLoading && !error && !hasContributions && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="mb-2 rounded-lg bg-zinc-100 p-2 dark:bg-zinc-700/50">
              <Activity className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">No contributions</p>
            <p className="text-xs text-zinc-500">Start mapping to track progress</p>
          </div>
        )}

        {!isLoading && !error && hasContributions && (
          <div className="relative space-y-4">
            {/* Timeline line */}
            <div className="absolute top-2 bottom-2 left-[7px] w-0.5 bg-gradient-to-b from-yellow-400/50 to-transparent" />

            {groupedActivities.map((group) => (
              <div key={group.date} className="relative pl-6">
                {/* Timeline dot */}
                <div className="absolute top-0.5 left-0 h-4 w-4 rounded-full bg-yellow-400" />

                {/* Date header */}
                <div className="mb-2 font-semibold text-xs text-yellow-400">{group.date}</div>

                {/* Challenges */}
                <div className="space-y-3">
                  {group.challenges.map((challenge) => (
                    <div key={challenge.parentId}>
                      {/* Challenge name */}
                      <div className="mb-1 font-medium text-emerald-400 text-sm">
                        {challenge.name}
                      </div>

                      {/* Actions */}
                      <div className="space-y-1 pl-2">
                        {challenge.actions.map((action) => (
                          <div key={action.status} className="flex items-center gap-2 text-xs">
                            <span
                              className={`flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-700/50 font-medium ${STATUS_COLORS[action.status] || 'text-zinc-400'}`}
                            >
                              {action.count}
                            </span>
                            <span className="text-zinc-400">
                              {STATUS_LABELS[action.status] || `Status ${action.status}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
