import { schema } from 'normalizr'
import _get from 'lodash/get'
import _pick from 'lodash/pick'
import _cloneDeep from 'lodash/cloneDeep'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _isEmpty from 'lodash/isEmpty'
import _isUndefined from 'lodash/isUndefined'
import _isString from 'lodash/isString'
import _isFinite from 'lodash/isFinite'
import _isArray from 'lodash/isArray'
import _isObject from 'lodash/isObject'
import _values from 'lodash/values'
import _snakeCase from 'lodash/snakeCase'
import { defaultRoutes as api, isSecurityError, websocketClient } from '../Server/Server'
import Endpoint from '../Server/Endpoint'
import RequestStatus from '../Server/RequestStatus'
import genericEntityReducer from '../Server/GenericEntityReducer'
import { challengeSchema } from '../Challenge/Challenge'
import { placeSchema, fetchPlace } from '../Place/Place'
import { commentSchema, receiveComments } from '../Comment/Comment'
import { addServerError, addError } from '../Error/Error'
import AppErrors from '../Error/AppErrors'
import { ensureUserLoggedIn } from '../User/User'
import { markReviewDataStale } from './TaskReview/TaskReview'

/** normalizr schema for tasks */
export const taskSchema = function() {
  return new schema.Entity('tasks')
}

/**
 * normalizr denormalization schema, which will pull in projects and places
 * (fetched separately, so not needed in normal schema)
 */
export const taskDenormalizationSchema = function() {
  return new schema.Entity('tasks', {
    parent: challengeSchema(),
    place: placeSchema(),
    comments: [ commentSchema() ]
  })
}

export const subscribeToReviewMessages = function(dispatch) {
  websocketClient.addServerSubscription(
    "reviews", null, "reviewMessageHandler",
    messageObject => onReviewMessage(dispatch, messageObject)
  )
}

export const unsubscribeFromReviewMessages = function() {
  websocketClient.removeServerSubscription("reviews", null, "reviewMessageHandler")
}

const onReviewMessage = function(dispatch, messageObject) {
  switch(messageObject.messageType) {
    case "review-new":
    case "review-claimed":
    case "review-update":
      // For now just mark the existing review data as stale
      dispatch(markReviewDataStale())
      break
    default:
      break // Ignore
  }
}


// redux actions
const RECEIVE_TASKS = 'RECEIVE_TASKS'
const REMOVE_TASK = 'REMOVE_TASK'

// redux action creators

/**
 * Add or update task data in the redux store
 */
export const receiveTasks = function(normalizedEntities) {
  return {
    type: RECEIVE_TASKS,
    status: RequestStatus.success,
    entities: normalizedEntities,
    receivedAt: Date.now()
  }
}

/**
 * Remove a task from the redux store
 */
export const removeTask = function(taskId) {
  return {
    type: REMOVE_TASK,
    taskId,
    receivedAt: Date.now()
  }
}

// async action creators

/**
 * Fetch data for the given task. Normally that data will be added to the redux
 * store, but that can be suppressed with the supressReceive flag.
 *
 * If info on available mapillary images for the task is also desired, set
 * includeMapillary to true
 */
export const fetchTask = function(taskId, suppressReceive=false, includeMapillary=false) {
  return function(dispatch) {
    return new Endpoint(api.task.single, {
      schema: taskSchema(),
      variables: {id: taskId},
      params: {mapillary: includeMapillary}
    }).execute().then(normalizedResults => {
      if (!suppressReceive) {
        dispatch(receiveTasks(normalizedResults.entities))
      }

      return normalizedResults
    })
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
 * Mark the given task as completed with the given status.
 */
export const completeTask = function(taskId, challengeId, taskStatus, needsReview) {
  return function(dispatch) {
    return updateTaskStatus(dispatch, taskId, taskStatus, needsReview)
  }
}

/**
 *
 */
export const completeReview = function(taskId, taskReviewStatus, comment) {
  return function(dispatch) {
    return updateTaskReviewStatus(dispatch, taskId, taskReviewStatus, comment)
  }
}

const updateTaskReviewStatus = function(dispatch, taskId, newStatus, comment) {
  // Optimistically assume request will succeed. The store will be updated
  // with fresh task data from the server if the save encounters an error.
  dispatch(receiveTasks({
    tasks: {
      [taskId]: {
        id: taskId,
        status: newStatus
      }
    }
  }))

  return new Endpoint(
    api.task.updateReviewStatus,
    {schema: taskSchema(), variables: {id: taskId, status: newStatus}, params:{comment: comment}}
  ).execute().catch(error => {
    if (isSecurityError(error)) {
      dispatch(ensureUserLoggedIn()).then(() =>
        dispatch(addError(AppErrors.user.unauthorized))
      )
    }
    else {
      dispatch(addError(AppErrors.task.updateFailure))
      console.log(error.response || error)
    }
    fetchTask(taskId)(dispatch) // Fetch accurate task data
  })
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


/**
 * Bulk update the given tasks. Note that the bulk update APIs require ids to
 * be represented as strings, and this function will therefore automatically
 * perform a conversion unless skipConversion is true.
 */
export const bulkUpdateTasks = function(updatedTasks, skipConversion=false) {
  return function(dispatch) {
    const taskData =
      skipConversion ? updatedTasks :
      _map(updatedTasks, task => Object.assign({}, task, {id: task.id.toString()}))

    return new Endpoint(
      api.tasks.bulkUpdate, {json: taskData}
    ).execute().catch(error => {
      if (isSecurityError(error)) {
        dispatch(ensureUserLoggedIn()).then(() =>
          dispatch(addError(AppErrors.user.unauthorized))
        )
      }
      else {
        dispatch(addError(AppErrors.task.updateFailure))
        console.log(error.response || error)
      }
    })
  }
}

/**
 * Add a comment to the given task, associating the given task status if
 * provided.
 */
export const addTaskComment = function(taskId, comment, taskStatus) {
  return function(dispatch) {
    const params = {comment}
    if (_isFinite(taskStatus)) {
      params.actionId = taskStatus
    }

    return new Endpoint(
      api.task.addComment, {variables: {id: taskId}, params}
    ).execute().then(() => {
      fetchTaskComments(taskId)(dispatch)
      fetchTask(taskId)(dispatch) // Refresh task data
    }).catch(error => {
      if (isSecurityError(error)) {
        dispatch(ensureUserLoggedIn()).then(() =>
          dispatch(addError(AppErrors.user.unauthorized))
        )
      }
      else {
        dispatch(addError(AppErrors.task.updateFailure))
        console.log(error.response || error)
      }
    })
  }
}

/**
 * Fetch comments for the given task
 */
export const fetchTaskComments = function(taskId) {
  return function(dispatch) {
    return new Endpoint(
      api.task.comments,
      {schema: [ commentSchema() ], variables: {id: taskId}}
    ).execute().then(normalizedComments => {
      dispatch(receiveComments(normalizedComments.entities))

      if (_isObject(normalizedComments.entities.comments)) {
        // Inject comment ids into task.
        dispatch(receiveTasks({
          tasks: {
            [taskId]: {
              id: taskId,
              comments: _map(_keys(normalizedComments.entities.comments),
                             id => parseInt(id, 10)),
            }
          }
        }))
      }

      return normalizedComments
    })
  }
}

/**
 * Fetch history for the given task
 */
export const fetchTaskHistory = function(taskId) {
  return function(dispatch) {
    return new Endpoint(
      api.task.history,
      {schema: {}, variables: {id: taskId}}
    ).execute().then(normalizedHistory => {
      if (_isObject(normalizedHistory.result)) {
        // Inject history into task.
        dispatch(receiveTasks({
          tasks: {
            [taskId]: {
              id: taskId,
              history: _values(normalizedHistory.result),
            }
          }
        }))
      }

      return normalizedHistory
    })
  }
}

/**
 * Retrieve a random task from the given challenge. If priorTaskId is given,
 * then an attempt will be made to retrieve a task geographically proximate to
 * the given task.
 *
 * If info on available mapillary images for the task is also desired, set
 * includeMapillary to true
 */
export const loadRandomTaskFromChallenge = function(challengeId,
                                                    priorTaskId,
                                                    includeMapillary=false) {
  return function(dispatch) {
    // We use different API endpoints depending on whether a priorTaskId is
    // given (indicating that a proximate/nearby task is desired)
    let endpoint = null
    if (_isFinite(priorTaskId)) {
      endpoint = new Endpoint(api.challenge.randomTask, {
        schema: [ taskSchema() ],
        variables: {id: challengeId},
        params: {proximity: priorTaskId, mapillary: includeMapillary},
      })
    }
    else {
      endpoint = new Endpoint(api.challenge.prioritizedTask, {
        schema: [ taskSchema() ],
        variables: {id: challengeId},
        params: {mapillary: includeMapillary},
      })
    }

    return retrieveChallengeTask(dispatch, endpoint)
  }
}

/**
 * Retrieve a random task from the given virtual challenge. If priorTaskId is
 * given, then an attempt will be made to retrieve a task geographically
 * proximate to the given task.
 *
 * If info on available mapillary images for the task is also desired, set
 * includeMapillary to true
 */
export const loadRandomTaskFromVirtualChallenge = function(virtualChallengeId,
                                                           priorTaskId,
                                                           includeMapillary=false) {
  return function(dispatch) {
    return retrieveChallengeTask(dispatch, new Endpoint(
      api.virtualChallenge.randomTask,
      {
        schema: taskSchema(),
        variables: {id: virtualChallengeId},
        params: {
          proximity: _isFinite(priorTaskId) ? priorTaskId : undefined,
          mapillary: includeMapillary,
        }
      }
    ))
  }
}

/**
 * Retrieve the previous sequential task from the given challenge (primarily
 * intended for use during challenge inspect by challenge owners).
 */
export const loadPreviousSequentialTaskFromChallenge = function(challengeId,
                                                                currentTaskId) {
  return function(dispatch) {
    return retrieveChallengeTask(dispatch, new Endpoint(
      api.challenge.previousSequentialTask,
      {
        schema: taskSchema(),
        variables: {challengeId: challengeId, taskId: currentTaskId},
      }
    ))
  }
}

/**
 * Retrieve the next sequential task from the given challenge (primarily intended
 * for use during challenge inspect by challenge owners).
 */
export const loadNextSequentialTaskFromChallenge = function(challengeId,
                                                            currentTaskId) {
  return function(dispatch) {
    return retrieveChallengeTask(dispatch, new Endpoint(
      api.challenge.nextSequentialTask,
      {
        schema: taskSchema(),
        variables: {challengeId: challengeId, taskId: currentTaskId},
      }
    ))
  }
}

/**
 * Retrieve the next task to review with the given sort and filter criteria
 */
export const loadNextReviewTask = function(criteria={}) {
  const sortBy = _get(criteria, 'sortCriteria.sortBy')
  const order = (_get(criteria, 'sortCriteria.direction') || 'DESC').toUpperCase()
  const sort = sortBy ? `${_snakeCase(sortBy)}` : null
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

  return function(dispatch) {
    return retrieveChallengeTask(dispatch, new Endpoint(
      api.tasks.reviewNext,
      {
        schema: taskSchema(),
        variables: {},
        params: {sort, order, ...searchParameters},
      }
    ))
  }
}

/**
 * Retrieve all tasks (up to the given limit) belonging to the given
 * challenge
 */
export const fetchChallengeTasks = function(challengeId, limit=50) {
  return function(dispatch) {
    return new Endpoint(
      api.challenge.tasks,
      {schema: [ taskSchema() ], variables: {id: challengeId}, params: {limit}}
    ).execute().then(normalizedResults => {
      dispatch(receiveTasks(normalizedResults.entities))
      return normalizedResults
    })
  }
}

/**
 * Set the given status on the given task
 * @private
 */
const updateTaskStatus = function(dispatch, taskId, newStatus, requestReview = null) {
  // Optimistically assume request will succeed. The store will be updated
  // with fresh task data from the server if the save encounters an error.
  dispatch(receiveTasks({
    tasks: {
      [taskId]: {
        id: taskId,
        status: newStatus
      }
    }
  }))

  const params = {}
  if (requestReview != null) {
    params.requestReview = requestReview
  }

  return new Endpoint(
    api.task.updateStatus,
    {schema: taskSchema(),
     variables: {id: taskId, status: newStatus}, params}
  ).execute().catch(error => {
    if (isSecurityError(error)) {
      dispatch(ensureUserLoggedIn()).then(() =>
        dispatch(addError(AppErrors.user.unauthorized))
      )
    }
    else {
      dispatch(addError(AppErrors.task.updateFailure))
      console.log(error.response || error)
    }
    fetchTask(taskId)(dispatch) // Fetch accurate task data
  })
}

/**
 * Retrieve the place description associated with the task in the
 * given results.
 *
 * > Note that if the results contain multiple tasks, only the
 * > place description of the first result is retrieved.
 */
export const fetchTaskPlace = function(task) {
  return function(dispatch) {
    return dispatch(
      fetchPlace(_get(task, 'location.coordinates[1]', 0),
                 _get(task, 'location.coordinates[0]', 0))
    ).then(normalizedPlaceResults => {
      // Tasks have no natural reference to places, so inject the place id into
      // the task so that later denormalization will work properly.
      return dispatch(receiveTasks({
        tasks: {
          [task.id]: {
            id: task.id,
            place: _get(normalizedPlaceResults, 'result'),
          }
        }
      }))
    })
  }
}

/**
 * Saves the given task (either creating it or updating it, depending on
 * whether it already has an id) and updates the redux store with the latest
 * version from the server.
 */
export const saveTask = function(originalTaskData) {
  return function(dispatch) {
    const taskData = _pick(
      originalTaskData,
      ['id', 'name', 'instruction', 'geometries', 'status', 'priority']
    )

    // If the geometries are a string, convert to JSON.
    if (_isString(taskData.geometries)) {
      taskData.geometries = JSON.parse(taskData.geometries)
    }

    // Setup the save function to either edit or create the task
    // depending on whether it has an id.
    const saveEndpoint = new Endpoint(
      _isFinite(taskData.id) ? api.task.edit : api.task.create,
      {
        schema: taskSchema(),
        variables: {id: taskData.id},
        json: taskData
      }
    )

    return saveEndpoint.execute().then(normalizedResults => {
      dispatch(receiveTasks(normalizedResults.entities))
      return _get(normalizedResults, `entities.tasks.${normalizedResults.result}`)
    }).catch(error => {
      if (isSecurityError(error)) {
        dispatch(ensureUserLoggedIn()).then(() =>
          dispatch(addError(AppErrors.user.unauthorized))
        )
      }
      else {
        console.log(error.response || error)
        dispatch(addServerError(AppErrors.task.saveFailure, error))
      }
    })
  }
}

/**
 * Deletes the given task from the server.
 */
export const deleteTask = function(taskId) {
  return function(dispatch) {
    return new Endpoint(
      api.task.delete, {variables: {id: taskId}}
    ).execute().then(() =>
      dispatch(removeTask(taskId))
    ).catch(error => {
      if (isSecurityError(error)) {
        dispatch(ensureUserLoggedIn()).then(() =>
          dispatch(addError(AppErrors.user.unauthorized))
        )
      }
      else {
        dispatch(addError(AppErrors.task.deleteFailure))
        console.log(error.response || error)
      }
    })
  }
}


/**
 * Retrieve and process a single task retrieval from the given endpoint (next
 * task, previous task, random task, etc).
 *
 * @private
 */
export const retrieveChallengeTask = function(dispatch, endpoint) {
  return endpoint.execute().then(normalizedTaskResults => {
    if (!normalizedTaskResults ||
        (!_isFinite(normalizedTaskResults.result) &&
         _isEmpty(normalizedTaskResults.result))) {
      return null
    }

    const retrievedTaskId = _isArray(normalizedTaskResults.result) ?
                            normalizedTaskResults.result[0] :
                            normalizedTaskResults.result

    if (!_isUndefined(retrievedTaskId)) {
      // Some API requests give back the parent as `parentId` instead
      // of `parent`, and the geometries back as `geometry` instead of
      // `geometries`. Normalize these.
      const taskEntity = normalizedTaskResults.entities.tasks[retrievedTaskId]
      if (!_isFinite(taskEntity.parent)) {
        taskEntity.parent = taskEntity.parentId
      }

      if (!_isObject(taskEntity.geometries)) {
        taskEntity.geometries = taskEntity.geometry
      }

      dispatch(receiveTasks(normalizedTaskResults.entities))

      // Kick off fetches of supplementary data, but don't wait for them.
      fetchTaskPlace(
        normalizedTaskResults.entities.tasks[retrievedTaskId]
      )(dispatch)

      fetchTaskComments(retrievedTaskId)(dispatch)

      return taskEntity
    }
  }).catch((error) => {
    dispatch(addError(AppErrors.task.fetchFailure))
    console.log(error.response || error)
    throw error
  })
}


// redux reducers
export const taskEntities = function(state, action) {
  if (action.type === REMOVE_TASK) {
    const mergedState = _cloneDeep(state)
    delete mergedState[action.taskId]
    return mergedState
  }
  else {
    return genericEntityReducer(RECEIVE_TASKS, 'tasks')(state, action)
  }
}
