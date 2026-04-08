import { useMemo } from 'react'
import type { Notification } from '@/types/Notification'
import { getNotificationThreadKey } from '@/types/Notification'

export const useNotificationThreads = (notifications: Notification[]) => {
  return useMemo(() => {
    const grouped: Record<number | string, Notification[]> = {}
    for (const notification of notifications) {
      const key = getNotificationThreadKey(notification)
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(notification)
    }
    return grouped
  }, [notifications])
}
