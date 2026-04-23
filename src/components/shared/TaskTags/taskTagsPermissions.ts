import type { Task } from '@/types/Task'
import type { User } from '@/types/User'

const EDITABLE_STATUSES = new Set([0, 3, 6])
const EDITABLE_REVIEW_STATUSES = new Set([0, 2, 4, 5])

export const canEditTags = (task: Task | undefined, user: User | undefined): boolean => {
  if (!task || !user) return false
  const status = task.status ?? 0
  const reviewStatus = task.review?.reviewStatus
  if (EDITABLE_STATUSES.has(status)) return true
  if (reviewStatus != null && EDITABLE_REVIEW_STATUSES.has(reviewStatus)) return true
  return false
}
