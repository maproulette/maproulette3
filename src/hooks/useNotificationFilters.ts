import { useCallback, useMemo, useState } from 'react'
import type { Notification } from '@/types/Notification'

export const useNotificationFilters = (notifications: Notification[]) => {
  const [filterTask, setFilterTask] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [filterFrom, setFilterFrom] = useState('all')
  const [filterChallenge, setFilterChallenge] = useState('all')

  const hasActiveFilters =
    filterTask !== 'all' ||
    filterType !== 'all' ||
    filterFrom !== 'all' ||
    filterChallenge !== 'all'

  const clearFilters = () => {
    setFilterTask('all')
    setFilterType('all')
    setFilterFrom('all')
    setFilterChallenge('all')
  }

  const filterOptions = useMemo(() => {
    const tasks = new Set<number>()
    const types = new Set<number>()
    const fromUsers = new Set<string>()
    const challenges = new Set<string>()

    notifications.forEach((n) => {
      if (n.taskId) tasks.add(n.taskId)
      if (n.notificationType !== undefined) types.add(n.notificationType)
      if (n.fromUsername) fromUsers.add(n.fromUsername)
      if (n.challengeName) challenges.add(n.challengeName)
    })

    return {
      tasks: Array.from(tasks).sort((a, b) => a - b),
      types: Array.from(types).sort((a, b) => a - b),
      fromUsers: Array.from(fromUsers).sort(),
      challenges: Array.from(challenges).sort(),
    }
  }, [notifications])

  const applyFilters = useCallback(
    (notificationsToFilter: Notification[]) => {
      let filtered = notificationsToFilter

      if (filterTask !== 'all') {
        const taskId = parseInt(filterTask, 10)
        filtered = filtered.filter((n) => n.taskId === taskId)
      }

      if (filterType !== 'all') {
        const typeId = parseInt(filterType, 10)
        filtered = filtered.filter((n) => n.notificationType === typeId)
      }

      if (filterFrom !== 'all') {
        filtered = filtered.filter((n) => n.fromUsername === filterFrom)
      }

      if (filterChallenge !== 'all') {
        filtered = filtered.filter((n) => n.challengeName === filterChallenge)
      }

      return filtered
    },
    [filterTask, filterType, filterFrom, filterChallenge]
  )

  return {
    filterTask,
    setFilterTask,
    filterType,
    setFilterType,
    filterFrom,
    setFilterFrom,
    filterChallenge,
    setFilterChallenge,
    hasActiveFilters,
    clearFilters,
    filterOptions,
    applyFilters,
  }
}
