import { TaskStatus } from '../TaskStatus/TaskStatus'
import _fromPairs from 'lodash/fromPairs'
import _map from 'lodash/map'
import _keys from 'lodash/keys'

export const TaskAction = Object.freeze({
  alreadyFixed: "alreadyFixed",
  answered: "answered",
  available: "available",
  deleted: "deleted",
  falsePositive: "falsePositive",
  fixed: "fixed",
  skipped: "skipped",
  tooHard: "tooHard"
})

/**
 * Returns an actions object with everything zeroed-out to represent that there
 * are no actions.
 */
export const zeroTaskActions = function() {
  const actions =
    _fromPairs(_map(_keys(TaskStatus), statusName => [statusName, 0]))
  actions.total = 0
  actions.available = 0

  return actions
}
