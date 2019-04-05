import { RECEIVE_REVIEW_NEEDED_TASKS,
         currentReviewNeededTasks } from './TaskReviewNeeded'
import { RECEIVE_REVIEWED_TASKS,
         RECEIVE_REVIEWED_BY_USER_TASKS,
         currentReviewedTasks,
         currentReviewedByUserTasks } from './TaskReviewed'

import _get from 'lodash/get'
import _isArray from 'lodash/isArray'
import _cloneDeep from 'lodash/cloneDeep'
import RequestStatus from '../../Server/RequestStatus'

// redux reducers
export const currentReviewTasks = function(state={}, action) {
  switch(action.type) {
    case RECEIVE_REVIEWED_TASKS:
      return updateReduxState(state, action, "reviewed")
    case RECEIVE_REVIEWED_BY_USER_TASKS:
      return updateReduxState(state, action, "reviewedByUser")
    case RECEIVE_REVIEW_NEEDED_TASKS:
      return updateReduxState(state, action, "reviewNeeded")
    default:
      return state
  }
}

const updateReduxState = function(state={}, action, listName) {
  const currentFetch = parseInt(_get(state, 'fetchId', 0), 10)

  if (parseInt(action.fetchId, 10) >= currentFetch &&
      action.status === RequestStatus.success) {

    const updatedTasks = {
      fetchId: action.fetchId
    }
    const mergedState = _cloneDeep(state)

    updatedTasks.tasks = _isArray(action.tasks) ? action.tasks : []
    updatedTasks.totalCount = action.totalCount

    mergedState[listName] = updatedTasks
    return mergedState
  }
  else {
    return state
  }
}
