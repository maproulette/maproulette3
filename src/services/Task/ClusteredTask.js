import uuidv1 from 'uuid/v1'
import uuidTime from 'uuid-time'
import RequestStatus from '../Server/RequestStatus'
import _each from 'lodash/each'
import _isArray from 'lodash/isArray'
import _uniqBy from 'lodash/uniqBy'
import _cloneDeep from 'lodash/cloneDeep'
import _set from 'lodash/set'
import { fetchBoundedTasks } from './BoundedTask'

// redux actions
const RECEIVE_CLUSTERED_TASKS = 'RECEIVE_CLUSTERED_TASKS'
const CLEAR_CLUSTERED_TASKS = 'CLEAR_CLUSTERED_TASKS'

// redux action creators

/**
 * Add or replace the clustered tasks in the redux store
 */
export const receiveClusteredTasks = function(challengeId,
                                              isVirtualChallenge,
                                              tasks,
                                              status=RequestStatus.success,
                                              fetchId,
                                              mergeTasks=false,
                                              mergeOrIgnore=false,
                                              totalCount=null) {
  return {
    type: RECEIVE_CLUSTERED_TASKS,
    status,
    challengeId,
    isVirtualChallenge,
    tasks,
    fetchId,
    receivedAt: Date.now(),
    mergeTasks,
    mergeOrIgnore,
    totalCount
  }
}

/**
 * Clear the clustered tasks from the redux store
 */
export const clearClusteredTasks = function() {
  return {
    type: CLEAR_CLUSTERED_TASKS,
    receivedAt: Date.now()
  }
}


// async action creators

/**
 * Augment clustered task data with a bounded task fetch for the given
 * challenge (see fetchBoundedTasks for details), merging returned tasks with
 * the existing clustered task data. This can be useful for large challenges
 * -- that may have run up against limits when cluster data was originally
 * fetched -- when its necessary to ensure tasks in a bbox are included in the
 * clustered tasks
 */
export const augmentClusteredTasks = function(challengeId, isVirtualChallenge=false, criteria, limit=15000,
                                              mergeTasks=true) {
  return function(dispatch) {
    if (isVirtualChallenge) {
      return
    }

    const fetchId = uuidv1()
    const augmentedCriteria = _cloneDeep(criteria)
    _set(augmentedCriteria, 'filters.challengeId', challengeId)
    return fetchBoundedTasks(augmentedCriteria, limit, true)(dispatch).then(result => {
      if (result) {
        // Add parent field
        _each(result.tasks, task => task.parent = challengeId)

        return dispatch(receiveClusteredTasks(
          challengeId, isVirtualChallenge, result.tasks, RequestStatus.success, fetchId,
          mergeTasks, false, result.totalCount
        ))
      }
    })
  }
}


// redux reducers
export const currentClusteredTasks = function(state={}, action) {
  if (action.type === RECEIVE_CLUSTERED_TASKS) {
    // Only update the state if this represents either a later fetch
    // of data or an update to the current data in the store.
    const fetchTime = parseInt(uuidTime.v1(action.fetchId))
    const lastFetch = state.fetchId ? parseInt(uuidTime.v1(state.fetchId)) : 0

    if (fetchTime >= lastFetch || action.mergeTasks) {
      const merged = {
        challengeId: action.challengeId,
        isVirtualChallenge: action.isVirtualChallenge,
        loading: action.status === RequestStatus.inProgress,
        fetchId: action.fetchId,
        tasks: _isArray(action.tasks) ? action.tasks : [],
        totalCount: action.totalCount
      }

      // If a merge is requested and the new clustered tasks are from the same
      // challenge, concat the new tasks to the existing ones
      if (action.mergeTasks &&
          state.challengeId === merged.challengeId &&
          state.isVirtualChallenge === merged.isVirtualChallenge &&
          state.tasks.length > 0) {
        merged.tasks = _uniqBy(merged.tasks.concat(state.tasks), 'id')
        merged.totalCount = action.totalCount
      }
      else if (action.mergeOrIgnore) {
        // Ignore update if we can't merge it
        return state
      }

      return merged
    }
    else {
      return state
    }
  }
  else if (action.type === CLEAR_CLUSTERED_TASKS) {
    return {}
  }
  else {
    return state
  }
}
