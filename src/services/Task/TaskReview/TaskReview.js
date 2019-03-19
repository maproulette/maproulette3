import _get from 'lodash/get'
import _set from 'lodash/set'
import _isArray from 'lodash/isArray'
import _cloneDeep from 'lodash/cloneDeep'
import { RECEIVE_REVIEW_NEEDED_TASKS } from './TaskReviewNeeded'
import { RECEIVE_REVIEWED_TASKS,
         RECEIVE_REVIEWED_BY_USER_TASKS } from './TaskReviewed'
import RequestStatus from '../../Server/RequestStatus'

export const MARK_REVIEW_DATA_STALE = "MARK_REVIEW_DATA_STALE"

// redux action creators

/**
 * Mark the current review data as stale, meaning the app has been
 * informed or detected that updated task-review data is available
 * from the server
 */
export const markReviewDataStale = function() {
  return {
    type: MARK_REVIEW_DATA_STALE,
  }
}


// redux reducers
export const currentReviewTasks = function(state={}, action) {
  let updatedState = null

  switch(action.type) {
    case MARK_REVIEW_DATA_STALE:
      updatedState = _cloneDeep(state)
      _set(updatedState, 'reviewNeeded.dataStale', true)
      _set(updatedState, 'reviewed.dataStale', true)
      _set(updatedState, 'reviewedByUser.dataStale', true)
      return updatedState
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
    updatedTasks.dataStale = false

    mergedState[listName] = updatedTasks
    return mergedState
  }
  else {
    return state
  }
}
