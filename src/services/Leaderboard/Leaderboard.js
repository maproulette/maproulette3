import { defaultRoutes as api } from '../Server/Server'
import Endpoint from '../Server/Endpoint'
import RequestStatus from '../Server/RequestStatus'
import { addError } from '../Error/Error'
import AppErrors from '../Error/AppErrors'
import startOfDay from 'date-fns/start_of_day'

// redux actions
const RECEIVE_LEADERBOARD = 'RECEIVE_LEADERBOARD'
const CLEAR_LEADERBOARD = 'CLEAR_LEADERBOARD'

// redux action creators

/**
 * Add or replace the leaderboard in the redux store
 */
export const receiveLeaderboard = function(leaderboard, status=RequestStatus.success) {
  return {
    type: RECEIVE_LEADERBOARD,
    leaderboard,
    status,
    receivedAt: Date.now(),
  }
}

/**
 * Clear the leaderboard from the redux store
 */
export const clearLeaderboard = function() {
  return {
    type: CLEAR_LEADERBOARD,
    receivedAt: Date.now()
  }
}


// async action creators

/**
 * Retrieve leaderboard data from the server for the given date range.
 * If no dates are given, defaults to past 30 days.
 */
export const fetchLeaderboard = function(startDate, endDate, limit=10) {
  return function(dispatch) {
    dispatch(receiveLeaderboard([], RequestStatus.inProgress))

    const params = {
      limit,
    }

    if (startDate) {
      params.start = startOfDay(startDate).toISOString()
    }

    if (endDate) {
      params.end = startOfDay(endDate).toISOString()
    }

    return new Endpoint(
      api.users.leaderboard, {
        params,
      }
    ).execute().then(leaderboardData => {
      dispatch(receiveLeaderboard(leaderboardData, RequestStatus.success))

      return leaderboardData
    }).catch((error) => {
      dispatch(addError(AppErrors.leaderboard.fetchFailure))
      console.log(error.response || error)
    })
  }
}

// redux reducers
export const currentLeaderboard = function(state={}, action) {
  if (action.type === RECEIVE_LEADERBOARD) {
    return {
      leaderboard: action.leaderboard,
      loading: action.status === RequestStatus.inProgress,
    }
  }
  else if (action.type === CLEAR_LEADERBOARD) {
    return {}
  }
  else {
    return state
  }
}
