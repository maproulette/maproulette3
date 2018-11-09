import _uniqueId from 'lodash/uniqueId'
import _cloneDeep from 'lodash/cloneDeep'
import _set from 'lodash/set'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import _omit from 'lodash/omit'
import _fromPairs from 'lodash/fromPairs'
import _map from 'lodash/map'
import messages from './Messages'

import { fromLatLngBounds } from '../MapBounds/MapBounds'

// redux actions
export const SET_SEARCH = 'SET_SEARCH'
export const CLEAR_SEARCH = 'CLEAR_SEARCH'
export const FETCHING_RESULTS = 'FETCHING_RESULTS'
export const RECEIVED_RESULTS = 'RECEIVED_RESULTS'

export const SET_SORT = 'SET_SORT'
export const REMOVE_SORT = 'REMOVE_SORT'

export const SET_PAGE = 'SET_PAGE'
export const REMOVE_PAGE = 'REMOVE_PAGE'

export const SET_FILTERS = 'SET_FILTERS'
export const REMOVE_FILTERS = 'REMOVE_FILTERS'
export const CLEAR_FILTERS = 'CLEAR_FILTERS'

export const SET_CHALLENGE_SEARCH_MAP_BOUNDS = 'SET_CHALLENGE_SEARCH_MAP_BOUNDS'
export const SET_CHALLENGE_BROWSE_MAP_BOUNDS = 'SET_CHALLENGE_BROWSE_MAP_BOUNDS'
export const SET_TASK_MAP_BOUNDS = 'SET_TASK_MAP_BOUNDS'
export const SET_CHALLENGE_OWNER_MAP_BOUNDS = 'SET_CHALLENGE_OWNER_MAP_BOUNDS'


// Sort options
export const SORT_NAME = 'name'
export const SORT_CREATED = 'created'
export const SORT_POPULARITY = 'popularity'
export const SORT_DEFAULT = 'default'
export const ALL_SORT_OPTIONS = [SORT_NAME, SORT_CREATED, SORT_POPULARITY, SORT_DEFAULT]

// Default Results Per page
export const RESULTS_PER_PAGE = 50

/** Returns object containing localized labels  */
export const sortLabels = intl => _fromPairs(
  _map(messages, (message, key) => [key, intl.formatMessage(message)])
)


/**
 * Parse the given raw query text that may include hashtags for keywords and
 * return a query object that contains separate fields for the tags and query
 * string, as well as easy access to the individual query and tag tokens.
 */
export const parseQueryString = function(rawQueryText) {
  const tagTokens = []
  const queryTokens = []

  if (_isEmpty(rawQueryText)) {
    return {
      tagTokens,
      tags: '',
      queryTokens,
      query: '',
      rawQueryText: '',
    }
  }

  const tokens = rawQueryText.split(/\s+/)
  for (let token of tokens) {
    if (token[0] === '#') {
      if (token.length > 1) {
        tagTokens.push(token.slice(1))
      }
    }
    else {
      queryTokens.push(token)
    }
  }

  return {
    tagTokens,
    tags: tagTokens.join(','),
    queryTokens,
    query: queryTokens.join(' '),
    rawQueryText,
  }
}

// redux action creators
export const setSearch = function(searchName, query) {
  return {
    type: SET_SEARCH,
    searchName,
    query,
  }
}

export const clearSearch = function(searchName) {
  return {
    type: CLEAR_SEARCH,
    searchName,
  }
}

export const setSort = function(searchName, sortCriteria) {
  return {
    type: SET_SORT,
    searchName,
    sortCriteria,
  }
}

export const removeSort = function(searchName, criteriaNames) {
  return {
    type: REMOVE_SORT,
    searchName,
    criteriaNames,
  }
}

export const setPage = function(searchName, page) {
  return {
    type: SET_PAGE,
    searchName,
    page,
  }
}

export const removePage = function(searchName, criteriaNames) {
  return {
    type: REMOVE_PAGE,
    searchName,
    criteriaNames,
  }
}

export const setFilters = function(searchName, filterCriteria) {
  return {
    type: SET_FILTERS,
    searchName,
    filterCriteria,
  }
}

export const removeFilters = function(searchName, criteriaNames) {
  return {
    type: REMOVE_FILTERS,
    searchName,
    criteriaNames,
  }
}

export const clearFilters = function(searchName) {
  return {
    type: CLEAR_FILTERS,
    searchName,
  }
}

/**
 * Set the given bounds of the challenge search map in the redux store as the current
 * bounds. If the bounds are being altered programatically in direct response
 * to a user action (as opposed to just panning or zooming around the map),
 * then set fromUserAction to true.
 *
 * @param bounds - either a LatLngBounds instance or an array of
 *       [west, south, east, north]
 *
 * @param {boolean} [fromUserAction=false] set to true to indicate the
 *        bounds were modified programatically in response to a user
 *        action, false if the bounds are simply being altered in response
 *        to normal panning and zooming.
 */
export const setChallengeSearchMapBounds = function(searchName, bounds, fromUserAction=false) {
  return {
    type: SET_CHALLENGE_SEARCH_MAP_BOUNDS,
    searchName,
    bounds: fromLatLngBounds(bounds),
    fromUserAction,
  }
}

/**
 * Update the redux store with the given bounds of the challenge (browsing)
 * map.
 *
 * @param bounds - either a LatLngBounds instance or an array of
 *       [west, south, east, north]
 */
export const setChallengeBrowseMapBounds = function(searchName, challengeId, bounds, zoom) {
  return {
    type: SET_CHALLENGE_BROWSE_MAP_BOUNDS,
    searchName,
    challengeId,
    bounds: fromLatLngBounds(bounds),
    zoom,
  }
}

/**
 * Set the given bounds of the task map in the redux store as the current
 * bounds. If the bounds are being altered programatically in direct response
 * to a user action (as opposed to just panning or zooming around the map),
 * then set fromUserAction to true.
 *
 * @param bounds - either a LatLngBounds instance or an array of
 *       [west, south, east, north]
 *
 * @param {boolean} [fromUserAction=false] set to true to indicate the
 *        bounds were modified programatically in response to a user
 *        action, false if the bounds are simply being altered in response
 *        to normal panning and zooming.
 */
export const setTaskMapBounds = function(searchName, taskId, bounds, zoom, fromUserAction=false) {
  return {
    type: SET_TASK_MAP_BOUNDS,
    searchName,
    taskId,
    bounds: fromLatLngBounds(bounds),
    zoom,
    fromUserAction,
  }
}

/**
 * Update the redux store with the given bounds of a challenge-owner map.
 *
 * @param bounds - either a LatLngBounds instance or an array of
 *       [west, south, east, north]
 */
export const setChallengeOwnerMapBounds = function(searchName, challengeId, bounds, zoom) {
  return {
    type: SET_CHALLENGE_OWNER_MAP_BOUNDS,
    searchName,
    challengeId,
    bounds: fromLatLngBounds(bounds),
    zoom,
  }
}


// The fetchId is used to help keep track of the latest
// fetch request.
export const fetchingResults = function(searchName, fetchId) {
  return {
    type: FETCHING_RESULTS,
    searchName,
    fetchId,
  }
}

// The fetchId is used to help keep track of multiple
// simultaneous fetches.
export const receivedResults = function(searchName, fetchId) {
  return {
    type: RECEIVED_RESULTS,
    searchName,
    fetchId,
    timestamp: (new Date()).getTime(),
  }
}

// async action creators
export const performSearch = function(searchName, query, asyncSearchAction) {
  return function(dispatch) {
    const fetchId = _uniqueId()
    if (!query || query.length < 2) {
      return null
    }

    const resultsPerPage = _get(query, 'page.resultsPerPage')

    dispatch(fetchingResults(searchName, fetchId))
    return dispatch(
      asyncSearchAction(query, resultsPerPage)
    ).then(() => dispatch(receivedResults(searchName, fetchId)))
    .catch((error) => {
      // 404 indicates no results.
      if (error.response && error.response.status === 404) {
        dispatch(receivedResults(searchName, fetchId))
      }
    })
  }
}


// redux reducers
export const currentSearch = function(state={}, action) {
  let mergedState = null

  switch(action.type) {
    case SET_SEARCH:
      mergedState = _cloneDeep(state)
      _set(mergedState, `${action.searchName}.query`, action.query)
      _set(mergedState, `${action.searchName}.page`, null)
      return mergedState
    case CLEAR_SEARCH:
      mergedState = _cloneDeep(state)
      _set(mergedState, `${action.searchName}.query`, null)
      _set(mergedState, `${action.searchName}.page`, null)
      return mergedState
    case FETCHING_RESULTS:
      mergedState = _cloneDeep(state)
      _set(mergedState, `${action.searchName}.meta.fetchingResults`, action.fetchId)
      return mergedState
    case RECEIVED_RESULTS:
      // If the fetchId of the action doesn't match the latest fetchId in the
      // state, ignore this action since we're still fetching other results.
      if (action.fetchId !== _get(state, `${action.searchName}.meta.fetchingResults`)) {
        return state
      }
      else {
        mergedState = _cloneDeep(state)
        _set(mergedState, `${action.searchName}.meta.fetchingResults`, null)
        _set(mergedState, `${action.searchName}.meta.receivedAt`, action.timestamp)
        return mergedState
      }
    case SET_SORT:
      mergedState = _cloneDeep(state)
      _set(mergedState, `${action.searchName}.sort`,
            Object.assign({}, _get(state, `${action.searchName}.sort`), action.sortCriteria))
      _set(mergedState, `${action.searchName}.page`, null)
      return mergedState

    case REMOVE_SORT:
      mergedState = _cloneDeep(state)
      _set(mergedState, `${action.searchName}.sort`,
            Object.assign({}, _omit(_get(state, `${action.searchName}.sort`), action.criteriaNames)))
      _set(mergedState, `${action.searchName}.page`, null)
      return mergedState

    case SET_PAGE:
      mergedState = _cloneDeep(state)
      _set(mergedState, `${action.searchName}.page`,
            Object.assign({}, _get(state, `${action.searchName}.page`), action.page))
      return mergedState

    case REMOVE_PAGE:
      mergedState = _cloneDeep(state)
      _set(mergedState, `${action.searchName}.page`,
            Object.assign({}, _omit(_get(state, `${action.searchName}.page`), action.criteriaNames)))
      return mergedState

    case SET_FILTERS:
      mergedState = _cloneDeep(state)
      _set(mergedState, `${action.searchName}.filters`,
            Object.assign({}, _get(state, `${action.searchName}.filters`), action.filterCriteria))
      _set(mergedState, `${action.searchName}.page`, null)
      return mergedState

    case REMOVE_FILTERS:
      mergedState = _cloneDeep(state)
      _set(mergedState, `${action.searchName}.filters`,
            Object.assign({}, _omit(_get(state, `${action.searchName}.filters`), action.criteriaNames)))
      _set(mergedState, `${action.searchName}.page`, null)
      return mergedState

    case CLEAR_FILTERS:
      return Object.assign({}, _omit(state, `${action.searchName}.filters`))

    case SET_CHALLENGE_SEARCH_MAP_BOUNDS:
      mergedState = _cloneDeep(state)
      _set(mergedState, `${action.searchName}.mapBounds`,
            Object.assign({}, _get(state, `${action.searchName}.mapBounds`),
              {
                bounds: action.bounds,
                fromUserAction: action.fromUserAction,
              }))
      return mergedState

    case SET_CHALLENGE_BROWSE_MAP_BOUNDS:
      mergedState = _cloneDeep(state)
      _set(mergedState, `${action.searchName}.mapBounds`,
            Object.assign({}, _get(state, `${action.searchName}.mapBounds`),
              {
                challengeId: action.challengeId,
                bounds: action.bounds,
                zoom: action.zoom,
              }))
      return mergedState

    case SET_TASK_MAP_BOUNDS:
      mergedState = _cloneDeep(state)
      _set(mergedState, `${action.searchName}.mapBounds`,
            Object.assign({}, _get(state, `${action.searchName}.mapBounds`),
              {
                taskId: action.taskId,
                bounds: action.bounds,
                zoom: action.zoom,
                fromUserAction: action.fromUserAction,
              }))
      return mergedState

    case SET_CHALLENGE_OWNER_MAP_BOUNDS:
      mergedState = _cloneDeep(state)
      _set(mergedState, `${action.searchName}.mapBounds`,
          Object.assign({}, _get(state, `${action.searchName}.mapBounds`),
            {
              challengeId: action.challengeId,
              bounds: action.bounds,
              zoom: action.zoom,
              updatedAt: Date.now(),
            }))
      return mergedState

    default:
      return state
  }
}
