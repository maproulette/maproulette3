import { taskComments } from './comments'
import { taskMultiple } from './multiple'
import { taskSingle } from './single'

export const task = {
  ...taskSingle,
  ...taskMultiple,
  ...taskComments,
}

// Re-export individual modules for direct imports
export { taskSingle, taskMultiple, taskComments }
