export const TASK_PRIORITY_LABELS: Record<number, string> = {
  0: 'High',
  1: 'Medium',
  2: 'Low',
}

// Catalog ids for the labels above — the labels themselves stay as fallback
// defaults so `t()` still has an English default for Transifex.
export const TASK_PRIORITY_LABEL_IDS: Record<number, string> = {
  0: 'manageChallengeDetail.tasksExplorer.priorityHigh',
  1: 'manageChallengeDetail.tasksExplorer.priorityMedium',
  2: 'manageChallengeDetail.tasksExplorer.priorityLow',
}

export const SORT_FIELDS = [
  { value: 'id', label: 'ID' },
  { value: 'status', label: 'Status' },
  { value: 'priority', label: 'Priority' },
] as const

export const SORT_FIELD_LABEL_IDS: Record<(typeof SORT_FIELDS)[number]['value'], string> = {
  id: 'manageChallengeDetail.tasksExplorer.sortFieldId',
  status: 'manageChallengeDetail.tasksExplorer.sortFieldStatus',
  priority: 'manageChallengeDetail.tasksExplorer.sortFieldPriority',
}

export type SortField = (typeof SORT_FIELDS)[number]['value']

export const BATCH_SIZE = 50
