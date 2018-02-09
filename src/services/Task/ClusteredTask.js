import { defaultRoutes as api } from '../Server/Server'
import Endpoint from '../Server/Endpoint'
import RequestStatus from '../Server/RequestStatus'
import { taskSchema } from './Task'
import { buildError, addError } from '../Error/Error'
import _get from 'lodash/get'
import _each from 'lodash/each'
import _values from 'lodash/values'
import _isArray from 'lodash/isArray'
import _uniqueId from 'lodash/uniqueId'

// redux actions
const RECEIVE_CLUSTERED_TASKS = 'RECEIVE_CLUSTERED_TASKS'
const CLEAR_CLUSTERED_TASKS = 'CLEAR_CLUSTERED_TASKS'

// redux action creators

/**
 * Add or replace the clustered tasks in the redux store
 */
export const receiveClusteredTasks = function(challengeId,
                                              tasks,
                                              status=RequestStatus.success,
                                              fetchId) {
  return {
    type: RECEIVE_CLUSTERED_TASKS,
    status,
    challengeId,
    tasks,
    fetchId,
    receivedAt: Date.now(),
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
export const fetchClusteredTasks = function(challengeId) {
  return function(dispatch) {
    const fetchId = _uniqueId()
    dispatch(receiveClusteredTasks(challengeId, [], RequestStatus.inProgress, fetchId))

    return new Endpoint(
      api.challenge.clusteredTasks,
      {schema: [ taskSchema() ], variables: {id: challengeId}}
    ).execute().then(normalizedResults => {
      // Add parent field
      const tasks = _values(_get(normalizedResults, 'entities.tasks', {}))
      _each(tasks, task => task.parent = challengeId)

      dispatch(receiveClusteredTasks(challengeId, tasks, RequestStatus.success, fetchId))
      return tasks
    }).catch((error) => {
      dispatch(receiveClusteredTasks(challengeId, [], RequestStatus.error, fetchId))
      dispatch(addError(buildError(
        "ClusteredTask.fetchFailure", "Unable to fetch task clusters"
      )))

      console.log(error.response || error)
    })
  }
}

// redux reducers
export const currentClusteredTasks = function(state={}, action) {
  if (action.type === RECEIVE_CLUSTERED_TASKS) {
    // Only update the state if this represents either a later fetch
    // of data or an update to the current data in the store.
    const currentFetch = parseInt(_get(state, 'fetchId', 0), 10)

    if (parseInt(action.fetchId, 10) >= currentFetch) {
      return {
        challengeId: action.challengeId,
        loading: action.status === RequestStatus.inProgress,
        tasks: _isArray(action.tasks) ? action.tasks : [],
        fetchId: action.fetchId,
      }
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
