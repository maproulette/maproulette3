import { defaultRoutes as api } from '../../Server/Server'
import Endpoint from '../../Server/Endpoint'
import RequestStatus from '../../Server/RequestStatus'
import { taskSchema } from '.././Task'
import { addError } from '../../Error/Error'
import AppErrors from '../../Error/AppErrors'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _snakeCase from 'lodash/snakeCase'
import { generateSearchParametersString } from '../../Search/Search'

// redux actions
export const RECEIVE_REVIEWED_TASKS = 'RECEIVE_REVIEWED_TASKS'
export const RECEIVE_MAPPER_REVIEWED_TASKS = 'RECEIVE_MAPPER_REVIEWED_TASKS'
export const RECEIVE_REVIEWED_BY_USER_TASKS = 'RECEIVE_REVIEWED_BY_USER_TASKS'


/**
 * Add or replace the reviewed tasks in the redux store
 */
export const receiveReviewedTasks = function(tasks,
                                            type,
                                            status=RequestStatus.success,
                                            totalCount) {
  return {
    type: type,
    status,
    tasks,
    totalCount,
    receivedAt: Date.now(),
  }
}

// async action creators

/**
 * Retrieve all tasks (up to the given limit) that have been reviewed
 * by user or requested by user
 */
export const fetchReviewedTasks = function(userId, criteria, asReviewer=false, asMapper=false, limit=50) {
  const sortBy = _get(criteria, 'sortCriteria.sortBy')
  const order = (_get(criteria, 'sortCriteria.direction') || 'DESC').toUpperCase()
  const sort = sortBy ? _snakeCase(sortBy) : null
  const page = _get(criteria, 'page', 0)

  const searchParameters = generateSearchParametersString(_get(criteria, 'filters', {}), criteria.boundingBox)
  const mappers = asMapper ? [userId] : []
  const reviewers = asReviewer ? [userId] : []

  let dispatchType = RECEIVE_REVIEWED_TASKS
  if (asReviewer) {
    dispatchType = RECEIVE_REVIEWED_BY_USER_TASKS
  }
  else if (asMapper) {
    dispatchType = RECEIVE_MAPPER_REVIEWED_TASKS
  }

  return function(dispatch) {
    dispatch(receiveReviewedTasks(null,
      dispatchType,
      RequestStatus.inProgress))
    return new Endpoint(
      api.tasks.reviewed,
      {
        schema: {tasks: [taskSchema()]},
        params: {mappers, reviewers, limit, sort, order, page: (page * limit),
                 allowReviewNeeded: (asReviewer ? false : true), ...searchParameters},
      }
    ).execute().then(normalizedResults => {
      const unsortedTaskMap = _get(normalizedResults, 'entities.tasks', {})
      const tasks = _map(normalizedResults.result.tasks, (id) => unsortedTaskMap[id])

      dispatch(receiveReviewedTasks(tasks, dispatchType,
        RequestStatus.success, normalizedResults.result.total))
      return tasks
    }).catch((error) => {
      dispatch(receiveReviewedTasks([], dispatchType,
        RequestStatus.error))
      dispatch(addError(AppErrors.reviewTask.fetchFailure))
      console.log(error.response || error)
    })
  }
}
