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
export const RECEIVE_REVIEW_NEEDED_TASKS = 'RECEIVE_REVIEW_NEEDED_TASKS'

// redux action creators

/**
 * Add or replace the review needed tasks in the redux store
 */
export const receiveReviewNeededTasks = function(tasks,
                                            status=RequestStatus.success,
                                            fetchId, totalCount) {
  return {
    type: RECEIVE_REVIEW_NEEDED_TASKS,
    status,
    tasks,
    fetchId,
    totalCount,
    receivedAt: Date.now(),
  }
}

// async action creators

/**
 * Retrieve all tasks (up to the given limit) that need to be reviewed
 */
export const fetchReviewNeededTasks = function(criteria, limit=50) {
  const sortBy = _get(criteria, 'sortCriteria.sortBy')
  const order = (_get(criteria, 'sortCriteria.direction') || 'DESC').toUpperCase()
  const sort = sortBy ? _snakeCase(sortBy) : null
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
  if (filters.status && filters.status !== "all") {
    searchParameters.tStatus = filters.status
  }

  return function(dispatch) {
    const fetchId = _uniqueId()
    dispatch(receiveReviewNeededTasks(null, RequestStatus.inProgress, fetchId))
    return new Endpoint(
      api.tasks.review,
      {
        schema: {tasks: [taskSchema()]},
        variables: {},
        params: {limit, sort, order, page: (page * limit), ...searchParameters},
      }
    ).execute().then(normalizedResults => {
      var tasks = _values(_get(normalizedResults, 'entities.tasks', {}))
      if (sortBy) {
        tasks = _sortBy(tasks, (t) => t[sortBy])
        if (order === "DESC") {
          tasks = _reverse(tasks)
        }
      }
      dispatch(receiveReviewNeededTasks(tasks, RequestStatus.success, fetchId,
                                        normalizedResults.result.total))
      return tasks
    }).catch((error) => {
      dispatch(receiveReviewNeededTasks([], RequestStatus.error, fetchId))
      dispatch(addError(AppErrors.reviewTask.fetchFailure))
      console.log(error.response || error)
    })
  }
}

// redux reducers
export const currentReviewNeededTasks = function(state={}, action) {
  if (action.type === RECEIVE_REVIEW_NEEDED_TASKS) {
    const currentFetch = parseInt(_get(state, 'fetchId', 0), 10)

    if (parseInt(action.fetchId, 10) >= currentFetch) {
      const updatedTasks = {
        fetchId: action.fetchId
      }

      if (action.status === RequestStatus.inProgress) {
        updatedTasks.tasks = state.tasks
        updatedTasks.loading = true
        updatedTasks.totalCount = state.totalCount
      }
      else {
        updatedTasks.tasks = _isArray(action.tasks) ? action.tasks : []
        updatedTasks.loading = false
        updatedTasks.totalCount = action.totalCount
      }

      state.reviewNeeded = updatedTasks
      return state
    }
    else {
      return state
    }
  }
  else {
    return state
  }
}
