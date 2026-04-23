import { taskBulk } from './bulk'
import { taskComments } from './comments'
import { taskMultiple } from './multiple'
import { taskSingle } from './single'
import { taskTags } from './tags'

export const task = {
  ...taskSingle,
  ...taskMultiple,
  ...taskComments,
  ...taskTags,
  ...taskBulk,
}
