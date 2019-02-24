import { defaultRoutes as api } from '../../Server/Server'
import Endpoint from '../../Server/Endpoint'
import RequestStatus from '../../Server/RequestStatus'
import { taskSchema } from '.././Task'
import { addError } from '../../Error/Error'
import AppErrors from '../../Error/AppErrors'
import _get from 'lodash/get'
import _values from 'lodash/values'
import _isArray from 'lodash/isArray'
import _uniqueId from 'lodash/uniqueId'
import _sortBy from 'lodash/sortBy'
import _reverse from 'lodash/reverse'
import _snakeCase from 'lodash/snakeCase'

// redux actions
const RECEIVE_REVIEWED_TASKS = 'RECEIVE_REVIEWED_TASKS'
const RECEIVE_REVIEWED_BY_USER_TASKS = 'RECEIVE_REVIEWED_BY_USER_TASKS'

// redux action creators

/**
 * Add or replace the reviewed tasks in the redux store
 */
export const receiveReviewedTasks = function(tasks,
                                            type,
                                            status=RequestStatus.success,
                                            fetchId,
                                            totalCount) {
  return {
    type: type,
    status,
    tasks,
    fetchId,
    totalCount,
    receivedAt: Date.now(),
  }
}

// async action creators

/**
 * Retrieve all tasks (up to the given limit) that have been reviewed
 * by user or requested by user
 */
export const fetchReviewedTasks = function(criteria, asReviewer, limit=50) {
  const sortBy = _get(criteria, 'sortCriteria.sortBy')
  const order = (_get(criteria, 'sortCriteria.direction') || 'DESC').toUpperCase()
  const sort = sortBy ? `${_snakeCase(sortBy)}` : null
  const page = _get(criteria, 'page', 0)
  const filters = _get(criteria, 'filters', {})

  const searchParameters = {}
  if (filters.reviewRequestedBy) {
    searchParameters.o = filters.reviewRequestedBy
  }
  if (filters.reviewedBy) {
    searchParameters.r = filters.reviewedBy
  }
  if (filters.challenge) {
    searchParameters.cs = filters.challenge
  }

  return function(dispatch) {
    const fetchId = _uniqueId()
    console.log("Dispatching fetchReviewedTasks with fetchId: " + fetchId)
    dispatch(receiveReviewedTasks(null,
      asReviewer ? RECEIVE_REVIEWED_BY_USER_TASKS: RECEIVE_REVIEWED_TASKS,
      RequestStatus.inProgress, fetchId))
    return new Endpoint(
      api.tasks.reviewed,
      {
        schema: {tasks: [taskSchema()]},
        params: {asReviewer, limit, sort, order, page: (page * limit), ...searchParameters},
      }
    ).execute().then(normalizedResults => {
      var tasks = _values(_get(normalizedResults, 'entities.tasks', {}))
      if (sortBy) {
        tasks = _sortBy(tasks, (t) => t[sortBy])
        if (order === "DESC") {
          tasks = _reverse(tasks)
        }
      }

      dispatch(receiveReviewedTasks(tasks,
        asReviewer ? RECEIVE_REVIEWED_BY_USER_TASKS: RECEIVE_REVIEWED_TASKS,
        RequestStatus.success, fetchId, normalizedResults.result.total))
      return tasks
    }).catch((error) => {
      dispatch(receiveReviewedTasks([],
        asReviewer ? RECEIVE_REVIEWED_BY_USER_TASKS: RECEIVE_REVIEWED_TASKS,
        RequestStatus.error, fetchId))
      dispatch(addError(AppErrors.reviewTask.fetchFailure))
      console.log(error.response || error)
    })
  }
}

// redux reducers
export const currentReviewedByUserTasks = function(state={}, action) {
  if (action.type === RECEIVE_REVIEWED_BY_USER_TASKS) {
    return updateReduxState(state, action)
  }
  else {
    return state
  }
}

export const currentReviewedTasks = function(state={}, action) {
  if (action.type === RECEIVE_REVIEWED_TASKS) {
    return updateReduxState(state, action)
  }
  else {
    return state
  }
}

const updateReduxState = function(state={}, action) {
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
      updatedTasks.totalCount = state.totalCount
    }
    else {
      updatedTasks.tasks = _isArray(action.tasks) ? action.tasks : []
      updatedTasks.loading = false
      updatedTasks.totalCount = action.totalCount
    }
    return updatedTasks
  }
  else {
    return state
  }
}
