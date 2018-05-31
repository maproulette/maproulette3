import { normalize, schema } from 'normalizr'
import _get from 'lodash/get'
import _compact from 'lodash/compact'
import _pick from 'lodash/pick'
import _map from 'lodash/map'
import _keys from 'lodash/keys'
import _values from 'lodash/values'
import _flatten from 'lodash/flatten'
import _clone from 'lodash/clone'
import _cloneDeep from 'lodash/cloneDeep'
import _isEmpty from 'lodash/isEmpty'
import _isString from 'lodash/isString'
import _isFinite from 'lodash/isFinite'
import _isObject from 'lodash/isObject'
import _isArray from 'lodash/isArray'
import _fromPairs from 'lodash/fromPairs'
import { defaultRoutes as api } from '../Server/Server'
import Endpoint from '../Server/Endpoint'
import RequestStatus from '../Server/RequestStatus'
import genericEntityReducer from '../Server/GenericEntityReducer'
import { commentSchema, receiveComments } from '../Comment/Comment'
import { projectSchema, fetchProject } from '../Project/Project'
import { logoutUser } from '../User/User'
import { toLatLngBounds } from '../MapBounds/MapBounds'
import { addError, addServerError } from '../Error/Error'
import AppErrors from '../Error/AppErrors'
import { RECEIVE_CHALLENGES,
         REMOVE_CHALLENGE } from './ChallengeActions'
import { zeroTaskActions } from '../Task/TaskAction/TaskAction'
import { parseQueryString } from '../Search/Search'
import startOfDay from 'date-fns/start_of_day'

// normalizr schema
export const challengeSchema = function() {
  return new schema.Entity('challenges', {parent: projectSchema()})
}

/**
 * normalizr denormalization schema, which will also pull in comments (fetched
 * separately, so not used in normal schema)
 */
export const challengeDenormalizationSchema = function() {
  return new schema.Entity('challenges', {
    parent: projectSchema(),
    comments: [ commentSchema() ],
  })
}

// utility functions

/**
 * Retrieves the resulting challenge entity object from the given
 * normalizedChallengeResults, or null if there is no result.
 *
 * > Note that if the results contain multiple challenges, only the
 * > first challenge entity is returned.
 */
export const challengeResultEntity = function(normalizedChallengeResults) {
  const challengeId = _isArray(normalizedChallengeResults.result) ?
                      normalizedChallengeResults.result[0] :
                      normalizedChallengeResults.result

  return _isFinite(challengeId) ?
         normalizedChallengeResults.entities.challenges[challengeId] :
         null
}

// redux actions -- see Server/ChallengeActions

// redux action creators

/**
 * Add or update challenge data in the redux store
 */
export const receiveChallenges = function(normalizedEntities,
                                          status = RequestStatus.success) {
  return {
    type: RECEIVE_CHALLENGES,
    status,
    entities: normalizedEntities,
    receivedAt: Date.now()
  }
}

/**
 * Remove a challenge from the redux store
 */
export const removeChallenge = function(challengeId) {
  return {
    type: REMOVE_CHALLENGE,
    challengeId,
    receivedAt: Date.now()
  }
}

// async action creators

/**
 * Retrieve all featured challenges, up to the given limit.
 *
 * @param {number} limit
 */
export const fetchFeaturedChallenges = function(limit = 50) {
  return function(dispatch) {
    return new Endpoint(
      api.challenges.featured,
      {schema: [ challengeSchema() ], params: {limit}}
    ).execute().then(normalizedResults => {
      dispatch(receiveChallenges(normalizedResults.entities))
      return normalizedResults
    }).catch((error) => {
      dispatch(addError(AppErrors.challenge.fetchFailure))
      console.log(error.response || error)
    })
  }
}

/**
 * Fetches challenges that contain any of the given keywords/tags,
 * up to the given limit.
 *
 * @param {string} tags - comma-separated keywords/tags to include in search.
 * @param {number} limit
 */
export const fetchChallengesWithKeywords = function(keywords, limit=50) {
  return function(dispatch) {
    const keywordString = _isArray(keywords) ? keywords.join(',') : keywords

    return new Endpoint(
      api.challenges.withKeywords,
      {schema: [ challengeSchema() ], params: {ce: 'true', ct: keywordString, limit}}
    ).execute().then(normalizedResults => {
      dispatch(receiveChallenges(normalizedResults.entities))
      return normalizedResults
    }).catch((error) => {
      dispatch(addError(AppErrors.challenge.fetchFailure))
      console.log(error.response || error)
    })
  }
}

/**
 * Fetches a batch of enabled challenges, up to the given limit.
 */
export const fetchEnabledChallenges = function(limit) {
  return fetchChallengesWithKeywords('', limit)
}

/**
 * Search challenges by name using the given query string, which may also
 * contain hashtags for narrowing by keyword/tag. e.g. "#france museum"
 * would search for challenges with the "france" keyword that had "museum"
 * in the challenge name (as determined by the server).
 *
 * Additional difficulty and keyword filters can be provided to further narrow
 * search results.
 *
 * @param {string} queryString
 * @param {object} filters
 * @param {boolean} onlyEnabled
 * @param {number} limit
 */
export const searchChallenges = function(queryString, filters={}, onlyEnabled=true, limit=50) {
  return function(dispatch) {
    const queryParts = parseQueryString(queryString)

    // setup query parameters desired by server.
    // ce: limit to enabled challenges
    // pe: limit to enabled projects
    // cs: query string
    // cd: challenge difficulty
    // ct: keywords/tags (comma-separated string)
    const queryParams = {
      limit,
      ce: onlyEnabled ? 'true' : 'false',
      pe: onlyEnabled ? 'true' : 'false',
    }

    if (_isFinite(filters.difficulty)) {
      queryParams.cd = filters.difficulty
    }

    // Keywords/tags can come from both the the query and the filter, so we need to
    // combine them into a single keywords array.
    const keywords =
      queryParts.tagTokens.concat(_isArray(filters.keywords) ? filters.keywords : [])

    if (keywords.length > 0) {
      queryParams.ct = keywords.join(',')
    }

    if (queryParts.query.length > 0) {
      queryParams.cs = queryParts.query
    }

    return new Endpoint(
      api.challenges.search,
      {schema: [ challengeSchema() ], params: queryParams}
    ).execute().then(normalizedResults => {
      dispatch(receiveChallenges(normalizedResults.entities))
      return normalizedResults
    }).catch((error) => {
      dispatch(addError(AppErrors.challenge.searchFailure))
      console.log(error.response || error)
    })
  }
}

/**
 * Fetch challenges that have one or more tasks located within the given
 * bounding box.
 *
 * @param bounds - a LatLngBounds instance or an array of [west, south, east, north]
 *                 values.
 * @param {number} limit
 */
export const fetchChallengesWithinBoundingBox = function(bounds, limit=100) {
  const boundsObject = toLatLngBounds(bounds)

  return function(dispatch) {
    return new Endpoint(
      api.challenges.withinBounds,
      {
        schema: [ challengeSchema() ],
        params: {bb: boundsObject.toBBoxString(), limit}
      }
    ).execute().then(normalizedResults => {
      dispatch(receiveChallenges(normalizedResults.entities))
      return normalizedResults
    }).catch((error) => {
      dispatch(addError(AppErrors.challenge.searchFailure))
      console.log(error.response || error)
    })
  }
}

/**
 * Fetch action metrics for the given challenge (or all challenges
 * if none is given).
 */
export const fetchChallengeActions = function(challengeId = null) {
  return function(dispatch) {
    const challengeActionsEndpoint = new Endpoint(
      _isFinite(challengeId) ? api.challenge.actions : api.challenges.actions,
      {schema: [ challengeSchema() ], variables: {id: challengeId}}
    )

    return challengeActionsEndpoint.execute().then(normalizedResults => {
      // If we requested actions on a specific challenge and got nothing back,
      // replace the results with a zeroed-out actions object so our app can
      // know the challenge has no actions.
      if (_isFinite(challengeId) && _isEmpty(normalizedResults.result)) {
        normalizedResults.result = [challengeId]
        normalizedResults.entities = {
          challenges: {
            [challengeId]: {
              id: challengeId,
              actions: zeroTaskActions(),
            }
          }
        }
      }

      dispatch(receiveChallenges(normalizedResults.entities))
    }).catch((error) => {
      if (error.response && error.response.status === 401) {
        // If we get an unauthorized, we assume the user is not logged
        // in (or no longer logged in with the server). There's nothing to
        // do for this request except ensure we know the user is logged out.
        dispatch(logoutUser())
      }
      else {
        dispatch(addError(AppErrors.challenge.fetchFailure))
        console.log(error.response || error)
      }
    })
  }
}

/**
 * Fetch action metrics for all challenges in the given project.
 */
export const fetchProjectChallengeActions = function(projectId) {
  return function(dispatch) {
    return new Endpoint(
      api.challenges.actions,
      {schema: [ challengeSchema() ], params: {projectList: projectId}}
    ).execute().then(normalizedResults => {
      dispatch(receiveChallenges(normalizedResults.entities))
    }).catch((error) => {
      if (error.response && error.response.status === 401) {
        // If we get an unauthorized, we assume the user is not logged
        // in (or no longer logged in with the server). There's nothing to
        // do for this request except ensure we know the user is logged out.
        dispatch(logoutUser())
      }
      else {
        dispatch(addError(AppErrors.challenge.fetchFailure))
        console.log(error.response || error)
      }
    })
  }
}

/**
 * Fetch activity timeline for the given challenge
 */
export const fetchChallengeActivity = function(challengeId, startDate, endDate) {
  return function(dispatch) {
    const params = {}
    if (startDate) {
      params.start = startOfDay(startDate).toISOString()
    }

    if (endDate) {
      params.end = startOfDay(endDate).toISOString()
    }

    return new Endpoint(
      api.challenge.activity, {
        variables: {id: challengeId},
        params,
      }
    ).execute().then(rawActivity => {
      const normalizedResults = {
        entities: {
          challenges: {
            [challengeId]: {id: challengeId, activity: rawActivity},
          }
        }
      }

      return dispatch(receiveChallenges(normalizedResults.entities))
    }).catch((error) => {
      if (error.response && error.response.status === 401) {
        // If we get an unauthorized, we assume the user is not logged
        // in (or no longer logged in with the server). There's nothing to
        // do for this request except ensure we know the user is logged out.
        dispatch(logoutUser())
      }
      else {
        dispatch(addError(AppErrors.challenge.fetchFailure))
        console.log(error.response || error)
      }
    })
  }
}

/**
 * Retrieves data about the most recent activity for each challenge in the
 * given project, regardless of how far back that activity may have occurred,
 * and updates the latestActivity field on the challenges in the redux store
 * with that data.
 */
export const fetchLatestProjectChallengeActivity = function(projectId) {
  return function(dispatch) {
    return new Endpoint(
      api.challenges.latestActivity, {params: {projectIds: projectId}}
    ).execute().then(rawActivity => {

      const normalizedResults = {
        entities: {
          challenges: _fromPairs(
            _map(rawActivity, activity => [
              activity.challengeId,
              Object.assign({latestActivity: _pick(activity, ['date', 'taskId', 'oldStatus', 'status', 'osmUserId', 'osmUsername'])},
                            {id: activity.challengeId})
            ])
          )
        }
      }

      return dispatch(receiveChallenges(normalizedResults.entities))
    }).catch((error) => {
      if (error.response && error.response.status === 401) {
        // If we get an unauthorized, we assume the user is not logged
        // in (or no longer logged in with the server). There's nothing to
        // do for this request except ensure we know the user is logged out.
        dispatch(logoutUser())
      }
      else {
        dispatch(addError(AppErrors.challenge.fetchFailure))
        console.log(error.response || error)
      }
    })
  }
}

/**
 * Fetch comments for the given challenge
 */
export const fetchChallengeComments = function(challengeId) {
  return function(dispatch) {
    return new Endpoint(
      api.challenge.comments, {variables: {id: challengeId}}
    ).execute().then(rawComments => {
      // Comments are indexed by task id, so we need to extract them
      // into a single array and manually denormalize
      const commentArray = _flatten(_values(rawComments))
      const normalizedComments = normalize(commentArray, [ commentSchema() ])
      dispatch(receiveComments(normalizedComments.entities))

      if (_isObject(normalizedComments.entities.comments)) {
        // Inject comment ids into challenge.
        dispatch(receiveChallenges({
          challenges: {
            [challengeId]: {
              id: challengeId,
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
 * Fetch child challenges belonging to the given project, up to the given
 * limit.
 */
export const fetchProjectChallenges = function(projectId, limit=50) {
  return function(dispatch) {
    return new Endpoint(
      api.project.challenges,
      {
        schema: [ challengeSchema() ],
        variables: {id: projectId},
        params: {limit}
      }
    ).execute().then(normalizedResults => {
      dispatch(receiveChallenges(normalizedResults.entities))
      return normalizedResults
    }).catch((error) => {
      dispatch(addError(AppErrors.challenge.fetchFailure))
      console.log(error.response || error)
    })
  }
}

/**
 * Fetch data for the given challenge. Normally that data will be added to the
 * redux store, but that can be suppressed with the supressReceive flag.
 */
export const fetchChallenge = function(challengeId, suppressReceive = false) {
  return function(dispatch) {
    return new Endpoint(
      api.challenge.single,
      {schema: challengeSchema(), variables: {id: challengeId}}
    ).execute().then(normalizedResults => {
      if (!suppressReceive) {
        dispatch(receiveChallenges(normalizedResults.entities))
      }

      return normalizedResults
    }).catch((error) => {
      dispatch(addError(AppErrors.challenge.fetchFailure))
      console.log(error.response || error)
    })
  }
}

/**
 * Convenience function that fetches the given challenge plus its parent project,
 * so that a fully denormalized challenge entity can be reliably created.
 */
export const loadCompleteChallenge = function(challengeId) {
  return function(dispatch) {
    if (!challengeId) {
      return null
    }

    return dispatch(fetchChallenge(challengeId, true)).then(normalizedChallengeResults =>
      fetchParentProject(dispatch, normalizedChallengeResults).then(() =>
        dispatch(receiveChallenges(normalizedChallengeResults.entities))
      ).then(() => normalizedChallengeResults)
    ).catch((error) => {
      dispatch(addError(AppErrors.challenge.fetchFailure))
      console.log(error.response || error)
    })
  }
}

/**
 * Saves the given challenge (either creating it or updating it, depending on
 * whether it already has an id) and updates the redux store with the latest
 * version from the server.
 *
 * If storeResponse is false, the redux store will not be updated with the
 * response data upon completion of a successful request.
 */
export const saveChallenge = function(originalChallengeData, storeResponse=true) {
  return function(dispatch) {
    // The server wants keywords/tags represented as a comma-separated string.
    let challengeData = _clone(originalChallengeData)
    if (_isArray(challengeData.tags)) {
      challengeData.tags = challengeData.tags.join(',')
    }

    // If there is local GeoJSON content being transmitted as a string, parse
    // it into JSON first.
    if (_isString(challengeData.localGeoJSON) &&
        !_isEmpty(challengeData.localGeoJSON)) {
      challengeData.localGeoJSON = JSON.parse(challengeData.localGeoJSON)
    }

    // We need to remove any old challenge keywords first, prior to the
    // update.
    return removeChallengeKeywords(challengeData.id, challengeData.removedTags).then(() => {
      challengeData = _pick(challengeData, // fields in alphabetical order
        ['blurb', 'challengeType', 'checkinComment', 'customBasemap',
        'defaultBasemap', 'defaultPriority', 'defaultZoom', 'description',
        'difficulty', 'enabled', 'featured', 'highPriorityRule', 'id',
        'instruction', 'localGeoJSON', 'lowPriorityRule', 'maxZoom',
        'mediumPriorityRule', 'minZoom', 'name', 'overpassQL', 'remoteGeoJson',
        'status', 'tags', 'updateTasks'])

      // Setup the save function to either edit or create the challenge
      // depending on whether it has an id.
      const saveEndpoint = new Endpoint(
        _isFinite(challengeData.id) ? api.challenge.edit : api.challenge.create,
        {
          schema: challengeSchema(),
          variables: {id: challengeData.id},
          json: challengeData
        }
      )

      return saveEndpoint.execute().then(normalizedResults => {
        if (storeResponse) {
          dispatch(receiveChallenges(normalizedResults.entities))
        }

        return _get(normalizedResults, `entities.challenges.${normalizedResults.result}`)
      }).catch((serverError) => {
        if (serverError.response && serverError.response.status === 401) {
          // If we get an unauthorized, we assume the user is not logged
          // in (or no longer logged in with the server).
          dispatch(logoutUser())
          dispatch(addError(AppErrors.user.unauthorized))
        }
        else {
          console.log(serverError.response || serverError)
          dispatch(addServerError(AppErrors.challenge.saveFailure, serverError))

          // Reload challenge data to ensure our local store is in sync with the
          // server in case optimistic changes were made.
          dispatch(loadCompleteChallenge(challengeData.id))
        }
      })
    })
  }
}

export const setIsEnabled = function(challengeId, isEnabled) {
  return function(dispatch) {
    // Optimistically assume request will succeed. The store will be updated
    // with fresh challenge data from the server if the save encounters
    // an error.
    dispatch(receiveChallenges({
      challenges: {
        [challengeId]: {
          id: challengeId,
          enabled: isEnabled,
        }
      }
    }))

    saveChallenge({id: challengeId, enabled: isEnabled}, false)(dispatch)
  }
}

export const rebuildChallenge = function(challengeId) {
  return function(dispatch) {
    return new Endpoint(
      api.challenge.rebuild,
      {variables: {id: challengeId}}
    ).execute().then(() =>
      fetchChallenge(challengeId)(dispatch) // Refresh challenge data
    ).catch((error) => {
      if (error.response && error.response.status === 401) {
        // If we get an unauthorized, we assume the user is not logged
        // in (or no longer logged in with the server).
        dispatch(logoutUser())
        dispatch(addError(AppErrors.user.unauthorized))
      }
      else {
        dispatch(addError(AppErrors.challenge.rebuildFailure))
        console.log(error.response || error)
      }
    })
  }
}

/**
 * Deletes the given challenge from the server.
 */
export const deleteChallenge = function(challengeId) {
  return function(dispatch) {
    return new Endpoint(
      api.challenge.delete,
      {variables: {id: challengeId}}
    ).execute().then(() =>
      dispatch(removeChallenge(challengeId))
    ).catch((error) => {
      // Update with the latest challenge data.
      fetchChallenge(challengeId)(dispatch)

      if (error.response && error.response.status === 401) {
        // If we get an unauthorized, we assume the user is not logged
        // in (or no longer logged in with the server).
        dispatch(logoutUser())
        dispatch(addError(AppErrors.user.unauthorized))
      }
      else {
        dispatch(addError(AppErrors.challenge.deleteFailure))
        console.log(error.response || error)
      }
    })
  }
}

/**
 * Retrieves the parent project embedded in the given normalized challenge
 * results.
 *
 * > Note that if the results contain multiple challenges, only the
 * > parent project of the first result is retrieved.
 */
const fetchParentProject = function(dispatch, normalizedChallengeResults) {
  const challenge = challengeResultEntity(normalizedChallengeResults)

  if (challenge) {
    return dispatch(fetchProject(challenge.parent))
  }
}

/**
 * Removes the given oldKeywords from the given challenge. If no
 * keywords are provided, nothing is done.
 *
 * @private
 *
 * @returns a Promise
 */
const removeChallengeKeywords = function(challengeId, oldKeywords=[]) {
  // strip empty tags
  const toRemove =
    _compact(_map(oldKeywords, tag => _isEmpty(tag) ? null : tag))

  // if no keywords given, nothing to do.
  if (toRemove.length === 0) {
    return Promise.resolve()
  }
  else {
    return new Endpoint(
      api.challenge.removeKeywords, {
        variables: {id: challengeId},
        params: {tags: toRemove.join(',')},
      }
    ).execute()
  }
}

/**
 * reduceChallengesFurther will be invoked by the genericEntityReducer function to
 * perform additional reduction on challenge entities.
 *
 * @private
 */
const reduceChallengesFurther = function(mergedState, oldState, challengeEntities) {
  // The generic reduction will merge arrays and objects, but for some fields
  // we want to simply overwrite with the latest data.
  challengeEntities.forEach(entity => {
    // Until we implement undelete, ignore deleted challenges.
    if (entity.deleted) {
      delete mergedState[entity.id]
      return
    }

    if (_isArray(entity.tags)) {
      mergedState[entity.id].tags = entity.tags
    }

    if (_isObject(entity.highPriorityRule)) {
      mergedState[entity.id].highPriorityRule = entity.highPriorityRule
    }

    if (_isObject(entity.mediumPriorityRule)) {
      mergedState[entity.id].mediumPriorityRule = entity.mediumPriorityRule
    }

    if (_isObject(entity.lowPriorityRule)) {
      mergedState[entity.id].lowPriorityRule = entity.lowPriorityRule
    }

    if (_isArray(entity.activity)) {
      mergedState[entity.id].activity = entity.activity
    }
  })
}

// redux reducers
export const challengeEntities = function(state, action) {
  if (action.type === REMOVE_CHALLENGE) {
    const mergedState = _cloneDeep(state)
    mergedState[action.challengeId].deleted = true
    return mergedState
  }
  else {
    return genericEntityReducer(
      RECEIVE_CHALLENGES, 'challenges', reduceChallengesFurther)(state, action)
  }
}
