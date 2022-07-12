import { defaultRoutes as api } from '../Server/Server'
import _isArray from 'lodash/isArray'
import Endpoint from '../Server/Endpoint'
import startOfMonth from 'date-fns/start_of_month'
import endOfDay from 'date-fns/end_of_day'
import { CHALLENGE_INCLUDE_LOCAL } from '../Challenge/Challenge'

// Default leaderboard count
export const DEFAULT_LEADERBOARD_COUNT = 10

// Current Month duration
export const CURRENT_MONTH = 0

// Use custom dates
export const CUSTOM_RANGE = -2

// User Type 'mapper'
export const USER_TYPE_MAPPER = "mapper"

// User Type 'reviewer'
export const USER_TYPE_REVIEWER = "reviewer"

// one hour
const CACHE_TIME = 60 * 60 * 1000;
const GLOBAL_LEADERBOARD = "users";
const USER_LEADERBOARD = "user";

export const leaderboardCache = {
  get: (params, type) => {
    const cachedData = localStorage.getItem(`${type}::${JSON.stringify(params)}`);

    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      const currentTime = Date.now();
      console.log(currentTime, parsed.date + CACHE_TIME, typeof parsed.date)
      if (currentTime < parsed.date + CACHE_TIME) {
        return JSON.parse(cachedData)?.data;
      }
    }

    return false;
  },

  set: (params, data, type) => {
    const obj = JSON.stringify({
      date: Date.now(),
      data
    })

    localStorage.setItem(`${type}::${JSON.stringify(params)}`, obj)
  }
}

/**
 * Retrieve leaderboard data from the server for the given date range and
 * filters, returning a Promise that resolves to the leaderboard data. Note
 * that leaderboard data is *not* stored in the redux store.
 */
export const fetchLeaderboard = async (numberMonths=null, onlyEnabled=true,
                                         forProjects=null, forChallenges=null,
                                         forUsers=null, forCountries=null,
                                         limit=10, startDate=null, endDate=null) => {
  const params = {
    limit,
    onlyEnabled
  }

  initializeLeaderboardParams(params, numberMonths, forProjects, forChallenges,
                              forUsers, forCountries, startDate, endDate)

  const cachedLeaderboard = leaderboardCache.get(params, GLOBAL_LEADERBOARD);

  if (cachedLeaderboard) {
    return cachedLeaderboard;
  }

  const results = await new Endpoint(api.users.leaderboard, {params}).execute()

  leaderboardCache.set(params, results, GLOBAL_LEADERBOARD)

  return results
}

/**
 * Retrieve leaderboard data for a user from the server for the given date range and
 * filters, returning a Promise that resolves to the leaderboard data. Note
 * that leaderboard data is *not* stored in the redux store.
 */
export const fetchLeaderboardForUser = async (userId, bracket=0, numberMonths=1,
                                         onlyEnabled=true, forProjects=null, forChallenges=null,
                                         forUsers=null, forCountries=null, startDate=null,
                                         endDate=null) => {
  const params = {
    bracket,
    onlyEnabled
  }
  initializeLeaderboardParams(params, numberMonths, forProjects, forChallenges,
                              null, forCountries, startDate, endDate)

  const cachedLeaderboard = leaderboardCache.get(params, USER_LEADERBOARD);

  console.log(params, numberMonths, forProjects, forChallenges,
    null, forCountries, startDate, endDate)

  if (cachedLeaderboard) {
    return cachedLeaderboard;
  }

  const results = await new Endpoint(api.users.userLeaderboard, {variables: {id: userId}, params}).execute()

  leaderboardCache.set(params, results, USER_LEADERBOARD)

  return results;
}

/**
 * Retrieve reviewer leaderboard data from the server for the given date range and
 * filters, returning a Promise that resolves to the leaderboard data. Note
 * that leaderboard data is *not* stored in the redux store.
 */
export const fetchReviewerLeaderboard = function(numberMonths=null, onlyEnabled=true,
                                                 forProjects=null, forChallenges=null,
                                                 forUsers=null, forCountries=null,
                                                 limit=10, startDate=null, endDate=null) {
  const params = {
    limit,
    onlyEnabled
  }

  initializeLeaderboardParams(params, numberMonths, forProjects, forChallenges,
                              forUsers, forCountries, startDate, endDate)

  return new Endpoint(api.users.reviewerLeaderboard, {params}).execute()
}


export const initializeLeaderboardParams = function (params, numberMonths,
                                              forProjects, forChallenges,
                                              forUsers, forCountries,
                                              startDate, endDate) {
  if (numberMonths === CURRENT_MONTH) {
    params.start = startOfMonth(new Date()).toISOString()
    params.end = endOfDay(new Date()).toISOString()
  }
  else if (numberMonths === CUSTOM_RANGE && startDate && endDate) {
    params.start = new Date(startDate).toISOString()
    params.end = new Date(endDate).toISOString()
  }
  else {
    params.monthDuration = numberMonths || CURRENT_MONTH
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

  // We can include work on local challenges
  params.cLocal = CHALLENGE_INCLUDE_LOCAL
}
