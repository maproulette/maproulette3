import _snakeCase from 'lodash/snakeCase'
import _map from 'lodash/map'
import { defaultRoutes as api } from '../../Server/Server'
import Endpoint from '../../Server/Endpoint'
import RequestStatus from '../../Server/RequestStatus'
import { generateSearchParametersString } from '../../Search/Search'
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
                                                 totalCount) {
  return {
    type: RECEIVE_REVIEW_NEEDED_TASKS,
    status,
    tasks,
    totalCount,
    receivedAt: Date.now(),
  }
}

// async action creators

/**
 * Retrieve all tasks (up to the given limit) that need to be reviewed
 */
export const fetchReviewNeededTasks = function(criteria, limit=50) {
  const sortBy = criteria?.sortCriteria?.sortBy
  const order = ((criteria?.sortCriteria?.direction) || 'DESC').toUpperCase()
  const sort = sortBy ? _snakeCase(sortBy) : null
  const page = criteria?.page ?? 0
  const searchParameters = generateSearchParametersString(criteria?.filters ?? {},
                                                          criteria.boundingBox,
                                                          criteria?.savedChallengesOnly,
                                                          criteria?.excludeOtherReviewers,
                                                          null,
                                                          criteria?.invertFields ?? {})
  const includeTags = criteria.includeTags

  return function(dispatch) {
    return new Endpoint(
      api.tasks.review,
      {
        schema: {tasks: [taskSchema()]},
        variables: {},
        params: {limit, sort, order, page, ...searchParameters,
                 includeTags},
      }
    ).execute().then(normalizedResults => {
      const unsortedTaskMap = normalizedResults?.entities?.tasks ?? {}
      const tasks = _map(normalizedResults.result.tasks, (id) => unsortedTaskMap[id])
      dispatch(receiveReviewNeededTasks(tasks, RequestStatus.success,
                                        normalizedResults.result.total))
      return tasks
    }).catch((error) => {
      dispatch(receiveReviewNeededTasks([], RequestStatus.error))
      dispatch(addError(AppErrors.reviewTask.fetchFailure))
      console.log(error.response || error)
    });
  };
}
