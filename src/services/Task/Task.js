import { schema } from 'normalizr'
import { defaultRoutes as api, isSecurityError } from '../Server/Server'
import Endpoint from '../Server/Endpoint'
import RequestStatus from '../Server/RequestStatus'
import genericEntityReducer from '../Server/GenericEntityReducer'
import { challengeSchema,
         loadCompleteChallenge } from '../Challenge/Challenge'
import { placeSchema, fetchPlace } from '../Place/Place'
import { commentSchema, receiveComments } from '../Comment/Comment'
import { addServerError, addError } from '../Error/Error'
import AppErrors from '../Error/AppErrors'
import { ensureUserLoggedIn } from '../User/User'
import _get from 'lodash/get'
import _pick from 'lodash/pick'
import _cloneDeep from 'lodash/cloneDeep'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _isEmpty from 'lodash/isEmpty'
import _isUndefined from 'lodash/isUndefined'
import _isString from 'lodash/isString'
import _isNumber from 'lodash/isNumber'
import _isArray from 'lodash/isArray'
import _isObject from 'lodash/isObject'

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
 */
export const fetchTask = function(taskId, suppressReceive=false) {
  return function(dispatch) {
    return new Endpoint(
      api.task.single,
      {schema: taskSchema(), variables: {id: taskId}}
    ).execute().then(normalizedResults => {
      if (!suppressReceive) {
        dispatch(receiveTasks(normalizedResults.entities))
      }

      return normalizedResults
    })
  }
}

/**
 * Mark the given task as completed with the given status.
 */
export const completeTask = function(taskId, challengeId, taskStatus) {
  return function(dispatch) {
    return updateTaskStatus(dispatch, taskId, taskStatus)
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
    if (_isNumber(taskStatus)) {
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
 * Retrieve the given task data plus accompanying data like comments,
 * performing multiple API requests as needed.
 */
export const loadCompleteTask = function(taskId) {
  return function(dispatch) {
    if (!taskId) {
      return null
    }

    return dispatch(
      fetchTask(taskId)
    ).then(normalizedResults => {
      const task = _get(normalizedResults, `entities.tasks.${taskId}`)
      if (_isObject(task)) {
        // Kick off fetches of supplementary data, but don't wait for them.
        dispatch(loadCompleteChallenge(task.parent))
        fetchTaskPlace(
          normalizedResults.entities.tasks[taskId]
        )(dispatch)
        fetchTaskComments(taskId)(dispatch)
      }

      return normalizedResults
    })
  }
}

/**
 * Retrieve a random task from the given challenge. If priorTaskId is given,
 * then an attempt will be made to retrieve a task geographically proximate to
 * the given task.
 */
export const loadRandomTaskFromChallenge = function(challengeId, priorTaskId) {
  return function(dispatch) {
    return retrieveChallengeTask(dispatch, new Endpoint(
      api.challenge.randomTask,
      {
        schema: [ taskSchema() ],
        variables: {id: challengeId},
        params: _isNumber(priorTaskId) ? {proximity: priorTaskId} : undefined
      }
    ))
  }
}

/**
 * Retrieve a random task from the given virtual challenge. If priorTaskId is
 * given, then an attempt will be made to retrieve a task geographically
 * proximate to the given task.
 */
export const loadRandomTaskFromVirtualChallenge = function(virtualChallengeId,
                                                           priorTaskId) {
  return function(dispatch) {
    return retrieveChallengeTask(dispatch, new Endpoint(
      api.virtualChallenge.randomTask,
      {
        schema: taskSchema(),
        variables: {id: virtualChallengeId},
        params: _isNumber(priorTaskId) ? {proximity: priorTaskId} : undefined
      }
    ))
  }
}

/**
 * Retrieve the previous sequential task from the given challenge (primarily
 * intended for use during challenge review by challenge owners).
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
 * for use during challenge review by challenge owners).
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

/**
 * Set the given status on the given task
 * @private
 */
const updateTaskStatus = function(dispatch, taskId, newStatus) {
  return new Endpoint(
    api.task.updateStatus,
    {schema: taskSchema(), variables: {id: taskId, status: newStatus}}
  ).execute().then(() =>
    fetchTask(taskId)(dispatch) // Refresh task data
  ).catch(error => {
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

/**
 * Retrieve the place description associated with the task in the
 * given results.
 *
 * > Note that if the results contain multiple tasks, only the
 * > place description of the first result is retrieved.
 */
const fetchTaskPlace = function(task) {
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
      _isNumber(taskData.id) ? api.task.edit : api.task.create,
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
    if (!_isNumber(normalizedTaskResults.result) &&
        _isEmpty(normalizedTaskResults.result)) {
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
      if (!_isNumber(taskEntity.parent)) {
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
