import { defaultRoutes as api } from '../Server/Server'
import Endpoint from '../Server/Endpoint'
import RequestStatus from '../Server/RequestStatus'
import { taskSchema } from './Task'
import { addError } from '../Error/Error'
import AppErrors from '../Error/AppErrors'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _each from 'lodash/each'
import _values from 'lodash/values'
import _isArray from 'lodash/isArray'
import _uniqueId from 'lodash/uniqueId'
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
                                              mergeTasks=false) {
  return {
    type: RECEIVE_CLUSTERED_TASKS,
    status,
    challengeId,
    isVirtualChallenge,
    tasks,
    fetchId,
    receivedAt: Date.now(),
    mergeTasks,
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
 * Retrieve clustered task data belonging to the given challenge
 */
export const fetchClusteredTasks = function(challengeId, isVirtualChallenge=false, statuses=[], limit=15000, mergeTasks=false) {
  return function(dispatch) {
    const fetchId = _uniqueId()
    dispatch(receiveClusteredTasks(
      challengeId, isVirtualChallenge, [], RequestStatus.inProgress, fetchId
    ))

    return new Endpoint(
      (isVirtualChallenge ? api.virtualChallenge : api.challenge).clusteredTasks, {
        schema: [ taskSchema() ],
        variables: {id: challengeId},
        params: {limit, filter: statuses.join(',')},
      }
    ).execute().then(normalizedResults => {
      // Add parent field, and copy pointReview fields to top-level for
      // backward compatibility
      let tasks = _values(_get(normalizedResults, 'entities.tasks', {}))
      tasks = _map(tasks, task =>
        Object.assign(task, {parent: challengeId}, task.pointReview)
      )

      dispatch(receiveClusteredTasks(
        challengeId, isVirtualChallenge, tasks, RequestStatus.success, fetchId, mergeTasks
      ))

      return tasks
    }).catch((error) => {
      dispatch(receiveClusteredTasks(
        challengeId, isVirtualChallenge, [], RequestStatus.error, fetchId
      ))
      dispatch(addError(AppErrors.clusteredTask.fetchFailure))
      console.log(error.response || error)
    })
  }
}

/**
 * Augment clustered task data with a bounded task fetch for the given
 * challenge (see fetchBoundedTasks for details), merging returned tasks with
 * the existing clustered task data. This can be useful for large challenges
 * -- that may have run up against limits when cluster data was originally
 * fetched -- when its necessary to ensure tasks in a bbox are included in the
 * clustered tasks
 */
export const augmentClusteredTasks = function(challengeId, isVirtualChallenge=false, criteria, limit=15000) {
  return function(dispatch) {
    if (isVirtualChallenge) {
      return
    }

    const fetchId = _uniqueId()
    const augmentedCriteria = _cloneDeep(criteria)
    _set(augmentedCriteria, 'filters.challengeId', challengeId)
    return fetchBoundedTasks(augmentedCriteria, limit, true)(dispatch).then(tasks => {
      // Add parent field
      _each(tasks, task => task.parent = challengeId)

      dispatch(receiveClusteredTasks(
        challengeId, isVirtualChallenge, tasks, RequestStatus.success, fetchId, true
      ))
    })
  }
}


// redux reducers
export const currentClusteredTasks = function(state={}, action) {
  if (action.type === RECEIVE_CLUSTERED_TASKS) {
    // Only update the state if this represents either a later fetch
    // of data or an update to the current data in the store.
    const currentFetch = parseInt(_get(state, 'fetchId', 0), 10)

    if (parseInt(action.fetchId, 10) >= currentFetch || action.mergeTasks) {
      const merged = {
        challengeId: action.challengeId,
        isVirtualChallenge: action.isVirtualChallenge,
        loading: action.status === RequestStatus.inProgress,
        fetchId: action.fetchId,
        tasks: _isArray(action.tasks) ? action.tasks : []
      }

      // If a merge is requestd and the new clustered tasks are from the same
      // challenge, concat the new tasks to the existing ones
      if (action.mergeTasks &&
          state.challengeId === merged.challengeId &&
          state.isVirtualChallenge === merged.isVirtualChallenge &&
          state.tasks.length > 0) {
        merged.tasks = _uniqBy(state.tasks.concat(merged.tasks), 'id')
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
