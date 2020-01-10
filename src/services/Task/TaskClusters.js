import uuidv1 from 'uuid/v1'
import uuidTime from 'uuid-time'
import RequestStatus from '../Server/RequestStatus'
import _isArray from 'lodash/isArray'
import _get from 'lodash/get'
import _isUndefined from 'lodash/isUndefined'
import { clearBoundedTasks } from './BoundedTask'
import { generateSearchParametersString } from '../Search/Search'
import { defaultRoutes as api } from '../Server/Server'
import { addError } from '../Error/Error'
import AppErrors from '../Error/AppErrors'

import Endpoint from '../Server/Endpoint'

// redux actions
const RECEIVE_TASK_CLUSTERS = 'RECEIVE_TASK_CLUSTERS'
const CLEAR_TASK_CLUSTERS = 'CLEAR_TASK_CLUSTERS'

// redux action creators
export const receiveTaskClusters = function(clusters,
                                            status=RequestStatus.success,
                                            fetchId) {
  return {
    type: RECEIVE_TASK_CLUSTERS,
    status,
    clusters,
    fetchId,
    receivedAt: Date.now(),
  }
}

/**
 * Clear the task clusters from the redux store
 */
export const clearTaskClusters = function() {
  return {
    type: CLEAR_TASK_CLUSTERS,
    receivedAt: Date.now()
  }
}

/**
 * Retrieve task clusters (up to the given number of points) matching the given
 * search criteria. Criteria should contains a filters object and optional
 * boundingBox string -- see Search.generateSearchParametersString for details
 * of supported filters
 */
export const fetchTaskClusters = function(challengeId, criteria, points=25) {
  return function(dispatch) {
    // The map is either showing task clusters or bounded tasks so we can't
    // have both in redux.
    dispatch(clearBoundedTasks())

    const fetchId = uuidv1()
    const filters = _get(criteria, 'filters', {})
    const searchParameters = generateSearchParametersString(filters,
                                                            criteria.boundingBox,
                                                            _get(criteria, 'savedChallengesOnly'),
                                                            null,
                                                            criteria.searchQuery)
    searchParameters.cid = challengeId

    // If we don't have a challenge Id then we need to do some limiting.
    if (!challengeId) {
      const onlyEnabled = _isUndefined(criteria.onlyEnabled) ?
                              true : criteria.onlyEnabled
      const challengeStatus = criteria.challengeStatus
      if (challengeStatus) {
        searchParameters.cStatus = challengeStatus.join(',')
      }

      // ce: limit to enabled challenges
      // pe: limit to enabled projects
      searchParameters.ce = onlyEnabled ? 'true' : 'false'
      searchParameters.pe = onlyEnabled ? 'true' : 'false'
    }

    return new Endpoint(
      api.challenge.taskClusters, {
        params: {points, ...searchParameters},
        json: filters.taskPropertySearch ? {taskPropertySearch: filters.taskPropertySearch} : null,
      }
    ).execute()
    .then(results => {
      return dispatch(receiveTaskClusters(
        results, RequestStatus.success, fetchId,
      ))
    }).catch((error) => {
      dispatch(addError(AppErrors.task.fetchFailure))
      console.log(error.response || error)
      throw error
    })
  }
}

// redux reducers
export const currentTaskClusters = function(state={}, action) {
  if (action.type === RECEIVE_TASK_CLUSTERS) {
    const fetchTime = parseInt(uuidTime.v1(action.fetchId))
    const lastFetch = state.fetchId ? parseInt(uuidTime.v1(state.fetchId)) : 0

    if (fetchTime >= lastFetch) {
      const merged = {
        clusters: _isArray(action.clusters) ? action.clusters : [],
        fetchId: action.fetchId,
      }
      return merged
    }

    return state
  }
  else if (action.type === CLEAR_TASK_CLUSTERS) {
    return {}
  }
  else {
    return state
  }
}
