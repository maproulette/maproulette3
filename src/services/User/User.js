import { schema } from 'normalizr'
import _get from 'lodash/get'
import _set from 'lodash/set'
import _isFinite from 'lodash/isFinite'
import _isObject from 'lodash/isObject'
import _isArray from 'lodash/isArray'
import _cloneDeep from 'lodash/cloneDeep'
import _pull from 'lodash/pull'
import _keys from 'lodash/keys'
import _each from 'lodash/each'
import _map from 'lodash/map'
import _toPairs from 'lodash/toPairs'
import _omit from 'lodash/omit'
import _sortBy from 'lodash/sortBy'
import _reverse from 'lodash/reverse'
import subMonths from 'date-fns/sub_months'
import { defaultRoutes as api, isSecurityError, credentialsPolicy, websocketClient }
       from '../Server/Server'
import { resetCache } from '../Server/RequestCache'
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

// constants defined on the Server
export const REVIEW_NOT_NEEDED = 0
export const REVIEW_NEEDED = 1
export const REVIEW_MANDATORY = 2

export const needsReviewType = Object.freeze({
  notNeeded: REVIEW_NOT_NEEDED,
  needed: REVIEW_NEEDED,
  mandatory: REVIEW_MANDATORY,
})

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

export const subscribeToUserUpdates = function(dispatch, userId) {
  websocketClient.addServerSubscription(
    "user", userId, `newNotificationHandler_${userId}`,
    messageObject => onNewNotification(dispatch, userId, messageObject)
  )
}

export const unsubscribeFromUserUpdates = function(userId) {
  websocketClient.removeServerSubscription("user", userId, `newNotificationHandler_${userId}`)
}

const onNewNotification = function(dispatch, userId, messageObject) {
  switch(messageObject.messageType) {
    case "notification-new":
      if (_get(messageObject, 'data.userId') === userId) {
        // Refresh user's notifications from server
        dispatch(fetchUserNotifications(userId))
      }
      break
    default:
      break // Ignore
  }
}

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
 * Search for users by OSM username. Resolves with a (possibly empty) list of
 * results. Note that each result only contains a few public OSM fields such
 * as OSM id and avatar URL.
 */
export const findUser = function(username) {
  return new Endpoint(api.users.find, {variables: {username}}).execute()
}

/**
 * Fetch the user data for the given user. Note that this only fetches
 * the user data and does not fetch any accompanying data that would require
 * additional API requests to retrieve. Use `loadCompleteUser` to fully load
 * the user and accompanying data.
 *
 * @param userId - Can be either a userId, osmUserId, or username
 */
export const fetchUser = function(userId) {
  return function(dispatch) {
    const endPoint = isFinite(userId) ?
      new Endpoint(
        api.users.single, {schema: userSchema(), variables: {id: userId}}
      ) :
      new Endpoint(
        api.users.singleByUsername, {schema: userSchema(), variables: {username: userId}}
      )

    return endPoint.execute().then(normalizedResults => {
      dispatch(receiveUsers(normalizedResults.entities))
      return normalizedResults
    })
  }
}

/**
 * Fetch the public user data for the given user.
 *
 * @param userId - Can be either a userId, osmUserId, or username
 */
export const fetchBasicUser = function(userId) {
  return function(dispatch) {
    const endPoint = isFinite(userId) ?
      new Endpoint(
        api.users.public, {schema: userSchema(), variables: {id: userId}}
      ) :
      new Endpoint(
        api.users.publicByUsername, {schema: userSchema(), variables: {username: userId}}
      )

    return endPoint.execute().then(normalizedResults => {
      dispatch(receiveUsers(normalizedResults.entities))
      return normalizedResults
    })
  }
}

/**
 * Pings the server to ensure the current (given) user is logged in with
 * the server, and automatically signs out the user locally if not.
 */
export const ensureUserLoggedIn = function(squelchError=false) {
  return function(dispatch) {
    return new Endpoint(
      api.user.whoami, {schema: userSchema()}
    ).execute().then(normalizedResults => {
      dispatch(receiveUsers(normalizedResults.entities))
      dispatch(setCurrentUser(normalizedResults.result))
      return normalizedResults.result
    }).catch(error => {
      // a 401 (unauthorized) indicates that the user is not logged in. Logout
      // the current user locally to reflect that fact and dispatch an error
      // indicating the user should sign in to continue (unless squelched).
      if (error.response && error.response.status === 401) {
        dispatch(logoutUser())
        if (!squelchError) {
          dispatch(addError(AppErrors.user.unauthenticated))
        }
      }

      throw error
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
 * Fetch the user's notification subscriptions
 */
export const fetchNotificationSubscriptions = function(userId) {
  return function(dispatch) {
    return new Endpoint(api.user.notificationSubscriptions, {
      variables: {userId},
    }).execute().then(response => {
      const user = {id: userId}
      user.notificationSubscriptions = _omit(response, ['id', 'userId'])
      dispatch(receiveUsers(simulatedEntities(user)))
      return response
    })
  }
}

/**
 * Fetch the user's notifications
 */
export const fetchUserNotifications = function(userId) {
  return function(dispatch) {
    return new Endpoint(api.user.notifications, {
      variables: {userId},
      params: {limit: -1}
    }).execute().then(response => {
      const user = {id: userId}
      user.notifications = response
      dispatch(receiveUsers(simulatedEntities(user)))
      return response
    })
  }
}

/**
 * Mark notifications as read
 */
export const markNotificationsRead = function(userId, notificationIds) {
  return function(dispatch) {
    return new Endpoint(api.user.markNotificationsRead, {
      variables: {userId},
      params: {notificationIds: notificationIds.join(',')},
    }).execute().then(response => {
      return fetchUserNotifications(userId)(dispatch)
    })
  }
}

/**
 * Delete notifications
 */
export const deleteNotifications = function(userId, notificationIds) {
  return function(dispatch) {
    return new Endpoint(api.user.deleteNotifications, {
      variables: {userId},
      params: {notificationIds: notificationIds.join(',')},
    }).execute().then(response => {
      return fetchUserNotifications(userId)(dispatch)
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
 * Fetch the user's recent metrics.
 */
export const fetchUserMetrics = function(userId,
                                         monthDuration = -1,
                                         reviewDuration = -1,
                                         reviewerDuration = -1) {
  return new Endpoint(api.user.metrics, {
    variables: {userId},
    params: {monthDuration, reviewDuration, reviewerDuration}
  }).execute()
}

/**
 * Retrieve the given user data plus their accompanying data, performing
 * multiple API requests as needed.
 */
export const loadCompleteUser = function(userId, savedChallengesLimit=50, savedTasksLimit=50) {
  return function(dispatch) {
    if (!_isFinite(userId) || userId === GUEST_USER_ID) {
      return null
    }

    return fetchUser(userId)(dispatch).then(normalizedUsers => {
      fetchSavedChallenges(userId, savedChallengesLimit)(dispatch)
      fetchTopChallenges(userId)(dispatch)
      fetchSavedTasks(userId, savedTasksLimit)(dispatch)
      fetchUserActivity(userId)(dispatch)
      fetchNotificationSubscriptions(userId)(dispatch)
    }).then(() =>
      dispatch(setCurrentUser(userId))
    ).catch(error => {
      if (isSecurityError(error)) {
        dispatch(ensureUserLoggedIn()).then(() =>
          dispatch(addError(AppErrors.user.unauthorized))
        )
      }
      else {
        console.log(error.response || error)
      }
    })
  }
}

/**
 * Retrieve the given user data plus any accompanying data needed for User Settings,
 * performing multiple API requests as needed.
 */
export const loadUserSettings = function(userId) {
  return function(dispatch) {
    if (userId === GUEST_USER_ID) {
      return null
    }

    return fetchUser(userId)(dispatch).then(normalizedUsers => {
      const fetchedUserId = normalizedUsers.result
      if (fetchedUserId) {
        fetchNotificationSubscriptions(fetchedUserId)(dispatch)
      }
      else {
        dispatch(addError(AppErrors.user.notFound))
      }
    }).catch(error => {
      if (isSecurityError(error)) {
        dispatch(ensureUserLoggedIn()).then(() =>
          dispatch(addError(AppErrors.user.unauthorized))
        )
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
  return updateUser(userId, dispatch => {
    // Optimistically assume it will succeed and update the local store.
    // If it doesn't, it'll get updated properly by the server response.
    dispatch(receiveUsers({[userId]: {id: userId, settings}}))

    return new Endpoint(
      api.user.updateSettings, {variables: {userId}, json: settings}
    ).execute().then(() => dispatch(fetchUser(userId))) // fetch latest
  })
}

/**
 * Update the given user's notification subscription options with the given
 * subscriptions
 */
export const updateNotificationSubscriptions = function(userId, subscriptions) {
  return updateUser(userId, dispatch => {
    // Optimistically assume it will succeed and update the local store.
    // If it doesn't, it'll get updated properly by the server response.
    dispatch(receiveUsers({[userId]: {id: userId, notificationSubscriptions: subscriptions}}))

    return new Endpoint(
      api.user.updateNotificationSubscriptions, {variables: {userId}, json: {...subscriptions, userId, id: -1}}
    ).execute().then(() => dispatch(fetchNotificationSubscriptions(userId))) // fetch latest
  })
}

/**
 * Updates an app/client-specific setting for the user on the server.
 * appSettings should be a JSON-compatible object of the form
 * `{ settingName: ...  }`
 */
export const updateUserAppSetting = function(userId, appId, appSetting) {
  return updateUser(userId, dispatch => {
    return new Endpoint(
      api.users.single, {schema: userSchema(), variables: {id: userId}}
    ).execute().then(normalizedResults => {
      const oldUser = normalizedResults.entities.users[normalizedResults.result]

      // Combined properties format for multiple client applications:
      // {
      //   "my_application_id": {
      //     "meta": {
      //       "revision": timestamp,
      //     },
      //     "settings": {
      //       "first_app_setting": ...,
      //       "second_app_setting": ...,
      //       ...
      //     }
      //   },
      //   ...
      // }
      const userData =
        Object.assign({}, oldUser, {
          properties: Object.assign({}, _get(oldUser, 'properties'), {
            [appId]: {
              meta: Object.assign({}, _get(oldUser, `properties.${appId}.meta`), {
                revision: Date.now(),
              }),
              settings: Object.assign({}, _get(oldUser, `properties.${appId}.settings`), appSetting),
            }
          })
        })

      // Optimistically assume update will succeed and update the local store.
      // If it doesn't, it'll get updated properly by the server response.
      dispatch(receiveUsers({users: {[userId]: userData}}))

      return new Endpoint(api.user.updateSettings, {
        variables: { userId },
        json: userData,
      }).execute()
    })
  })
}

/**
 * Reset the user's API key
 */
export const resetAPIKey = function(userId) {
  return function(dispatch) {
    const resetURI =
      `${process.env.REACT_APP_MAP_ROULETTE_SERVER_URL}/auth/generateAPIKey?userId=${userId}`

    // Since we're bypassing Endpoint and manually performing an update, we
    // need to also manually reset the request cache.
    resetCache()
    fetch(resetURI, {credentials: credentialsPolicy}).then(() => {
      return fetchUser(userId)(dispatch)
    }).catch(error => {
      if (isSecurityError(error)) {
        dispatch(ensureUserLoggedIn()).then(() =>
          dispatch(addError(AppErrors.user.unauthorized))
        )
      }
      else {
        dispatch(addError(AppErrors.user.updateFailure))
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
export const logoutUser = function(userId) {
  const logoutURI = `${process.env.REACT_APP_MAP_ROULETTE_SERVER_URL}/auth/signout`

  if (_isFinite(userId) && userId !== GUEST_USER_ID) {
    unsubscribeFromUserUpdates(userId)
  }

  return function(dispatch) {
    dispatch(setCurrentUser(GUEST_USER_ID))
    fetch(logoutURI, {credentials: credentialsPolicy})
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
const updateUser = function(userId, updateFunction) {
  return function(dispatch) {
    return updateFunction(dispatch).catch(error => {
      if (isSecurityError(error)) {
        dispatch(ensureUserLoggedIn()).then(() =>
          dispatch(addError(AppErrors.user.unauthorized))
        )
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

    if (_isArray(entity.notifications)) {
      mergedState[entity.id].notifications = entity.notifications
    }

    // Always completely replace app-specific properties with new ones
    if (_isObject(entity.properties)) {
      mergedState[entity.id].properties = entity.properties
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
