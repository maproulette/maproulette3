import { v1 as uuidv1 } from 'uuid'
import uuidTime from 'uuid-time'
import _get from 'lodash/get'
import _set from 'lodash/set'
import _isArray from 'lodash/isArray'
import _cloneDeep from 'lodash/cloneDeep'
import _snakeCase from 'lodash/snakeCase'
import _isFinite from 'lodash/isFinite'
import _map from 'lodash/map'
import _values from 'lodash/values'
import queryString from 'query-string'
import Endpoint from '../../Server/Endpoint'
import { defaultRoutes as api, isSecurityError } from '../../Server/Server'
import { RECEIVE_REVIEW_NEEDED_TASKS } from './TaskReviewNeeded'
import { RECEIVE_REVIEWED_TASKS,
         RECEIVE_MAPPER_REVIEWED_TASKS,
         RECEIVE_REVIEWED_BY_USER_TASKS } from './TaskReviewed'
import RequestStatus from '../../Server/RequestStatus'
import { taskSchema, taskBundleSchema, retrieveChallengeTask,
         receiveTasks, fetchTask } from '../Task'
import { challengeSchema } from '../../Challenge/Challenge'
import { generateSearchParametersString } from '../../Search/Search'
import { addError } from '../../Error/Error'
import AppErrors from '../../Error/AppErrors'
import { ensureUserLoggedIn } from '../../User/User'


export const MARK_REVIEW_DATA_STALE = "MARK_REVIEW_DATA_STALE"

export const REVIEW_TASKS_TO_BE_REVIEWED = 'tasksToBeReviewed'
export const MY_REVIEWED_TASKS = 'myReviewedTasks'
export const REVIEW_TASKS_BY_ME = 'tasksReviewedByMe'
export const ALL_REVIEWED_TASKS = 'allReviewedTasks'
export const META_REVIEW_TASKS = 'metaReviewTasks'

export const ReviewTasksType = {
  toBeReviewed: REVIEW_TASKS_TO_BE_REVIEWED,
  myReviewedTasks: MY_REVIEWED_TASKS,
  reviewedByMe: REVIEW_TASKS_BY_ME,
  allReviewedTasks: ALL_REVIEWED_TASKS,
  metaReviewTasks: META_REVIEW_TASKS
}

// redux action creators
export const RECEIVE_REVIEW_METRICS = 'RECEIVE_REVIEW_METRICS'
export const RECEIVE_REVIEW_TAG_METRICS = 'RECEIVE_REVIEW_TAG_METRICS'
export const RECEIVE_REVIEW_CLUSTERS = 'RECEIVE_REVIEW_CLUSTERS'
export const RECEIVE_REVIEW_CHALLENGES = 'RECEIVE_REVIEW_CHALLENGES'
export const RECEIVE_REVIEW_PROJECTS = 'RECEIVE_REVIEW_PROJECTS'

const handleExposeError = (error, dispatch) => {
  dispatch(ensureUserLoggedIn()).then(async () => {
    const responseBody = await error.response.json();
    const message = responseBody.status === "Forbidden" ? { id: "Server", defaultMessage: responseBody.message } : AppErrors.user.unauthorized;
    dispatch(addError(message))
  })
}

/**
 * Mark the current review data as stale, meaning the app has been
 * informed or detected that updated task-review data is available
 * from the server
 */
export const markReviewDataStale = function() {
  return {
    type: MARK_REVIEW_DATA_STALE,
  }
}

/**
 * Add or replace the review metrics in the redux store
 */
export const receiveReviewMetrics = function(metrics, status=RequestStatus.success) {
  return {
    type: RECEIVE_REVIEW_METRICS,
    status,
    metrics,
    receivedAt: Date.now(),
  }
}

/**
 * Add or replace the review metrics in the redux store
 */
export const receiveReviewTagMetrics = function(tagMetrics, status=RequestStatus.success) {
  return {
    type: RECEIVE_REVIEW_TAG_METRICS,
    status,
    tagMetrics,
    receivedAt: Date.now(),
  }
}

/**
 * Add or replace the review clusters in the redux store
 */
export const receiveReviewClusters = function(clusters, status=RequestStatus.success, fetchId) {
  return {
    type: RECEIVE_REVIEW_CLUSTERS,
    status,
    clusters,
    receivedAt: Date.now(),
    fetchId
  }
}

/**
 * Add or replace the review challenges in the redux store
 */
export const receiveReviewChallenges = function(reviewChallenges, status=RequestStatus.success, fetchId) {
  return {
    type: RECEIVE_REVIEW_CHALLENGES,
    status,
    reviewChallenges,
    receivedAt: Date.now(),
    fetchId
  }
}

/**
 * Add or replace the review projects in the redux store
 */
export const receiveReviewProjects = function(reviewProjects, status=RequestStatus.success, fetchId) {
  return {
    type: RECEIVE_REVIEW_PROJECTS,
    status,
    reviewProjects,
    receivedAt: Date.now(),
    fetchId
  }
}

// utility functions
/**
 * Builds a link to export CSV
 */
export const buildLinkToMapperExportCSV = function(criteria) {
  const queryFilters = generateReviewSearch(criteria)

  return `${process.env.REACT_APP_MAP_ROULETTE_SERVER_URL}/api/v2/tasks/review/mappers/export?${queryString.stringify(queryFilters)}`
}

export const buildLinkToReviewerMetaExportCSV = function(criteria) {
  const queryFilters = generateReviewSearch(criteria)

  return `${process.env.REACT_APP_MAP_ROULETTE_SERVER_URL}/api/v2/tasks/metareview/reviewers/export?${queryString.stringify(queryFilters)}`
}

const generateReviewSearch = function(criteria = {}, reviewTasksType = ReviewTasksType.allReviewedTasks, userId)  {
  const searchParameters = generateSearchParametersString(_get(criteria, 'filters', {}),
                                                       criteria.boundingBox,
                                                       _get(criteria, 'savedChallengesOnly'),
                                                       _get(criteria, 'excludeOtherReviewers'),
                                                       null,
                                                       _get(criteria, 'invertFields', {}))

  const mappers = (reviewTasksType === ReviewTasksType.myReviewedTasks) ? [userId] : []
  const reviewers = (reviewTasksType === ReviewTasksType.reviewedByMe) ? [userId] : []

  return {...searchParameters, mappers, reviewers}
}

/**
 * Retrieve metrics for a given review tasks type and filter criteria
 */
 export const fetchReviewMetrics = function(userId, reviewTasksType, criteria) {
  const type = determineType(reviewTasksType)
  const params = generateReviewSearch(criteria, reviewTasksType, userId)

  return function(dispatch) {
    return new Endpoint(
      api.tasks.reviewMetrics,
      {
        params: {reviewTasksType: type, ...params,
                 includeByPriority: true, includeByTaskStatus: true},
      }
    ).execute().then(normalizedResults => {
      dispatch(receiveReviewMetrics(normalizedResults, RequestStatus.success))
      return normalizedResults
    }).catch((error) => {
      console.log(error.response || error)
    })
  }
}

/**
 * Retrieve metrics for a given review tasks type and filter criteria
 */
 export const fetchReviewTagMetrics = function(userId, reviewTasksType, criteria) {
  const type = determineType(reviewTasksType)
  const params = generateReviewSearch(criteria, reviewTasksType, userId)

  return function(dispatch) {
    return new Endpoint(
      api.tasks.reviewTagMetrics,
      {
        schema: null,
        params: {reviewTasksType: type, ...params},
      }
    ).execute().then(normalizedResults => {
      dispatch(receiveReviewTagMetrics(normalizedResults, RequestStatus.success))
      return normalizedResults
    }).catch((error) => {
      console.log(error.response || error)
    })
  }
}

/**
 * Retrieve clustered tasks for given review criteria
 */
export const fetchClusteredReviewTasks = function(reviewTasksType, criteria={}) {
  const searchParameters = generateSearchParametersString(_get(criteria, 'filters', {}),
                                                          criteria.boundingBox,
                                                          _get(criteria, 'savedChallengesOnly'),
                                                          _get(criteria, 'excludeOtherReviewers'),
                                                          null,
                                                          _get(criteria, 'invertFields', {}))
  return function(dispatch) {
    const type = determineType(reviewTasksType)
    const fetchId = uuidv1()

    dispatch(receiveReviewClusters({}, RequestStatus.inProgress, fetchId))
    return new Endpoint(
      api.tasks.fetchReviewClusters,
      {
        schema: {tasks: [taskSchema()]},
        params: {reviewTasksType: type, points: 25, ...searchParameters},
      }
    ).execute().then(normalizedResults => {
      if (normalizedResults.result) {
        dispatch(receiveReviewClusters(normalizedResults.result, RequestStatus.success, fetchId))
      }

      return normalizedResults.result
    }).catch((error) => {
      dispatch(receiveReviewClusters({}, RequestStatus.error, fetchId))
      console.log(error.response || error)
    })
  }
}

const determineType = (reviewTasksType) => {
  switch(reviewTasksType) {
    case ReviewTasksType.toBeReviewed:
      return 1
    case ReviewTasksType.reviewedByMe:
      return 2
    case ReviewTasksType.myReviewedTasks:
      return 3
    case ReviewTasksType.allReviewedTasks:
      return 4
    case ReviewTasksType.metaReviewTasks:
    default:
      return 5
  }
}

/*
 * Retrieve review tasks geographically closest to the given task (up to the given
 * limit). Returns an object in clusteredTasks format with the tasks and meta data.
 * Note that this does not add the results to the redux store, but simply returns them
 */
export const fetchNearbyReviewTasks = function(taskId, criteria={}, limit=5, asMetaReview=false) {
  return function(dispatch) {
    const searchParameters = generateSearchParametersString(_get(criteria, 'filters', {}),
                                                         criteria.boundingBox,
                                                         _get(criteria, 'savedChallengesOnly'),
                                                         _get(criteria, 'excludeOtherReviewers'),
                                                         null,
                                                         _get(criteria, 'invertFields', {}))

    const params = {limit, ...searchParameters, asMetaReview}

    return new Endpoint(
      api.tasks.nearbyReviewTasks,
      {
        schema: [ taskSchema() ],
        variables: {taskId},
        params,
      }
    ).execute().then(normalizedResults => ({
      loading: false,
      tasks: _map(_values(_get(normalizedResults, 'entities.tasks', {})), task => {
        if (task.location) {
          // match clusteredTasks response, which returns a point with lat/lng fields
          task.point = {
            lng: task.location.coordinates[0],
            lat: task.location.coordinates[1]
          }
        }
        return task
      })
    }))
  }
}


/**
 * Retrieve the next task to review with the given sort and filter criteria
 */
export const loadNextReviewTask = function(criteria={}, lastTaskId, asMetaReview) {
  const sortBy = _get(criteria, 'sortCriteria.sortBy')
  const order = (_get(criteria, 'sortCriteria.direction') || 'DESC').toUpperCase()
  const sort = sortBy ? `${_snakeCase(sortBy)}` : null
  const searchParameters = generateSearchParametersString(_get(criteria, 'filters', {}),
                                                       criteria.boundingBox,
                                                       _get(criteria, 'savedChallengesOnly'),
                                                       _get(criteria, 'excludeOtherReviewers'),
                                                       null,
                                                       _get(criteria, 'invertFields', {}))

  return function(dispatch) {
    const params = {sort, order, ...searchParameters, asMetaReview}
    if (_isFinite(lastTaskId)) {
      params.lastTaskId = lastTaskId
    }

    return retrieveChallengeTask(dispatch, new Endpoint(
      api.tasks.reviewNext,
      {
        schema: taskSchema(),
        variables: {},
        params,
      }
    ))
  }
}

/**
 * Fetch data for the given task and claim it for review.
 *
 * If info on available mapillary images for the task is also desired, set
 * includeMapillary to true
 */
export const fetchTaskForReview = function(taskId, includeMapillary=false) {
  return function(dispatch) {
    return new Endpoint(api.task.startReview, {
      schema: taskSchema(),
      variables: {id: taskId},
      params: {mapillary: includeMapillary}
    }).execute().then(normalizedResults => {
      dispatch(receiveTasks(normalizedResults.entities))
      return normalizedResults
    })
  }
}

/**
 * Remove the task review claim on this task.
 */
export const cancelReviewClaim = function(taskId) {
  return function(dispatch) {
    return new Endpoint(
      api.task.cancelReview, {schema: taskSchema(), variables: {id: taskId}}
    ).execute().then(normalizedResults => {
      // Server doesn't explicitly return empty fields from JSON.
      // This field should now be null so we will set it so when the
      // task data is merged with existing task data it will be correct.
      normalizedResults.entities.tasks[taskId].reviewClaimedBy = null
      dispatch(receiveTasks(normalizedResults.entities))
      return normalizedResults
    }).catch(error => {
      if (isSecurityError(error)) {
        dispatch(ensureUserLoggedIn()).then(() =>
          dispatch(addError(AppErrors.user.unauthorized))
        )
      }
      else {
        console.log(error.response || error)
      }
      fetchTask(taskId)(dispatch) // Fetch accurate task data
    })
  }
}

export const removeReviewRequest = function(challengeId, taskIds, criteria, excludeTaskIds, asMetaReview) {
  return function(dispatch) {
    const filters = _get(criteria, 'filters', {})
    const searchParameters = !criteria ? {} :
      generateSearchParametersString(filters,
                                     criteria.boundingBox,
                                     null,
                                     null,
                                     criteria.searchQuery,
                                     criteria.invertFields,
                                     excludeTaskIds)
    searchParameters.cid = challengeId
    if (taskIds) {
      searchParameters.ids = taskIds.join(',')
    }

    return new Endpoint(
      api.tasks.removeReviewRequest, {
        params: {...searchParameters, asMetaReview},
        json: filters.taskPropertySearch ?
          {taskPropertySearch: filters.taskPropertySearch} : null,
      }
    ).execute().catch(error => {
      if (isSecurityError(error)) {
        handleExposeError(error, dispatch)
      }
      else {
        dispatch(addError(AppErrors.task.updateFailure))
        console.log(error.response || error)
      }
    })
  }
}

/**
 *
 */
export const completeReview = function(taskId, taskReviewStatus, comment, tags, newTaskStatus, asMetaReview = false) {
  return function(dispatch) {
    return updateTaskReviewStatus(dispatch, taskId, taskReviewStatus, comment, tags, newTaskStatus, asMetaReview)
  }
}

export const completeBundleReview = function(bundleId, taskReviewStatus, comment, tags, newTaskStatus, asMetaReview=false) {
  return function(dispatch) {
    return new Endpoint(
      asMetaReview ? api.tasks.bundled.updateMetaReviewStatus :
                     api.tasks.bundled.updateReviewStatus, {
      schema: taskBundleSchema(),
      variables: {bundleId, status: taskReviewStatus},
      params:{comment, tags, newTaskStatus, asMetaReview},
    }).execute().catch(error => {
      if (isSecurityError(error)) {
        handleExposeError(error, dispatch)
      }
      else {
        dispatch(addError(AppErrors.task.updateFailure))
        console.log(error.response || error)
      }
    })
  }
}

/**
 * Fetches a list of challenges which have review tasks
 */
export const fetchReviewChallenges = function(reviewTasksType,
                                              includeTaskStatuses = null,
                                              excludeOtherReviewers = true) {
  return function(dispatch) {
    const type = determineType(reviewTasksType)

    const tStatus = includeTaskStatuses ? includeTaskStatuses.join(',') : ""

    return new Endpoint(
      api.challenges.withReviewTasks,
      {schema: [challengeSchema()],
       params:{reviewTasksType: type, excludeOtherReviewers, tStatus,
               limit: -1}}
    ).execute().then(normalizedResults => {
      dispatch(receiveReviewChallenges(normalizedResults.entities.challenges, RequestStatus.success))
      dispatch(receiveReviewProjects(normalizedResults.entities.projects, RequestStatus.success))

      return normalizedResults
    }).catch(error => {
      if (isSecurityError(error)) {
        dispatch(ensureUserLoggedIn()).then(() =>
          dispatch(addError(AppErrors.user.unauthorized))
        )
      }
      else {
        dispatch(addError(AppErrors.challenge.fetchFailure))
        console.log(error.response || error)
      }
    })
  }
}

const updateTaskReviewStatus = function(dispatch, taskId, newStatus, comment,
  tags, newTaskStatus, asMetaReview) {
  // Optimistically assume request will succeed. The store will be updated
  // with fresh task data from the server if the save encounters an error.
  dispatch(receiveTasks({
    tasks: {
      [taskId]: {
        id: taskId,
        reviewStatus: newStatus
      }
    }
  }))
  return new Endpoint(
    asMetaReview ?
      api.task.updateMetaReviewStatus : api.task.updateReviewStatus,
    {schema: taskSchema(),
     variables: {id: taskId, status: newStatus},
     params:{comment: comment, tags: tags, newTaskStatus: newTaskStatus}}
  ).execute().catch(error => {
    if (isSecurityError(error)) {
      handleExposeError(error, dispatch)
    }
    else {
      dispatch(addError(AppErrors.task.updateFailure))
      console.log(error.response || error)
    }
    fetchTask(taskId)(dispatch) // Fetch accurate task data
  })
}

// redux reducers
export const currentReviewTasks = function(state={}, action) {
  let updatedState = null

  switch(action.type) {
    case MARK_REVIEW_DATA_STALE:
      updatedState = _cloneDeep(state)
      _set(updatedState, 'reviewNeeded.dataStale', true)
      _set(updatedState, 'reviewed.dataStale', true)
      _set(updatedState, 'reviewedByUser.dataStale', true)
      return updatedState
    case RECEIVE_REVIEWED_TASKS:
      return updateReduxState(state, action, "reviewed")
    case RECEIVE_MAPPER_REVIEWED_TASKS:
      return updateReduxState(state, action, "mapperReviewed")
    case RECEIVE_REVIEWED_BY_USER_TASKS:
      return updateReduxState(state, action, "reviewedByUser")
    case RECEIVE_REVIEW_NEEDED_TASKS:
      return updateReduxState(state, action, "reviewNeeded")
    case RECEIVE_REVIEW_METRICS:
      return updateReduxState(state, action, "metrics")
    case RECEIVE_REVIEW_TAG_METRICS:
      return updateReduxState(state, action, "tagMetrics")
    case RECEIVE_REVIEW_CLUSTERS:
      return updateReduxState(state, action, "clusters")
    case RECEIVE_REVIEW_CHALLENGES:
      return updateReduxState(state, action, "reviewChallenges")
    case RECEIVE_REVIEW_PROJECTS:
      return updateReduxState(state, action, "reviewProjects")
    default:
      return state
  }
}

const updateReduxState = function(state={}, action, listName) {
  const mergedState = _cloneDeep(state)

  if (action.type === RECEIVE_REVIEW_METRICS) {
    mergedState[listName] = action.metrics
    return mergedState
  }

  if (action.type === RECEIVE_REVIEW_TAG_METRICS) {
    mergedState[listName] = action.tagMetrics
    return mergedState
  }

  if (action.type === RECEIVE_REVIEW_CLUSTERS) {
    if (action.fetchId !== state.fetchId || action.status !== state.status) {
      const fetchTime = parseInt(uuidTime.v1(action.fetchId))
      const lastFetch = state.fetchId ? parseInt(uuidTime.v1(state.fetchId)) : 0

      if (fetchTime >= lastFetch) {
        mergedState.fetchId = action.fetchId
        mergedState[listName] = action.clusters
      }
    }

    return mergedState
  }

  if (action.type === RECEIVE_REVIEW_CHALLENGES) {
    mergedState[listName] = action.reviewChallenges
    return mergedState
  }

  if (action.type === RECEIVE_REVIEW_PROJECTS) {
    mergedState[listName] = action.reviewProjects
    return mergedState
  }

  if (action.status === RequestStatus.success) {
    const updatedTasks = {}

    updatedTasks.tasks = _isArray(action.tasks) ? action.tasks : []
    updatedTasks.totalCount = action.totalCount
    updatedTasks.dataStale = false

    mergedState[listName] = updatedTasks
    return mergedState
  }
  else {
    return state
  }
}
