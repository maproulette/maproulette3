import uuidv1 from 'uuid/v1'
import uuidTime from 'uuid-time'
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
import _map from 'lodash/map'
import { generateSearchParametersString } from '../Search/Search'

// redux actions
const RECEIVE_BOUNDED_TASKS = 'RECEIVE_BOUNDED_TASKS'

// redux action creators

/**
 * Add or replace the map-bounded tasks in the redux store
 */
export const receiveBoundedTasks = function(tasks,
                                            status=RequestStatus.success,
                                            fetchId,
                                            totalCount=null) {
  return {
    type: RECEIVE_BOUNDED_TASKS,
    status,
    tasks,
    fetchId,
    totalCount,
    receivedAt: Date.now(),
  }
}

// async action creators

/**
 * Retrieve all tasks (up to the given limit) matching the given search
 * criteria, which should at least include a boundingBox field, and may
 * optionally include a filters field with additional constraints
 */
export const fetchBoundedTasks = function(criteria, limit=50, skipDispatch=false, excludeLocked=true) {
  return function(dispatch) {
    const normalizedBounds = toLatLngBounds(criteria.boundingBox)
    if (!normalizedBounds) {
      return null
    }

    const page = _get(criteria, 'page', 0)
    const sortBy = _get(criteria, 'sortCriteria.sortBy')
    const direction = (_get(criteria, 'sortCriteria.direction') || 'ASC').toUpperCase()

    const searchParameters = generateSearchParametersString(_get(criteria, 'filters', {}),
                                                            null,
                                                            _get(criteria, 'savedChallengesOnly'))

    const fetchId = uuidv1()
    !skipDispatch && dispatch(receiveBoundedTasks(null, RequestStatus.inProgress, fetchId))

    return new Endpoint(
      api.tasks.withinBounds, {
        schema: {tasks: [taskSchema()]},
        variables: {
          left: normalizedBounds.getWest(),
          bottom: normalizedBounds.getSouth(),
          right: normalizedBounds.getEast(),
          top: normalizedBounds.getNorth(),
        },
        params: {limit, page: (page * limit), sort: sortBy, order: direction,
                 includeTotal: true, excludeLocked, ...searchParameters},
      }
    ).execute().then(normalizedResults => {
      const totalCount = normalizedResults.result.total

      let tasks = _values(_get(normalizedResults, 'entities.tasks', {}))
      tasks = _map(tasks, task =>
        Object.assign(task, {}, task.pointReview)
      )

      !skipDispatch && dispatch(receiveBoundedTasks(tasks, RequestStatus.success, fetchId, totalCount))

      return {tasks, totalCount}
    }).catch(error => {      
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
    if (action.fetchId !== state.fetchId || action.status !== state.status) {
      const fetchTime = parseInt(uuidTime.v1(action.fetchId))
      const lastFetch = state.fetchId ? parseInt(uuidTime.v1(state.fetchId)) : 0

      if (fetchTime >= lastFetch) {
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
          updatedTasks.totalCount = action.totalCount
        }

        return updatedTasks
      }
    }

    return state
  }
  else {
    return state
  }
}
