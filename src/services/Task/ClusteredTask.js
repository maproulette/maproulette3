import { defaultRoutes as api } from '../Server/Server'
import Endpoint from '../Server/Endpoint'
import RequestStatus from '../Server/RequestStatus'
import { taskSchema } from './Task'
import { addError } from '../Error/Error'
import AppErrors from '../Error/AppErrors'
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
                                              isVirtualChallenge,
                                              tasks,
                                              status=RequestStatus.success,
                                              fetchId) {
  return {
    type: RECEIVE_CLUSTERED_TASKS,
    status,
    challengeId,
    isVirtualChallenge,
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
export const fetchClusteredTasks = function(challengeId, isVirtualChallenge=false, limit=15000) {
  return function(dispatch) {
    const fetchId = _uniqueId()
    dispatch(receiveClusteredTasks(
      challengeId, isVirtualChallenge, [], RequestStatus.inProgress, fetchId
    ))

    return new Endpoint(
      (isVirtualChallenge ? api.virtualChallenge : api.challenge).clusteredTasks, {
        schema: [ taskSchema() ],
        variables: {id: challengeId},
        params: {limit},
      }
    ).execute().then(normalizedResults => {
      // Add parent field
      const tasks = _values(_get(normalizedResults, 'entities.tasks', {}))
      _each(tasks, task => task.parent = challengeId)

      dispatch(receiveClusteredTasks(
        challengeId, isVirtualChallenge, tasks, RequestStatus.success, fetchId
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

// redux reducers
export const currentClusteredTasks = function(state={}, action) {
  if (action.type === RECEIVE_CLUSTERED_TASKS) {
    // Only update the state if this represents either a later fetch
    // of data or an update to the current data in the store.
    const currentFetch = parseInt(_get(state, 'fetchId', 0), 10)

    if (parseInt(action.fetchId, 10) >= currentFetch) {
      return {
        challengeId: action.challengeId,
        isVirtualChallenge: action.isVirtualChallenge,
        loading: action.status === RequestStatus.inProgress,
        fetchId: action.fetchId,
        tasks: _isArray(action.tasks) ? action.tasks : []
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
