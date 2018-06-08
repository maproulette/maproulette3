import { schema } from 'normalizr'
import _get from 'lodash/get'
import _set from 'lodash/set'
import _isNumber from 'lodash/isNumber'
import _isObject from 'lodash/isObject'
import _isArray from 'lodash/isArray'
import _cloneDeep from 'lodash/cloneDeep'
import _pull from 'lodash/pull'
import _keys from 'lodash/keys'
import _each from 'lodash/each'
import _map from 'lodash/map'
import _toPairs from 'lodash/toPairs'
import _sortBy from 'lodash/sortBy'
import _reverse from 'lodash/reverse'
import subMonths from 'date-fns/sub_months'
import { defaultRoutes as api } from '../Server/Server'
import Endpoint from '../Server/Endpoint'
import RequestStatus from '../Server/RequestStatus'
import genericEntityReducer from '../Server/GenericEntityReducer'
import { challengeSchema, receiveChallenges } from '../Challenge/Challenge'
import { taskSchema,
         taskDenormalizationSchema,
         receiveTasks } from '../Task/Task'
import { addError } from '../Error/Error'
import AppErrors from '../Error/AppErrors'

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
    topChallenges: [ challengeSchema() ],
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
 * Fetch the saved challenges for the given user.
 */
export const fetchSavedChallenges = function(userId, limit=50) {
  return function(dispatch) {
    return new Endpoint(
      api.user.savedChallenges, {
        schema: [ challengeSchema() ],
        variables: {userId},
        params: {limit}
      }
    ).execute().then(normalizedChallenges => {
      const challenges = _get(normalizedChallenges, 'entities.challenges')
      const user = {id: userId}
      user.savedChallenges = _isObject(challenges) ?
                             _keys(challenges).map(key => parseInt(key, 10)) : []

      dispatch(receiveChallenges(normalizedChallenges.entities))
      dispatch(receiveUsers(simulatedEntities(user)))
      return normalizedChallenges
    })
  }
}

/**
 * Fetch the user's top challengs based on recent activity beginning at
 * the given startDate. If no date is given, then activity over the past
 * month is used.
 */
export const fetchTopChallenges = function(userId, startDate, limit=5) {
  return function(dispatch) {
    // If no startDate given, default to past month.

    return new Endpoint(
      api.user.topChallenges, {
        schema: [ challengeSchema() ],
        variables: {userId},
        params: {
          start: (startDate ? startDate : subMonths(new Date(), 1)).toISOString(),
          limit,
        }
      }
    ).execute().then(normalizedChallenges => {
      const challenges = _get(normalizedChallenges, 'entities.challenges')
      const user = {id: userId, topChallenges: []}

      // Store the top challenge ids in order, sorted by user activity (descending)
      if (_isObject(challenges)) {
        user.topChallenges = _map(
          _reverse(_sortBy(_toPairs(challenges), idAndChallenge => idAndChallenge[1].activity)),
          idAndChallenge => parseInt(idAndChallenge[0], 10)
        )
      }

      // Remove the user-specific activity score before adding this challenge
      // to the general redux store.
      _each(challenges, challenge => {
        delete challenge.activity
      })

      dispatch(receiveChallenges(normalizedChallenges.entities))
      dispatch(receiveUsers(simulatedEntities(user)))

      return normalizedChallenges
    })
  }
}

/**
 * Fetch the saved tasks for the given user.
 */
export const fetchSavedTasks = function(userId, limit=50) {
  return function(dispatch) {
    return new Endpoint(api.user.savedTasks, {
      schema: [ taskSchema() ],
      variables: {userId},
      params: {limit}
    }).execute().then(normalizedTasks => {
      const tasks = _get(normalizedTasks, 'entities.tasks')
      const user = {id: userId}
      user.savedTasks = _isObject(tasks) ?
                        _keys(tasks).map(key => parseInt(key, 10)) :[]

      dispatch(receiveTasks(normalizedTasks.entities))
      dispatch(receiveUsers(simulatedEntities(user)))
      return normalizedTasks
    })
  }
}

/**
 * Fetch the user's recent activity.
 */
export const fetchUserActivity = function(userId, limit=50) {
  return function(dispatch) {
    return new Endpoint(
      api.user.activity
    ).execute().then(activity => {
      const user = {id: userId}
      user.activity = activity
      dispatch(receiveUsers(simulatedEntities(user)))
      return activity
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

    return fetchUser(userId)(dispatch).then(normalizedUsers => {
      fetchSavedChallenges(userId, savedChallengesLimit)(dispatch)
      fetchTopChallenges(userId)(dispatch)
      fetchSavedTasks(userId, savedTasksLimit)(dispatch)
      fetchUserActivity(userId)(dispatch)
    }).then(() =>
      dispatch(setCurrentUser(userId))
    ).catch(error => {
      // a 401 (unauthorized) indicates that the user is not logged in.
      // Logout the current user to null to reflect that.
      if (error.response && error.response.status === 401) {
        dispatch(logoutUser())
      }
      else {
        console.log(error.response || error)
      }
    })
  }
}

/**
 * Update the given user's settings with the given settings.
 */
export const updateUserSettings = function(userId, settings) {
  return updateUser(userId, (dispatch) => {
    // Optimistically assume it will succeed and update the local store.
    // If it doesn't, it'll get updated properly by the server response.
    dispatch(receiveUsers({[userId]: {id: userId, settings}}))

    return new Endpoint(
      api.user.updateSettings, {variables: {userId}, json: settings}
    ).execute()
  }, true)
}

/**
 * Reset the user's API key
 */
export const resetAPIKey = function(userId) {
  return function(dispatch) {
    const resetURI = `/auth/generateAPIKey?userId=${userId}`

    fetch(resetURI, {credentials: 'same-origin'}).then(() => {
      return fetchUser(userId)(dispatch)
    }).catch(error => {
      // a 401 (unauthorized) indicates that the user is not logged in.
      // Logout the current user to reflect that.
      if (error.response && error.response.status === 401) {
        dispatch(logoutUser())
      }
      else {
        console.log(error.response || error)
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
 * Updates the given user, delegating to the given update function to perform
 * the actual server request to update whatever portion of user data is
 * desired, but handling and processing the response here.
 *
 * If reloadOnSuccess is true, a request for the latest user data will be made
 * following the successful update. A request will always be made if there is
 * an error to ensure the local store reflects the latest data from the server
 * in the event optimistic local updates were made.
 */
const updateUser = function(userId, updateFunction, reloadOnSuccess=false) {
  return function(dispatch) {
    return updateFunction(dispatch)
    .then(() => {
      // Reload the current user to get the updated data
      if (reloadOnSuccess) {
        return dispatch(loadCompleteUser(userId))
      }
    }).catch((error) => {
      if (error.response && error.response.status === 401) {
        // If we get an unauthorized, we assume the user is not logged
        // in (or no longer logged in with the server, anyway).
        dispatch(logoutUser())
        dispatch(addError(AppErrors.user.unauthorized))
      }
      else {
        dispatch(addError(AppErrors.user.updateFailure))
        console.log(error.response || error)

        // Reload user data to ensure our local store is in sync with the
        // server in case optimistic changes were made.
        dispatch(loadCompleteUser(userId))
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
  // The generic reduction will merge arrays, creating a union of values. We
  // don't want that for many of our arrays: we want to replace the old ones
  // with new ones (if we have new ones).
  for (let entity of userEntities) {
    if (_isArray(entity.groups)) {
      mergedState[entity.id].groups = entity.groups
    }

    if (_isArray(entity.activity)) {
      mergedState[entity.id].activity = entity.activity
    }

    if (_isArray(entity.savedChallenges)) {
      mergedState[entity.id].savedChallenges = entity.savedChallenges
    }

    if (_isArray(entity.topChallenges)) {
      mergedState[entity.id].topChallenges = entity.topChallenges
    }

    if (_isArray(entity.savedTasks)) {
      mergedState[entity.id].savedTasks = entity.savedTasks
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

/**
 * Builds a simulated normalized entities representation from the given
 * user.
 *
 * @private
 */
export const simulatedEntities = function(user) {
  return {
    users: {
      [user.id]: user
    }
  }
}
