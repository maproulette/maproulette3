import { normalize, schema } from 'normalizr'
import _get from 'lodash/get'
import _each from 'lodash/each'
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
import _isUndefined from 'lodash/isUndefined'
import _groupBy from 'lodash/groupBy'
import parse from 'date-fns/parse'
import format from 'date-fns/format'
import { defaultRoutes as api, isSecurityError } from '../Server/Server'
import Endpoint from '../Server/Endpoint'
import RequestStatus from '../Server/RequestStatus'
import genericEntityReducer from '../Server/GenericEntityReducer'
import { commentSchema, receiveComments } from '../Comment/Comment'
import { projectSchema, fetchProject } from '../Project/Project'
import { ensureUserLoggedIn } from '../User/User'
import { toLatLngBounds } from '../MapBounds/MapBounds'
import { addError, addServerError } from '../Error/Error'
import AppErrors from '../Error/AppErrors'
import { RECEIVE_CHALLENGES, REMOVE_CHALLENGE }
       from './ChallengeActions'
import { ChallengeStatus } from './ChallengeStatus/ChallengeStatus'
import { zeroTaskActions } from '../Task/TaskAction/TaskAction'
import { parseQueryString, RESULTS_PER_PAGE, SortOptions }
       from '../Search/Search'
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
    virtualParents: [ projectSchema() ],
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
  _each(normalizedEntities.challenges, c => {
    if (c.dataOriginDate) {
      c.dataOriginDate = format(parse(c.dataOriginDate), 'YYYY-MM-DD')
    }
  })
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
export const fetchFeaturedChallenges = function(limit = RESULTS_PER_PAGE) {
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
 * Retrieve a listing of challenges (that include featured, popular, and newest)
 * up to the given limit.
 *
 * @param {array} projectIds
 * @param {number} limit
 */
 export const fetchPreferredChallenges = function(limit = RESULTS_PER_PAGE) {
   return function(dispatch) {
     return new Endpoint(
       api.challenges.preferred,
       {schema: {"popular": [ challengeSchema() ],
                 "featured": [ challengeSchema() ],
                 "newest": [ challengeSchema() ]},
        params: {limit}}
     ).execute().then(normalizedResults => {
       const result = normalizedResults.result
       const challenges = normalizedResults.entities.challenges

       _each(result.popular, (challenge) => challenges[challenge].popular = true)
       _each(result.newest, (challenge) => challenges[challenge].newest = true)
       _each(result.featured, (challenge) => challenges[challenge].featured = true)

       dispatch(receiveChallenges(normalizedResults.entities))

       return normalizedResults
     }).catch((error) => {
       dispatch(addError(AppErrors.challenge.fetchFailure))
       console.log(error.response || error)
     })
   }
 }

/**
 * Retrieve a listing of challenges in the given projects, up to the given limit.
 *
 * @param {array} projectIds
 * @param {number} limit
 */
export const fetchProjectChallengeListing = function(projectIds, onlyEnabled=false, limit = -1) {
  return function(dispatch) {
    return new Endpoint(
      api.challenges.listing,
      {
        schema: [ challengeSchema() ],
        params: {
          projectIds: _isArray(projectIds) ? projectIds.join(',') : projectIds,
          onlyEnabled,
          limit,
        }
      }
    ).execute().then(normalizedResults => {
      dispatch(receiveChallenges(normalizedResults.entities))
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

/**
 * Execute a challenge search, using extendedFind, from the given challenges
 * search object
 */
export const performChallengeSearch = function(searchObject, limit=RESULTS_PER_PAGE) {
  const sortCriteria = _get(searchObject, "sort", {})
  const filters = _get(searchObject, "filters", {})
  const queryString = _get(searchObject, "query")
  const page = _get(searchObject, "page.currentPage")
  let bounds = null

  if (filters && !_isUndefined(filters.location)) {
    bounds = _get(searchObject, "mapBounds.bounds")
  }

  const challengeStatus = [ChallengeStatus.ready,
                           ChallengeStatus.partiallyLoaded,
                           ChallengeStatus.none,
                           ChallengeStatus.empty]

  return extendedFind({
    searchQuery: queryString,
    filters,
    sortCriteria,
    bounds,
    page,
    challengeStatus
  }, limit)
}

/**
 * Fetches challenges that contain any of the given criteria
 * (including: keywords/tags, column to sort results by, filters),
 * up to the given limit.
 *
 * @param {object} criteria - criteria to include in search. Can include keys:
 *                            'searchQuery', 'filters', 'onlyEnabled', 'bounds'
 *                            'sortCriteria.sortBy', 'sortCrtiera.direction',
                              'page', 'challengeStatus'
 * @param {number} limit
 */
export const extendedFind = function(criteria, limit=RESULTS_PER_PAGE) {
  const queryString = criteria.searchQuery
  const filters = criteria.filters || {}
  const onlyEnabled = _isUndefined(criteria.onlyEnabled) ?
                          true : criteria.onlyEnabled

  const bounds = criteria.bounds
  const sortBy = _get(criteria, 'sortCriteria.sortBy', SortOptions.popular)
  const direction = (_get(criteria, 'sortCriteria.direction') || 'DESC').toUpperCase()
  const sort = sortBy ? `${sortBy}` : null
  const page = _isFinite(criteria.page) ? criteria.page : 0
  const challengeStatus = criteria.challengeStatus

  return function(dispatch) {
    const queryParts = parseQueryString(queryString)

    // setup query parameters desired by server.
    // ce: limit to enabled challenges
    // pe: limit to enabled projects
    // ps: limit to projects matching name search
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

    if (_isString(filters.project)) {
      queryParams.ps = filters.project
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

    queryParams.sort = sort
    queryParams.order = direction
    queryParams.page = page * limit

    if (challengeStatus) {
      queryParams.cStatus = challengeStatus.join(',')
    }

    if (bounds) {
      const boundsObject = toLatLngBounds(bounds)
      queryParams.bb = boundsObject.toBBoxString()
    }

    return new Endpoint(
      api.challenges.search,
      {schema: [ challengeSchema() ],
        params: queryParams}
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
export const fetchChallengeActions = function(challengeId = null, suppressReceive = false,
                                              criteria) {
  const searchParameters = {}
  if (criteria) {
    if (criteria.status) {
      searchParameters.tStatus = criteria.status
    }
    if (criteria.reviewStatus) {
      searchParameters.trStatus = criteria.reviewStatus
    }
    if (criteria.priorities) {
      searchParameters.priority = criteria.priorities
    }
  }

  return function(dispatch) {
    const challengeActionsEndpoint = new Endpoint(
      _isFinite(challengeId) ? api.challenge.actions : api.challenges.actions,
      {schema: [ challengeSchema() ], variables: {id: challengeId},
       params:{...searchParameters, includeByPriority: true}}
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

      if (!suppressReceive) {
        dispatch(receiveChallenges(normalizedResults.entities))
      }
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

/**
 * Fetch action metrics for all challenges in the given project.
 */
export const fetchProjectChallengeActions = function(projectId, onlyEnabled=false) {
  return function(dispatch) {
    return new Endpoint(
      api.challenges.actions,
      {schema: [ challengeSchema() ], params: {projectList: projectId, onlyEnabled,
                                               includeByPriority: true}}
    ).execute().then(normalizedResults => {
      dispatch(receiveChallenges(normalizedResults.entities))
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
 * Fetch challenge comments for the given project
 */
export const fetchProjectChallengeComments = function(projectId) {
  return function(dispatch) {
    return new Endpoint(
      api.project.comments, {variables: {id: projectId}}
    ).execute().then(rawComments => {
      const normalizedComments = normalize(rawComments, [ commentSchema() ])
      dispatch(receiveComments(normalizedComments.entities))

      // Group comments by challenge and update challenges.
      const commentsByChallenge = _groupBy(rawComments, 'challengeId')
      const normalizedChallenges = {
        challenges: _fromPairs(_map(commentsByChallenge, (comments, challengeId) => [
          parseInt(challengeId, 10), {
          id: parseInt(challengeId, 10),
          comments: _map(comments, 'id'),
        }]))
      }
      dispatch(receiveChallenges(normalizedChallenges))
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
 * Fetch all task property keys on the challenge
 */
export const fetchPropertyKeys = function(challengeId) {
  return new Endpoint(
    api.challenge.propertyKeys,
    {
      schema: {},
      variables: {id: challengeId},
    }
  ).execute().then(normalizedResults => {
    return _get(normalizedResults, 'result.keys', [])
  }).catch((error) => {
    console.log(error.response || error)
  })
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
      const challenge = normalizedResults.entities.challenges[normalizedResults.result]

      // If there are no virtual parents then this field will not be set by server
      // so we need to indicate it's empty.
      if (_isUndefined(challenge.virtualParents)) {
        challenge.virtualParents = []
      }

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
        ['blurb', 'challengeType', 'checkinComment', 'checkinSource', 'customBasemap',
        'defaultBasemap', 'defaultBasemapId', 'defaultPriority', 'defaultZoom',
        'description', 'difficulty', 'enabled', 'featured', 'highPriorityRule', 'id',
        'instruction', 'localGeoJSON', 'lowPriorityRule', 'maxZoom',
        'mediumPriorityRule', 'minZoom', 'name', 'overpassQL', 'parent',
        'remoteGeoJson', 'status', 'tags', 'updateTasks', 'virtualParents',
        'exportableProperties', 'dataOriginDate'])

      if (challengeData.dataOriginDate) {
        // Set the timestamp on the dataOriginDate so we get proper timezone info.
        challengeData.dataOriginDate = parse(challengeData.dataOriginDate).toISOString()
      }

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
      }).catch(serverError => {
        if (isSecurityError(serverError)) {
          dispatch(ensureUserLoggedIn()).then(() =>
            dispatch(addError(AppErrors.user.unauthorized))
          )
        }
        else {
          console.log(serverError.response || serverError)
          dispatch(addServerError(AppErrors.challenge.saveFailure, serverError))

          // Reload challenge data to ensure our local store is in sync with the
          // server in case optimistic changes were made.
          dispatch(fetchChallenge(challengeData.id))
        }
      })
    })
  }
}

/**
 * Send challenge GeoJSON to the server. This is primarily intended for
 * line-by-line GeoJSON, which must be submitted separately from the challenge,
 * but standard geoJSON files can also be accommodated (set lineByLine to false
 * in that case).
 *
 * If removeUnmatchedTasks is set to true, then incomplete tasks will be removed
 * prior to processing of updated sourced data
 */
export const uploadChallengeGeoJSON = function(challengeId, geoJSON, lineByLine=true, removeUnmatchedTasks=false,
                                               dataOriginDate) {
  return function(dispatch) {
    // Server expects the file in a form part named "json"
    const formData = new FormData()
    formData.append(
      'json',
      new File([geoJSON], `challenge_${challengeId}_tasks_${Date.now()}.geojson`)
    )

    if (dataOriginDate) {
      // Set the timestamp on the dataOriginDate so we get proper timezone info.
      dataOriginDate = parse(dataOriginDate).toISOString()
    }


    return new Endpoint(
      api.challenge.uploadGeoJSON, {
        variables: {id: challengeId},
        params: {lineByLine, removeUnmatched: removeUnmatchedTasks, dataOriginDate},
        formData,
      }
    ).execute()
  }
}

/**
 * Set whether the given challenge is enabled (publicly visible) or not.
 */
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

/**
 * Rebuild tasks in the given challenge
 *
 * If removeUnmatchedTasks is set to true, then incomplete tasks that don't
 * match a task in the updated source data will be removed
 */
export const rebuildChallenge = function(challengeId, removeUnmatchedTasks=false) {
  return function(dispatch) {
    return new Endpoint(
      api.challenge.rebuild, {
        variables: {id: challengeId},
        params: {removeUnmatched: removeUnmatchedTasks},
      }
    ).execute().then(() =>
      fetchChallenge(challengeId)(dispatch) // Refresh challenge data
    ).catch(error => {
      if (isSecurityError(error)) {
        dispatch(ensureUserLoggedIn()).then(() =>
          dispatch(addError(AppErrors.user.unauthorized))
        )
      }
      else {
        dispatch(addError(AppErrors.challenge.rebuildFailure))
        console.log(error.response || error)
      }
    })
  }
}

/**
 * Move the given challenge to the given project.
 */
export const moveChallenge = function(challengeId, toProjectId) {
  return function(dispatch) {
    return new Endpoint(
      api.challenge.move,
      {variables: {challengeId, projectId: toProjectId}}
    ).execute().then(() =>
      fetchChallenge(challengeId)(dispatch) // Refresh challenge data
    ).catch(error => {
      if (isSecurityError(error)) {
        dispatch(ensureUserLoggedIn()).then(() =>
          dispatch(addError(AppErrors.user.unauthorized))
        )
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

      if (isSecurityError(error)) {
        dispatch(ensureUserLoggedIn()).then(() =>
          dispatch(addError(AppErrors.user.unauthorized))
        )
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
export const fetchParentProject = function(dispatch, normalizedChallengeResults) {
  const challenge = challengeResultEntity(normalizedChallengeResults)

  if (challenge) {
    return dispatch(fetchProject(challenge.parent))
  }
}

/**
 * Search for keyword by prefix. Resolves with a (possibly empty) list of
 * results.
 */
export const findKeyword = function(keywordPrefix, tagType = null) {
  return new Endpoint(api.keywords.find, {params: {prefix: keywordPrefix, tagType}}).execute()
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

    if (_isArray(entity.virtualParents)) {
      mergedState[entity.id].virtualParents = entity.virtualParents
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
