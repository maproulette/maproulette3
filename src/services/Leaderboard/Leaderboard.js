import { defaultRoutes as api } from '../Server/Server'
import _isArray from 'lodash/isArray'
import Endpoint from '../Server/Endpoint'
import startOfDay from 'date-fns/start_of_day'

/**
 * Retrieve leaderboard data from the server for the given date range and
 * filters, returning a Promise that resolves to the leaderboard data. Note
 * that leaderboard data is *not* stored in the redux store.
 */
export const fetchLeaderboard = function(startDate=null, endDate=null, onlyEnabled=true,
                                         forProjects=null, forChallenges=null, limit=10) {
  const params = {
    limit,
  }

  if (startDate) {
    params.start = startOfDay(startDate).toISOString()
  }

  if (endDate) {
    params.end = startOfDay(endDate).toISOString()
  }

  if (_isArray(forProjects)) {
    params.projectIds = forProjects.join(',')
  }

  if (_isArray(forChallenges)) {
    params.challengeIds = forChallenges.join(',')
  }

  return new Endpoint(api.users.leaderboard, {params}).execute()
}
