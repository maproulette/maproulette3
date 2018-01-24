import { schema } from 'normalizr'
import { defaultRoutes as api } from '../Server/Server'
import Endpoint from '../Server/Endpoint'
import RequestStatus from '../Server/RequestStatus'
import genericEntityReducer from '../Server/GenericEntityReducer'
import { challengeSchema, receiveChallenges } from '../Challenge/Challenge'
import { taskSchema,
         taskDenormalizationSchema,
         receiveTasks } from '../Task/Task'
import { buildError, addError } from '../Error/Error'
import { get as _get,
         set as _set,
         isNumber as _isNumber,
         isObject as _isObject,
         isArray as _isArray,
         cloneDeep as _cloneDeep,
         pull as _pull,
         keys as _keys } from 'lodash'

// constants defined on the server
export const GUEST_USER_ID = -998 // i.e., not logged in
export const SUPERUSER_GROUP_TYPE = -1
export const ADMIN_GROUP_TYPE = 1

/** normalizr schema for users */
export const userSchema = function() {
  return new schema.Entity('users')
}

/**
 * normalizr denormalization schema, which will also pull in saved challenges
 * and tasks (fetched separately, so not used in normal schema)
 */
export const userDenormalizationSchema = function() {
  return new schema.Entity('users', {
    savedChallenges: [ challengeSchema() ],
    savedTasks: [ taskDenormalizationSchema() ],
  })
}

/**
 * Retrieve the OSM location from the given user entity
 */
export const userLocation = user => _get(user, 'osmProfile.homeLocation')

// redux actions
const RECEIVE_USERS = 'RECEIVE_USERS'
const SET_CURRENT_USER = 'SET_CURRENT_USER'
const ADD_SAVED_CHALLENGE = 'ADD_SAVED_CHALLENGE'
const REMOVE_SAVED_CHALLENGE = 'REMOVE_SAVED_CHALLENGE'
const ADD_SAVED_TASK = 'ADD_SAVED_TASK'
const REMOVE_SAVED_TASK = 'REMOVE_SAVED_TASK'

// redux action creators

/**
 * Set the current user in the redux store
 */
export const setCurrentUser = function(userId) {
  return {
    type: SET_CURRENT_USER,
    userId,
    status: RequestStatus.success,
  }
}

/**
 * Add or update user data in the redux store
 */
export const receiveUsers = function(normalizedEntities) {
  return {
    type: RECEIVE_USERS,
    status: RequestStatus.success,
    entities: normalizedEntities,
    receivedAt: Date.now(),
  }
}

/**
 * Add saved challenge to a user in the redux store
 */
export const addSavedChallenge = function(userId, challengeId) {
  return {
    type: ADD_SAVED_CHALLENGE,
    userId,
    challengeId,
  }
}

/**
 * Remove saved challenge from a user in the redux store
 */
export const removeSavedChallenge = function(userId, challengeId) {
  return {
    type: REMOVE_SAVED_CHALLENGE,
    userId,
    challengeId,
  }
}

/**
 * Add saved task to a user in the redux store
 */
export const addSavedTask = function(userId, taskId) {
  return {
    type: ADD_SAVED_TASK,
    userId,
    taskId,
  }
}

/**
 * Remove saved task from a user in the redux store
 */
export const removeSavedTask = function(userId, taskId) {
  return {
    type: REMOVE_SAVED_TASK,
    userId,
    taskId,
  }
}


// async action creators

/**
 * Fetch the user data for the given user. Note that this only fetches
 * the user data and does not fetch any accompanying data that would require
 * additional API requests to retrieve. Use `loadCompleteUser` to fully load
 * the user and accompanying data.
 */
export const fetchUser = function(userId) {
  return function(dispatch) {
    return new Endpoint(
      api.users.single, {schema: userSchema(), variables: {id: userId}}
    ).execute().then(normalizedResults => {
      dispatch(receiveUsers(normalizedResults.entities))
      return normalizedResults
    })
  }
}

/**
 * Retrieve the given user data plus their accompanying data, performing
 * multiple API requests as needed.
 */
export const loadCompleteUser = function(userId, savedChallengesLimit=50, savedTasksLimit=50) {
  return function(dispatch) {
    if (!_isNumber(userId) || userId === GUEST_USER_ID) {
      return null
    }

    return new Endpoint(
      api.users.single, {schema: userSchema(), variables: {id: userId}}
    ).execute().then(normalizedUsers => {
      const user = normalizedUsers.entities.users[normalizedUsers.result]
      return new Endpoint(
        api.user.savedChallenges,
        {
          schema: [ challengeSchema() ],
          variables: {userId},
          params: {limit: savedChallengesLimit}
        }
      ).execute().then(normalizedChallenges => {
        const challenges = _get(normalizedChallenges, 'entities.challenges')
        if (_isObject(challenges)) {
          user.savedChallenges = _keys(challenges).map(key => parseInt(key, 10))
        }
        else {
          user.savedChallenges = []
        }

        return new Endpoint(
          api.user.savedTasks,
          {
            schema: [ taskSchema() ],
            variables: {userId},
            params: {limit: savedTasksLimit}
          }
        ).execute().then(normalizedTasks => {
          const tasks = _get(normalizedTasks, 'entities.tasks')
          if (_isObject(tasks)) {
            user.savedTasks = _keys(tasks).map(key => parseInt(key, 10))
          }
          else {
            user.savedTasks = []
          }

          return new Endpoint(api.user.activity).execute().then(
            rawActivity => user.activity = rawActivity
          ).then(() => {
            dispatch(receiveChallenges(normalizedChallenges.entities))
            dispatch(receiveTasks(normalizedTasks.entities))
            dispatch(receiveUsers(normalizedUsers.entities))
            return normalizedUsers
          })
        })
      })
    }).then(() =>
      dispatch(setCurrentUser(userId))
    )
    .catch(error => {
      // a 401 (unauthorized) indicates that the user is not logged in.
      // Logout the current user to null to reflect that.
      if (error.response && error.response.status === 401) {
        dispatch(logoutUser())
      }
    })
  }
}

/**
 * Add the given challenge to the given user's list of saved challenges.
 */
export const saveChallenge = function(userId, challengeId) {
  return updateUser(userId, (dispatch) => {
    // Optimistically assume it will succeed and update the local store.
    // If it doesn't, it'll get updated properly by the server response.
    dispatch(addSavedChallenge(userId, challengeId))

    return new Endpoint(
      api.user.saveChallenge, {variables: {userId, challengeId}}
    ).execute()
  })
}

/**
 * Remove the given challenge from the given user's list of saved
 * challenges.
 */
export const unsaveChallenge = function(userId, challengeId) {
  return updateUser(userId, (dispatch) => {
    // Optimistically assume it will succeed and update the local store.
    // If it doesn't, it'll get updated by the server response.
    dispatch(removeSavedChallenge(userId, challengeId))

    return new Endpoint(
      api.user.unsaveChallenge, {variables: {userId, challengeId}}
    ).execute()
  })
}

/**
 * Add the given task to the given user's list of saved tasks.
 */
export const saveTask = function(userId, taskId) {
  return updateUser(userId, (dispatch) => {
    // Optimistically assume it will succeed and update the local store.
    // If it doesn't, it'll get updated properly by the server response.
    dispatch(addSavedTask(userId, taskId))

    return new Endpoint(
      api.user.saveTask, {variables: {userId, taskId}}
    ).execute()
  })
}

/**
 * Remove the given task from the given user's list of saved tasks.
 */
export const unsaveTask = function(userId, taskId) {
  return updateUser(userId, (dispatch) => {
    // Optimistically assume it will succeed and update the local store.
    // If it doesn't, it'll get updated by the server response.
    dispatch(removeSavedTask(userId, taskId))

    return new Endpoint(
      api.user.unsaveTask, {variables: {userId, taskId}}
    ).execute()
  })
}

/**
 * Logout the current user on both the client and server.
 */
export const logoutUser = function() {
  const logoutURI = '/auth/signout'

  return function(dispatch) {
    dispatch(setCurrentUser(GUEST_USER_ID))
    fetch(logoutURI, {credentials: 'same-origin'})
  }
}

/**
 * Updates the given user, delegating to the given update function to
 * perform the actual server request to update whatever portion of
 * user data is desired, but handling and processing the response here.
 */
const updateUser = function(userId, updateFunction) {
  return function(dispatch) {
    return updateFunction(dispatch)
    .then(() => {
      // Reload the current user to get the updated data
      return dispatch(loadCompleteUser(userId))
    }).catch((error) => {
      if (error.response && error.response.status === 401) {
        // If we get an unauthorized, we assume the user is not logged
        // in (or no longer logged in with the server, anyway).
        dispatch(logoutUser())
        dispatch(addError(buildError(
          "User.unauthorized", "Please sign in to continue."
        )))
      }
      else {
        dispatch(addError(buildError(
          "User.updateFailure", "Unable to update your user on server."
        )))

        console.log(error.response || error)
      }
    })
  }
}

// redux reducers.

/**
 * reduceUsersFurther will be invoked by the genericEntityReducer function to
 * perform additional reduction on user entities.
 *
 * @private
 */
const reduceUsersFurther = function(mergedState, oldState, userEntities) {
  // The generic reduction will merge arrays, creating a union of values.
  // We don't want that for savedChallenges: we want to replace the old array
  // with the new one. One complication is that not all user entities will
  // contain saved challenge data, as that comes from a separate API request.
  // So we only replace the challenge data if the entity contains some.
  for (let entity of userEntities) {
    if (_isArray(entity.savedChallenges)) {
      mergedState[entity.id].savedChallenges = entity.savedChallenges
    }
  }
}

/**
 * Primary reducer for user entities in the redux store
 */
export const userEntities = function(state, action) {
  if (action.type === ADD_SAVED_CHALLENGE) {
    const mergedState = _cloneDeep(state)
    if (!_isArray(_get(mergedState, `${action.userId}.savedChallenges`))) {
      _set(mergedState, `${action.userId}.savedChallenges`, [])
    }

    mergedState[action.userId].savedChallenges.push(action.challengeId)
    return mergedState
  }
  else if (action.type === REMOVE_SAVED_CHALLENGE) {
    const mergedState = _cloneDeep(state)
    _pull(_get(mergedState[action.userId], 'savedChallenges', []), action.challengeId)
    return mergedState
  }
  else if (action.type === ADD_SAVED_TASK) {
    const mergedState = _cloneDeep(state)
    if (!_isArray(_get(mergedState, `${action.userId}.savedTasks`))) {
      _set(mergedState, `${action.userId}.savedTasks`, [])
    }

    mergedState[action.userId].savedTasks.push(action.taskId)
    return mergedState
  }
  else if (action.type === REMOVE_SAVED_TASK) {
    const mergedState = _cloneDeep(state)
    _pull(_get(mergedState[action.userId], 'savedTasks', []), action.taskId)
    return mergedState
  }
  else {
    return genericEntityReducer(
      RECEIVE_USERS, 'users', reduceUsersFurther)(state, action)
  }
}

/**
 * Reducer for the current user in the redux store
 */
export const currentUser = function(state=null, action) {
  if (action.type === SET_CURRENT_USER) {
    return {
      userId: action.userId,
      isFetching: action.status === RequestStatus.inProgress
    }
  }

  return state
}
