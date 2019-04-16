import _get from 'lodash/get'
import _values from 'lodash/values'
import _uniqueId from 'lodash/uniqueId'
import _sortBy from 'lodash/sortBy'
import _reverse from 'lodash/reverse'
import _snakeCase from 'lodash/snakeCase'
import format from 'date-fns/format'
import { defaultRoutes as api } from '../../Server/Server'
import Endpoint from '../../Server/Endpoint'
import RequestStatus from '../../Server/RequestStatus'
import { taskSchema } from '.././Task'
import { addError } from '../../Error/Error'
import AppErrors from '../../Error/AppErrors'

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
  if (filters.reviewStatus && filters.reviewStatus !== "all") {
    searchParameters.trStatus = filters.reviewStatus
  }
  if (filters.reviewedAt) {
    searchParameters.startDate = format(filters.reviewedAt, 'YYYY-MM-DD')
    searchParameters.endDate = format(filters.reviewedAt, 'YYYY-MM-DD')
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
