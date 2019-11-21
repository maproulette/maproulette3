import { schema } from 'normalizr'
import uuidv1 from 'uuid/v1'
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
import { receiveClusteredTasks } from './ClusteredTask'
import { TaskStatus } from './TaskStatus/TaskStatus'

/** normalizr schema for tasks */
export const taskSchema = function() {
  return new schema.Entity('tasks')
}

/** normalizr schema for task tags */
export const taskTagsSchema = function() {
  return new schema.Entity('tags')
}

export const taskBundleSchema = function() {
  return new schema.Entity('taskBundles', {tasks: [ taskSchema() ]})
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

export const subscribeToChallengeTaskMessages = function(dispatch, challengeId) {
  websocketClient.addServerSubscription(
    "challengeTasks", challengeId, "challengeTaskMessageHandler",
    messageObject => onChallengeTaskMessage(dispatch, messageObject)
  )
}

export const unsubscribeFromChallengeTaskMessages = function(challengeId) {
  websocketClient.removeServerSubscription("challengeTasks", challengeId, "challengeTaskMessageHandler")
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

const onChallengeTaskMessage = function(dispatch, messageObject) {
  let task = messageObject.data.task
  switch(messageObject.messageType) {
    case "task-claimed":
      task = Object.assign({}, task, {lockedBy: _get(messageObject, 'data.byUser.userId')})
      dispatchTaskUpdateNotification(dispatch, task)
      break
    case "task-released":
    case "task-update":
      dispatchTaskUpdateNotification(dispatch, task)
      break
    default:
      break // Ignore
  }
}

const dispatchTaskUpdateNotification = function(dispatch, task) {
  dispatch(receiveTasks(simulatedEntities(task)))
  dispatch(receiveClusteredTasks(
    task.parent,
    false,
    [Object.assign(
      {},
      _pick(task, ['id', 'created', 'modified', 'priority', 'status', 'difficulty', 'lockedBy']),
      {
        parentId: task.parent,
        point: {lng: task.location.coordinates[0], lat: task.location.coordinates[1]},
        title: task.name,
        type: 2,
      }
    )],
    RequestStatus.success,
    uuidv1(),
    true,
    true
  ))
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
 * Fetch tags for the given task.
 */
export const fetchTaskTags = function(taskId) {
  return function(dispatch) {
    return new Endpoint(
      api.task.tags,
      {schema: {}, variables: {id: taskId}}
    ).execute().then(normalizedTags => {
      if (_isObject(normalizedTags.result)) {
        // Inject tags into task
        dispatch(receiveTasks(simulatedEntities({
          id: taskId,
          tags: _values(normalizedTags.result),
        })))
      }
      return normalizedTags
    })
  }
}

/**
 * Locks a task that is to be started.
 */
export const startTask = function(taskId) {
  return function(dispatch) {
    return new Endpoint(api.task.start, {
      schema: taskSchema(),
      variables: {id: taskId}
    }).execute()
  }
}

/**
 * Unlocks a task.
 */
export const releaseTask = function(taskId) {
  return function(dispatch) {
    return new Endpoint(api.task.release, {
      schema: taskSchema(),
      variables: {id: taskId}
    }).execute().then(normalizedResults => {
      dispatch(receiveTasks(normalizedResults.entities))
      return normalizedResults
    })
  }
}

/**
 * Refreshes an active task lock owned by the current user
 */
export const refreshTaskLock = function(taskId) {
  return function(dispatch) {
    return new Endpoint(api.task.refreshLock, {
      schema: taskSchema(),
      variables: {id: taskId}
    }).execute()
  }
}

/**
 * Mark the given task as completed with the given status.
 */
export const completeTask = function(taskId, taskStatus, needsReview,
                                     tags, suggestedFixSummary, osmComment, completionResponses) {
  return function(dispatch) {
    return updateTaskStatus(dispatch, taskId, taskStatus, needsReview, tags,
                            suggestedFixSummary, osmComment, completionResponses)
  }
}

/**
 * Mark all tasks in the given bundle as completed with the given status
 */
export const completeTaskBundle = function(bundleId, primaryTaskId, taskStatus, needsReview,
                                           tags, suggestedFixSummary, osmComment, completionResponses) {
  return function(dispatch) {
    return updateBundledTasksStatus(
      dispatch, bundleId, primaryTaskId, taskStatus, needsReview, tags,
      suggestedFixSummary, osmComment, completionResponses
    )
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
 * Add a comment to tasks in the given bundle, associating the given task
 * status if provided
 */
export const addTaskBundleComment = function(bundleId, primaryTaskId, comment, taskStatus) {
  return function(dispatch) {
    const params = {comment}
    if (_isFinite(taskStatus)) {
      params.actionId = taskStatus
    }

    return new Endpoint(api.tasks.bundled.addComment, {
      variables: {bundleId},
      params,
    }).execute().then(() => {
      fetchTaskComments(primaryTaskId)(dispatch)
      fetchTask(primaryTaskId)(dispatch) // Refresh task data
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
 * Fetch task bundle with given id
 */
export const fetchTaskBundle = function(bundleId) {
  return function(dispatch) {
    return new Endpoint(api.tasks.fetchBundle, {
      variables: {bundleId},
    }).execute().catch(error => {
      if (isSecurityError(error)) {
        dispatch(ensureUserLoggedIn()).then(() =>
          dispatch(addError(AppErrors.user.unauthorized))
        )
      }
      else {
        dispatch(addError(AppErrors.task.bundleFailure))
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
        // Inject comment ids into task
        dispatch(receiveTasks(simulatedEntities({
          id: taskId,
          comments: _map(_keys(normalizedComments.entities.comments),
                         id => parseInt(id, 10)),
        })))
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
        // Inject history into task
        dispatch(receiveTasks(simulatedEntities({
          id: taskId,
          history: _values(normalizedHistory.result),
        })))
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
    const endpoint = new Endpoint(api.challenge.prioritizedTask, {
      schema: [ taskSchema() ],
      variables: { id: challengeId },
      params: {
        proximity: _isFinite(priorTaskId) ? priorTaskId : undefined,
        mapillary: includeMapillary
      },
    })

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

/*
 * Retrieve tasks geographically closest to the given task (up to the given
 * limit) belonging to the given challenge or virtual challenge. Returns an
 * object in clusteredTasks format with the tasks and meta data, including the
 * challenge or virtual challenge id. Note that this does not add the results
 * to the redux store, but simply returns them
 */
export const fetchNearbyTasks = function(challengeId, isVirtualChallenge, taskId, excludeSelfLocked=false, limit=5) {
  return function(dispatch) {
    const params = {limit}
    if (excludeSelfLocked) {
      params.excludeSelfLocked = 'true'
    }

    return new Endpoint(
      isVirtualChallenge ? api.virtualChallenge.nearbyTasks : api.challenge.nearbyTasks,
      {
        schema: [ taskSchema() ],
        variables: {challengeId, taskId},
        params,
      }
    ).execute().then(normalizedResults => ({
      challengeId,
      isVirtualChallenge,
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
 * Initiate deletion of tasks in the given statuses belonging to the given
 * challenge. Note that this does not wait until the tasks have been deleted
 * before resolving.
 */
export const deleteChallengeTasks = function(challengeId, statuses=null) {
  return new Endpoint(api.challenge.deleteTasks, {
    variables: {id: challengeId},
    params: statuses ? {statusFilters: statuses.join(',')} : undefined,
  }).execute()
}

/**
 * Set the given status on the given task
 * @private
 */
const updateTaskStatus = function(dispatch, taskId, newStatus, requestReview = null,
                                  tags = null, suggestedFixSummary = null,
                                  osmComment = null, completionResponses = null) {
  // Optimistically assume request will succeed. The store will be updated
  // with fresh task data from the server if the save encounters an error.
  dispatch(receiveTasks(simulatedEntities({
    id: taskId,
    status: newStatus,
  })))

  const params = {}
  if (requestReview != null) {
    params.requestReview = requestReview
  }

  if (tags != null) {
    params.tags = tags
  }

  let endpoint = null
  // Suggested fixes that have been approved (fixed status) go to a different endpoint
  if (suggestedFixSummary && newStatus === TaskStatus.fixed) {
    endpoint = new Endpoint(api.task.applySuggestedFix, {
      params,
      variables: { id: taskId },
      json: {
        comment: osmComment,
        changes: suggestedFixSummary,
      }
    })
  }
  else {
    endpoint = new Endpoint(
      api.task.updateStatus,
      {schema: taskSchema(),
      variables: {id: taskId, status: newStatus}, params,
      json: completionResponses}
    )
  }

  return endpoint.execute().catch(error => {
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
 * Set the given status on the tasks in the given bundle
 * @private
 */
const updateBundledTasksStatus = function(dispatch, bundleId, primaryTaskId,
                                          newStatus, requestReview = null, tags = null,
                                          suggestedFixSummary = null, osmComment = null,
                                          completionResponses = null) {
  if (suggestedFixSummary) {
    throw new Error("Suggested-fix tasks cannot be updated as a bundle at this time")
  }

  const params = {
    primaryId: primaryTaskId,
  }

  if (requestReview != null) {
    params.requestReview = requestReview
  }

  if (tags != null) {
    params.tags = tags
  }

  const endpoint = new Endpoint(api.tasks.bundled.updateStatus, {
    schema: taskBundleSchema(),
    variables: {bundleId, status: newStatus},
    params,
    json: completionResponses,
  })

  return endpoint.execute().catch(error => {
    if (isSecurityError(error)) {
      dispatch(ensureUserLoggedIn()).then(() =>
        dispatch(addError(AppErrors.user.unauthorized))
      )
    }
    else {
      dispatch(addError(AppErrors.task.updateFailure))
      console.log(error.response || error)
    }
    fetchTask(primaryTaskId)(dispatch) // Fetch accurate task data
  })
}

export const fetchSuggestedTagFixChangeset = function(suggestedFixSummary) {
  const endpoint = new Endpoint(api.task.testTagFix, {
    params: { changeType: 'osmchange' },
    json: suggestedFixSummary,
    expectXMLResponse: true,
  })

  return endpoint.execute()
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
      return dispatch(receiveTasks(simulatedEntities({
        id: task.id,
        place: _get(normalizedPlaceResults, 'result'),
      })))
    })
  }
}

/**
 * Update the tags on the task.
 *
 */
export const updateTaskTags = function(taskId, tags) {
  return function(dispatch) {
    return new Endpoint(
      api.task.updateTags,
      {schema: {}, variables: {id: taskId}, params: {tags: tags}}
    ).execute().then(normalizedTags => {
      if (_isObject(normalizedTags.result)) {
        // Inject tags into task.
        dispatch(receiveTasks(simulatedEntities({
          id: taskId,
          tags: _values(normalizedTags.result),
        })))
      }
      return normalizedTags
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
      ['id', 'name', 'instruction', 'geometries', 'status', 'priority', 'tags']
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

export const bundleTasks = function(taskIds, bundleName="") {
  return function(dispatch) {
    return new Endpoint(api.tasks.bundle, {
      json: {name: bundleName, taskIds},
    }).execute().then(results => {
      return results
    }).catch(error => {
      if (isSecurityError(error)) {
        dispatch(ensureUserLoggedIn()).then(() =>
          dispatch(addError(AppErrors.user.unauthorized))
        )
      }
      else {
        dispatch(addError(AppErrors.task.bundleFailure))
        console.log(error.response || error)
      }
    })
  }
}

export const deleteTaskBundle = function(bundleId, primaryTaskId) {
  return function(dispatch) {
    const params = {}
    if (_isFinite(primaryTaskId)) {
      params.primaryId = primaryTaskId
    }

    return new Endpoint(api.tasks.deleteBundle, {
      variables: {bundleId},
      params,
    }).execute().then(results => {
      return results
    }).catch(error => {
      if (isSecurityError(error)) {
        dispatch(ensureUserLoggedIn()).then(() =>
          dispatch(addError(AppErrors.user.unauthorized))
        )
      }
      else {
        dispatch(addError(AppErrors.task.bundleFailure))
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

/**
 * Builds a simulated normalized entities representation from the given task
 *
 * @private
 */
export const simulatedEntities = function(task) {
  return {
    tasks: {
      [task.id]: task,
    }
  }
}

/**
 * reduceTasksFurther will be invoked by the genericEntityReducer function to
 * perform additional reduction on challenge entities.
 *
 * @private
 */
const reduceTasksFurther = function(mergedState, oldState, taskEntities) {
  // The generic reduction will merge arrays and objects, but for some fields
  // we want to simply overwrite with the latest data.
  taskEntities.forEach(entity => {
    if (_isArray(entity.tags)) {
      mergedState[entity.id].tags = entity.tags
    }
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
    return genericEntityReducer(RECEIVE_TASKS, 'tasks', reduceTasksFurther)(state, action)
  }
}
