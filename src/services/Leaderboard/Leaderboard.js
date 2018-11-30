import { defaultRoutes as api } from '../Server/Server'
import _isArray from 'lodash/isArray'
import Endpoint from '../Server/Endpoint'

// Default leaderboard count
export const DEFAULT_LEADERBOARD_COUNT = 10


/**
 * Retrieve leaderboard data from the server for the given date range and
 * filters, returning a Promise that resolves to the leaderboard data. Note
 * that leaderboard data is *not* stored in the redux store.
 */
export const fetchLeaderboard = function(numberMonths=1, onlyEnabled=true,
                                         forProjects=null, forChallenges=null,
                                         forUsers=null, limit=DEFAULT_LEADERBOARD_COUNT) {
  const params = {
    limit,
    onlyEnabled
  }

  initializeLeaderboardParams(params, numberMonths, forProjects, forChallenges, forUsers)

  return new Endpoint(api.users.leaderboard, {params}).execute()
}

/**
 * Retrieve leaderboard data for a user from the server for the given date range and
 * filters, returning a Promise that resolves to the leaderboard data. Note
 * that leaderboard data is *not* stored in the redux store.
 */
export const fetchLeaderboardForUser = function(userId, bracket=0, numberMonths=1,
                                         onlyEnabled=true, forProjects=null, forChallenges=null) {
  const params = {
    bracket,
    onlyEnabled
  }

  initializeLeaderboardParams(params, numberMonths, forProjects, forChallenges)

  return new Endpoint(api.users.userLeaderboard, {variables: {id: userId}, params}).execute()
}


const initializeLeaderboardParams = function (params, numberMonths,
                                              forProjects, forChallenges, forUsers) {
  params.monthDuration = numberMonths

  if (_isArray(forProjects)) {
    params.projectIds = forProjects.join(',')
  }

  if (_isArray(forChallenges)) {
    params.challengeIds = forChallenges.join(',')
  }

  if (_isArray(forUsers)) {
    params.userIds = forUsers.join(',')
  }
}
