// These statuses are defined on the server
export const TASK_ACTION_COMMENT = 0
export const TASK_ACTION_STATUS = 1
export const TASK_ACTION_REVIEW = 2
export const TASK_ACTION_UPDATE = 3
export const TASK_ACTION_META_REVIEW = 4

export const TaskHistoryAction = Object.freeze({
  comment: TASK_ACTION_COMMENT,
  status: TASK_ACTION_STATUS,
  review: TASK_ACTION_REVIEW,
  update: TASK_ACTION_UPDATE,
  metaReview: TASK_ACTION_META_REVIEW,
})
