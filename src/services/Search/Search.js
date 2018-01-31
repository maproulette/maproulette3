import _uniqueId from 'lodash/uniqueId'
import _cloneDeep from 'lodash/cloneDeep'
import _set from 'lodash/set'
import _get from 'lodash/get'

// redux actions
export const SET_SEARCH = 'SET_SEARCH'
export const CLEAR_SEARCH = 'CLEAR_SEARCH'
export const FETCHING_RESULTS = 'FETCHING_RESULTS'
export const RECEIVED_RESULTS = 'RECEIVED_RESULTS'

/**
 * Parse the given raw query text that may include hashtags for keywords and
 * return a query object that contains separate fields for the tags and query
 * string, as well as easy access to the individual query and tag tokens.
 */
export const parseQueryString = function(rawQueryText) {
  const tagTokens = []
  const queryTokens = []

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

    dispatch(fetchingResults(searchName, fetchId))
    return dispatch(
      asyncSearchAction(query)
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
      return mergedState
    case CLEAR_SEARCH:
      mergedState = _cloneDeep(state)
      _set(mergedState, `${action.searchName}.query`, null)
      return mergedState
    case FETCHING_RESULTS:
      mergedState = _cloneDeep(state)
      _set(mergedState, `${action.searchName}.fetchingResults`, action.fetchId)
      return mergedState
    case RECEIVED_RESULTS:
      // If the fetchId of the action doesn't match the latest fetchId in the
      // state, ignore this action since we're still fetching other results.
      if (action.fetchId !== _get(state, `${action.searchName}.fetchingResults`)) {
        return state
      }
      else {
        mergedState = _cloneDeep(state)
        _set(mergedState, `${action.searchName}.fetchingResults`, null)
        _set(mergedState, `${action.searchName}.receivedAt`, action.timestamp)
        return mergedState
      }
    default:
      return state
  }
}
