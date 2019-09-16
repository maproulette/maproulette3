import { defaultRoutes as api } from '../Server/Server'
import _isArray from 'lodash/isArray'
import Endpoint from '../Server/Endpoint'
import startOfMonth from 'date-fns/start_of_month'

// Default leaderboard count
export const DEFAULT_LEADERBOARD_COUNT = 10

// Current Month duration
export const CURRENT_MONTH = 0

/**
 * Retrieve leaderboard data from the server for the given date range and
 * filters, returning a Promise that resolves to the leaderboard data. Note
 * that leaderboard data is *not* stored in the redux store.
 */
export const fetchLeaderboard = function(numberMonths=null, onlyEnabled=true,
                                         forProjects=null, forChallenges=null,
                                         forUsers=null, forCountries=null,
                                         limit=10) {
  const params = {
    limit,
    onlyEnabled
  }

  initializeLeaderboardParams(params, numberMonths, forProjects, forChallenges, forUsers, forCountries)

  return new Endpoint(api.users.leaderboard, {params}).execute()
}

/**
 * Retrieve leaderboard data for a user from the server for the given date range and
 * filters, returning a Promise that resolves to the leaderboard data. Note
 * that leaderboard data is *not* stored in the redux store.
 */
export const fetchLeaderboardForUser = function(userId, bracket=0, numberMonths=1,
                                         onlyEnabled=true, forProjects=null, forChallenges=null,
                                         forUsers=null, forCountries=null) {
  const params = {
    bracket,
    onlyEnabled
  }
  initializeLeaderboardParams(params, numberMonths, forProjects, forChallenges, null, forCountries)

  return new Endpoint(api.users.userLeaderboard, {variables: {id: userId}, params}).execute()
}


const initializeLeaderboardParams = function (params, numberMonths,
                                              forProjects, forChallenges,
                                              forUsers, forCountries) {
  if (numberMonths === CURRENT_MONTH) {
    params.start = startOfMonth(new Date()).toISOString()
    params.end = new Date().toISOString()
  }
  else {
    params.monthDuration = numberMonths
  }

  if (_isArray(forProjects)) {
    params.projectIds = forProjects.join(',')
  }

  if (_isArray(forChallenges)) {
    params.challengeIds = forChallenges.join(',')
  }

  if (_isArray(forUsers)) {
    params.userIds = forUsers.join(',')
  }

  if (_isArray(forCountries)) {
    params.countryCodes = forCountries.join(',')
  }
}
