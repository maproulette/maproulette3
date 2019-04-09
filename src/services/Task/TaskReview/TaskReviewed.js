import { defaultRoutes as api } from '../../Server/Server'
import Endpoint from '../../Server/Endpoint'
import RequestStatus from '../../Server/RequestStatus'
import { taskSchema } from '.././Task'
import { addError } from '../../Error/Error'
import AppErrors from '../../Error/AppErrors'
import _get from 'lodash/get'
import _values from 'lodash/values'
import _uniqueId from 'lodash/uniqueId'
import _sortBy from 'lodash/sortBy'
import _reverse from 'lodash/reverse'
import _snakeCase from 'lodash/snakeCase'
import format from 'date-fns/format'

// redux actions
export const RECEIVE_REVIEWED_TASKS = 'RECEIVE_REVIEWED_TASKS'
export const RECEIVE_REVIEWED_BY_USER_TASKS = 'RECEIVE_REVIEWED_BY_USER_TASKS'

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
  if (filters.reviewedAt) {
    searchParameters.startDate = format(filters.reviewedAt, 'YYYY-MM-DD')
    searchParameters.endDate = format(filters.reviewedAt, 'YYYY-MM-DD')
  }

  return function(dispatch) {
    const fetchId = _uniqueId()
    dispatch(receiveReviewedTasks(null,
      asReviewer ? RECEIVE_REVIEWED_BY_USER_TASKS: RECEIVE_REVIEWED_TASKS,
      RequestStatus.inProgress, fetchId))
    return new Endpoint(
      api.tasks.reviewed,
      {
        schema: {tasks: [taskSchema()]},
        params: {asReviewer, limit, sort, order, page: (page * limit),
                 allowReviewNeeded: (asReviewer ? false : true), ...searchParameters},
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
        asReviewer ? RECEIVE_REVIEWED_BY_USER_TASKS : RECEIVE_REVIEWED_TASKS,
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
