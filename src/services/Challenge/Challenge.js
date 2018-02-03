import { normalize, schema } from 'normalizr'
import _get from 'lodash/get'
import _isObject from 'lodash/isObject'
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
import _isNumber from 'lodash/isNumber'
import _isArray from 'lodash/isArray'
import { defaultRoutes as api } from '../Server/Server'
import Endpoint from '../Server/Endpoint'
import RequestStatus from '../Server/RequestStatus'
import genericEntityReducer from '../Server/GenericEntityReducer'
import { commentSchema, receiveComments } from '../Comment/Comment'
import { projectSchema, fetchProject } from '../Project/Project'
import { logoutUser } from '../User/User'
import { toLatLngBounds } from '../MapBounds/MapBounds'
import { buildError,
         buildServerError,
         addError } from '../Error/Error'
import { RECEIVE_CHALLENGES,
         REMOVE_CHALLENGE } from './ChallengeActions'
import { parseQueryString } from '../Search/Search'

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
      dispatch(addError(buildError(
        "Challenge.fetchFailure", "Unable to retrieve latest challenge data from server."
      )))

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
      dispatch(addError(buildError(
        "Challenge.fetchFailure", "Unable to retrieve latest challenge data from server."
      )))

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
 * @param {string} queryString
 * @param {number} limit
 */
export const searchChallenges = function(queryString, limit=50) {
  return function(dispatch) {
    const queryParts = parseQueryString(queryString)

    // setup query parameters desired by server.
    // cs: query string
    // ct: keywords/tags (comma-separated string)
    const queryParams = {limit}
    if (queryParts.query.length > 0) {
      queryParams.cs = queryParts.query
    }

    if (queryParts.tags.length > 0) {
      queryParams.ct = queryParts.tags
    }

    return new Endpoint(
      api.challenges.search,
      {schema: [ challengeSchema() ], params: queryParams}
    ).execute().then(normalizedResults => {
      dispatch(receiveChallenges(normalizedResults.entities))
      return normalizedResults
    }).catch((error) => {
      dispatch(addError(buildError(
        "Challenge.searchFailure", "Unable to search challenges on server."
      )))

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
export const fetchChallengesWithinBoundingBox = function(bounds, limit=50) {
  const boundsObject = toLatLngBounds(bounds)

  return function(dispatch) {
    return new Endpoint(
      api.challenges.withinBounds,
      {
        schema: [ challengeSchema() ],
        params: {tbb: boundsObject.toBBoxString(), limit}
      }
    ).execute().then(normalizedResults => {
      dispatch(receiveChallenges(normalizedResults.entities))
      return normalizedResults
    }).catch((error) => {
      dispatch(addError(buildError(
        "Challenge.searchFailure", "Unable to search challenges on server."
      )))

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
      _isNumber(challengeId) ? api.challenge.actions : api.challenges.actions,
      {schema: [ challengeSchema() ], variables: {id: challengeId}}
    )

    return challengeActionsEndpoint.execute().then(normalizedResults => {
      dispatch(receiveChallenges(normalizedResults.entities))
    }).catch((error) => {
      if (error.response && error.response.status === 401) {
        // If we get an unauthorized, we assume the user is not logged
        // in (or no longer logged in with the server). There's nothing to
        // do for this request except ensure we know the user is logged out.
        dispatch(logoutUser())
      }
      else {
        dispatch(addError(buildError(
          "Challenge.fetchFailure", "Unable to retrieve latest challenge data from server."
        )))

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
      params.start = startDate.toISOString()
    }

    if (endDate) {
      params.end = endDate.toISOString()
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
            [challengeId]: {activity: rawActivity},
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
        dispatch(addError(buildError(
          "Challenge.fetchFailure", "Unable to retrieve latest challenge data from server."
        )))

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
      dispatch(addError(buildError(
        "Challenge.fetchFailure",
        "Unable to retrieve latest challenge data from server."
      )))

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
      dispatch(addError(buildError(
        "Challenge.fetchFailure", "Unable to retrieve latest challenge data from server."
      )))

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
      dispatch(addError(buildError(
        "Challenge.fetchFailure", "Unable to retrieve latest challenge data from server."
      )))

      console.log(error.response || error)
    })
  }
}

/**
 * Saves the given challenge (either creating it or updating it, depending on
 * whether it already has an id) and updates the redux store with the latest
 * version from the server.
 */
export const saveChallenge = function(originalChallengeData) {
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
        _isNumber(challengeData.id) ? api.challenge.edit : api.challenge.create,
        {
          schema: challengeSchema(),
          variables: {id: challengeData.id},
          json: challengeData
        }
      )

      return saveEndpoint.execute().then(normalizedResults => {
        dispatch(receiveChallenges(normalizedResults.entities))
        return _get(normalizedResults, `entities.challenges.${normalizedResults.result}`)
      }).catch((error) => {
        if (error.response && error.response.status === 401) {
          // If we get an unauthorized, we assume the user is not logged
          // in (or no longer logged in with the server).
          dispatch(logoutUser())
          dispatch(addError(buildError(
            "User.unauthorized", "Please sign in to continue."
          )))
        }
        else {
          console.log(error.response || error)
          buildServerError(
            "Challenge.saveFailure", "Unable to save your changes", error
          ).then(errorObject => dispatch(addError(errorObject)))
        }
      })
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
      this.fetchChallenge(challengeId)(dispatch)

      if (error.response && error.response.status === 401) {
        // If we get an unauthorized, we assume the user is not logged
        // in (or no longer logged in with the server).
        dispatch(logoutUser())
        dispatch(addError(buildError(
          "User.unauthorized", "Please sign in to continue."
        )))
      }
      else {
        dispatch(addError(buildError(
          "Challenge.deleteFailure", "Unable to delete challenge."
        )))

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
  const challengeId = _isArray(normalizedChallengeResults.result) ?
                      normalizedChallengeResults.result[0] :
                      normalizedChallengeResults.result
  const projectId = normalizedChallengeResults.entities.challenges[challengeId].parent
  return dispatch(fetchProject(projectId))
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
  // The generic reduction will merge arrays, creating a union of values.
  // We don't want that for keywords/tags: we want to replace the old array
  // with the new one.
  challengeEntities.forEach(entity => {
    if (_isArray(entity.tags)) {
      mergedState[entity.id].tags = entity.tags
    }
  })
}

// redux reducers
export const challengeEntities = function(state, action) {
  if (action.type === REMOVE_CHALLENGE) {
    const mergedState = _cloneDeep(state)
    delete mergedState[action.challengeId]
    return mergedState
  }
  else {
    return genericEntityReducer(
      RECEIVE_CHALLENGES, 'challenges', reduceChallengesFurther)(state, action)
  }
}
