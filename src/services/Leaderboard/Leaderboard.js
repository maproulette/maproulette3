import { defaultRoutes as api } from '../Server/Server'
import _isArray from 'lodash/isArray'
import Endpoint from '../Server/Endpoint'
import { startOfMonth, endOfDay } from 'date-fns'
import { CHALLENGE_INCLUDE_LOCAL } from '../Challenge/Challenge'
import { addError } from '../Error/Error'
import AppErrors from '../Error/AppErrors'

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
const GLOBAL_LEADERBOARD_CACHE = "globalLeaderboard";
const USER_LEADERBOARD_CACHE = "userLeaderboard";

/**
 * Retrieve leaderboard data from the server for the given date range and
 * filters, returning a Promise that resolves to the leaderboard data. Note
 * that leaderboard data is *not* stored in the redux store.
 */
export const fetchLeaderboard = (numberMonths=null, onlyEnabled=true,
                                       forProjects=null, forChallenges=null,
                                       forUsers=null, forCountries=null,
                                       limit=10, startDate=null, endDate=null) => {
  const params = {
    limit,
    onlyEnabled
  }

  return async function (dispatch) {
    initializeLeaderboardParams(params, numberMonths, forProjects, forChallenges,
    forUsers, forCountries, startDate, endDate)

    try {
      let results;

      if (forProjects && forProjects.length > 0) {
        const projectId = forProjects[0];
        results = await new Endpoint(api.user.projectLeaderboard, { params: { ...params, projectId } }).execute()
      } else if (forChallenges && forChallenges.length > 0) {
        const challengeId = forChallenges[0];
        results = await new Endpoint(api.user.challengeLeaderboard, { params: { ...params, challengeId } }).execute()
      } else {
        results = await new Endpoint(api.users.leaderboard, { params }).execute()
      }

      return results
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
       //Prevent error modals on leaderboard widgets, and retain error modal on leaderboard page
      if(!forProjects && !forChallenges){
        dispatch(addError(AppErrors.leaderboard.fetchFailure))
      }
      return []
    }
  }
}

/**
 * Retrieve leaderboard data for a user from the server for the given date range and
 * filters, returning a Promise that resolves to the leaderboard data. Note
 * that leaderboard data is *not* stored in the redux store.
 */
export const fetchLeaderboardForUser = (userId, bracket=0, numberMonths=1,
                                         onlyEnabled=true, forProjects=null, forChallenges=null,
                                         forUsers, forCountries=null, startDate=null,
                                         endDate=null) => {
  const params = {
    bracket,
    onlyEnabled
  }

  return async function (dispatch) {

  const variables = {
    id: userId
  }

  initializeLeaderboardParams(params, numberMonths, forProjects, forChallenges,
                              null, forCountries, startDate, endDate)

    try {
      let results;

      if (forProjects && forProjects.length > 0) {
        //disabling project user ranks for now
        //const projectId = forProjects[0];
        //results = await new Endpoint(api.user.projectLeaderboardForUser, { params: { ...params, projectId }, variables: { userId } }).execute()
        return []
      } else if (forChallenges && forChallenges.length > 0) {
        const challengeId = forChallenges[0];
        results = await new Endpoint(api.user.challengeLeaderboardForUser, { params: { ...params, challengeId }, variables: { userId } }).execute()
      } else {
        results = await new Endpoint(api.users.userLeaderboard, {variables, params}).execute()
      }

      return results;
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      dispatch(addError(AppErrors.leaderboard.userFetchFailure))
      return null
    }
  }
}

/**
 * Retrieve reviewer leaderboard data from the server for the given date range and
 * filters, returning a Promise that resolves to the leaderboard data. Note
 * that leaderboard data is *not* stored in the redux store.
 */
export const fetchReviewerLeaderboard = (numberMonths=null, onlyEnabled=true,
                                                 forProjects=null, forChallenges=null,
                                                 forUsers=null, forCountries=null,
                                                 limit=10, startDate=null, endDate=null) => {
  
  const params = {
    limit,
    onlyEnabled
  }

  return async function (dispatch) {
    try {

      initializeLeaderboardParams(params, numberMonths, forProjects, forChallenges,
                                  forUsers, forCountries, startDate, endDate)
      const result = await new Endpoint(api.users.reviewerLeaderboard, {params}).execute()
      return result
    } catch (error) {
      console.error("Error in fetchReviewerLeaderboard:", error)
      dispatch(addError(AppErrors.leaderboard.reviewerLeaderboard))
      return []
    }
  }
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
