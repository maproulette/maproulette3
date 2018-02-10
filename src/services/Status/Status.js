import _cloneDeep from 'lodash/cloneDeep'
import _get from 'lodash/get'
import _pull from 'lodash/pull'

/**
 * Manage application status so that it can be reflected in various components
 * as appropriate.
 */

// status names
export const FETCHING_CHALLENGES_STATUS = 'FETCHING_CHALLENGES_STATUS'
export const CHECKING_LOGIN_STATUS = 'CHECKING_LOGIN_STATUS'

// redux actions
export const PUSH_FETCHING_CHALLENGES = 'PUSH_FETCHING_CHALLENGES'
export const POP_FETCHING_CHALLENGES = 'POP_FETCHING_CHALLENGES'
export const CLEAR_FETCHING_CHALLENGES = 'CLEAR_FETCHING_CHALLENGES'
export const SET_CHECKING_LOGIN_STATUS = 'SET_CHECKING_LOGIN_STATUS'
export const CLEAR_CHECKING_LOGIN_STATUS = 'CLEAR_CHECKING_LOGIN_STATUS'

// redux action creators

export const pushFetchChallenges = function(fetchId) {
  return {
    type: PUSH_FETCHING_CHALLENGES,
    fetchId,
  }
}

export const popFetchChallenges = function(fetchId) {
  return {
    type: POP_FETCHING_CHALLENGES,
    fetchId,
  }
}

export const clearFetchingChallenges = function() {
  return {
    type: CLEAR_FETCHING_CHALLENGES,
  }
}

export const setCheckingLoginStatus = function() {
  return {
    type: SET_CHECKING_LOGIN_STATUS,
  }
}

export const clearCheckingLoginStatus = function() {
  return {
    type: CLEAR_CHECKING_LOGIN_STATUS,
  }
}

// redux reducers
export const currentStatus = function(state={}, action) {
  let merged = null
  let fetchArray = null

  switch(action.type) {
    case PUSH_FETCHING_CHALLENGES:
      merged = _cloneDeep(state)
      fetchArray = _get(merged, FETCHING_CHALLENGES_STATUS, [])
      fetchArray.push(action.fetchId)
      merged[FETCHING_CHALLENGES_STATUS] = fetchArray
      
      return merged

    case POP_FETCHING_CHALLENGES:
      merged = _cloneDeep(state)
      fetchArray = _get(merged, FETCHING_CHALLENGES_STATUS, [])
      _pull(fetchArray, action.fetchId)
      merged[FETCHING_CHALLENGES_STATUS] = fetchArray

      return merged

    case CLEAR_FETCHING_CHALLENGES:
      return Object.assign({}, state, {FETCHING_CHALLENGES_STATUS: []})

    case SET_CHECKING_LOGIN_STATUS:
      return Object.assign({}, state, {CHECKING_LOGIN_STATUS: true})

    case CLEAR_CHECKING_LOGIN_STATUS:
      return Object.assign({}, state, {CHECKING_LOGIN_STATUS: false})

    default:
      return state
  }
}
