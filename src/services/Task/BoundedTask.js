import { defaultRoutes as api } from '../Server/Server'
import Endpoint from '../Server/Endpoint'
import RequestStatus from '../Server/RequestStatus'
import { toLatLngBounds } from '../MapBounds/MapBounds'
import { taskSchema } from './Task'
import { addError } from '../Error/Error'
import AppErrors from '../Error/AppErrors'
import _get from 'lodash/get'
import _values from 'lodash/values'
import _isArray from 'lodash/isArray'
import _uniqueId from 'lodash/uniqueId'

// redux actions
const RECEIVE_BOUNDED_TASKS = 'RECEIVE_BOUNDED_TASKS'

// redux action creators

/**
 * Add or replace the map-bounded tasks in the redux store
 */
export const receiveBoundedTasks = function(tasks,
                                            status=RequestStatus.success,
                                            fetchId) {
  return {
    type: RECEIVE_BOUNDED_TASKS,
    status,
    tasks,
    fetchId,
    receivedAt: Date.now(),
  }
}

// async action creators

/**
 * Retrieve all tasks (up to the given limit) within the given bounding box
 */
export const fetchBoundedTasks = function(bounds, limit=50) {
  const normalizedBounds = toLatLngBounds(bounds)

  return function(dispatch) {
    const fetchId = _uniqueId()
    dispatch(receiveBoundedTasks(null, RequestStatus.inProgress, fetchId))

    return new Endpoint(
      api.tasks.withinBounds,
      {
        schema: [ taskSchema() ],
        variables: {
          left: normalizedBounds.getWest(),
          bottom: normalizedBounds.getSouth(),
          right: normalizedBounds.getEast(),
          top: normalizedBounds.getNorth(),
        },
        params: {limit},
      }
    ).execute().then(normalizedResults => {
      const tasks = _values(_get(normalizedResults, 'entities.tasks', {}))
      dispatch(receiveBoundedTasks(tasks, RequestStatus.success, fetchId))
      return tasks
    }).catch((error) => {
      dispatch(receiveBoundedTasks([], RequestStatus.error, fetchId))
      dispatch(addError(AppErrors.boundedTask.fetchFailure))
      console.log(error.response || error)
    })
  }
}

// redux reducers
export const currentBoundedTasks = function(state={}, action) {
  if (action.type === RECEIVE_BOUNDED_TASKS) {
    // Only update the state if this represents either a later fetch
    // of data or an update to the current data in the store.
    const currentFetch = parseInt(_get(state, 'fetchId', 0), 10)

    if (parseInt(action.fetchId, 10) >= currentFetch) {
      const updatedTasks = {
        fetchId: action.fetchId,
      }

      if (action.status === RequestStatus.inProgress) {
        // Don't overwrite old tasks for in-progress fetches, as they're probably
        // still at least partially relevant as the user pans/zooms the map.
        updatedTasks.tasks = state.tasks
        updatedTasks.loading = true
      }
      else {
        updatedTasks.tasks = _isArray(action.tasks) ? action.tasks : []
        updatedTasks.loading = false
      }

      return updatedTasks
    }
    else {
      return state
    }
  }
  else {
    return state
  }
}
