import { v1 as uuidv1 } from 'uuid'
import uuidTime from 'uuid-time'
import { defaultRoutes as api } from '../Server/Server'
import Endpoint from '../Server/Endpoint'
import RequestStatus from '../Server/RequestStatus'
import { toLatLngBounds } from '../MapBounds/MapBounds'
import { taskSchema } from './Task'
import { addError } from '../Error/Error'
import AppErrors from '../Error/AppErrors'
import _get from 'lodash/get'
import _values from 'lodash/values'
import _isArray from 'lodash/isArray'
import _isUndefined from 'lodash/isUndefined'
import _map from 'lodash/map'
import { generateSearchParametersString } from '../Search/Search'
import { clearTaskClusters } from './TaskClusters'
import { CHALLENGE_LOCATION_WITHIN_MAPBOUNDS }
  from '../Challenge/ChallengeLocation/ChallengeLocation'
import { CHALLENGE_EXCLUDE_LOCAL, CHALLENGE_INCLUDE_LOCAL }
  from '../Challenge/Challenge'


// redux actions
const RECEIVE_BOUNDED_TASKS = 'RECEIVE_BOUNDED_TASKS'
const CLEAR_BOUNDED_TASKS = 'CLEAR_BOUNDED_TASKS'

// redux action creators

/**
 * Add or replace the map-bounded tasks in the redux store
 */
export const receiveBoundedTasks = function(tasks,
                                            status=RequestStatus.success,
                                            fetchId,
                                            totalCount=null) {
  return {
    type: RECEIVE_BOUNDED_TASKS,
    status,
    tasks,
    fetchId,
    totalCount,
    receivedAt: Date.now(),
  }
}

// async action creators

/**
 * Retrieve all tasks (up to the given limit) matching the given search
 * criteria, which should at least include a boundingBox field, and may
 * optionally include a filters field with additional constraints
 */
export const fetchBoundedTasks = function(criteria, limit=50, skipDispatch=false, ignoreLocked=true, withGeometries) {
  return function(dispatch) {
    if (!skipDispatch) {
      // The map is either showing task clusters or bounded tasks so we shouldn't
      // have both in redux.
      // (ChallengeLocation needs to know which challenge tasks pass the location)
      dispatch(clearTaskClusters())
    }

    const normalizedBounds = toLatLngBounds(criteria.boundingBox)
    if (!normalizedBounds) {
      return null
    }

    let includeGeometries = _isUndefined(withGeometries) ? (limit <= 100) : withGeometries
    const page = _get(criteria, 'page', 0)
    const sortBy = _get(criteria, 'sortCriteria.sortBy')
    const direction = (_get(criteria, 'sortCriteria.direction') || 'ASC').toUpperCase()

    const filters = _get(criteria, 'filters', {})
    const searchParameters = generateSearchParametersString(filters,
                                                            null,
                                                            _get(criteria, 'savedChallengesOnly'),
                                                            null, null,
                                                            _get(criteria, 'invertFields'))
    const includeTags = _get(criteria, 'includeTags', false)

    // If we don't have a challenge Id then we need to do some limiting.
    if (!filters.challengeId) {
      includeGeometries = false
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

      // if we are restricting to onlyEnabled challenges then let's
      // not show 'local' challenges either.
      searchParameters.cLocal = onlyEnabled ? CHALLENGE_EXCLUDE_LOCAL :
                                              CHALLENGE_INCLUDE_LOCAL
    }

    // If we are searching within map bounds we need to ensure the parent
    // challenge is also within those bounds
    if (filters.location === CHALLENGE_LOCATION_WITHIN_MAPBOUNDS) {
      if (_isArray(criteria.boundingBox)) {
        searchParameters.bb = criteria.boundingBox.join(',')
      }
      else {
        searchParameters.bb = criteria.boundingBox
      }
    }

    const fetchId = uuidv1()
    !skipDispatch && dispatch(receiveBoundedTasks(null, RequestStatus.inProgress, fetchId))

    return new Endpoint(
      api.tasks.withinBounds, {
        schema: {tasks: [taskSchema()]},
        variables: {
          left: normalizedBounds.getWest(),
          bottom: normalizedBounds.getSouth(),
          right: normalizedBounds.getEast(),
          top: normalizedBounds.getNorth(),
        },
        params: {limit, page, sort: sortBy, order: direction,
                 includeTotal: true, excludeLocked: ignoreLocked, ...searchParameters, 
                 includeGeometries, includeTags},
        json: filters.taskPropertySearch ?
          {taskPropertySearch: filters.taskPropertySearch} : null,
      }
    ).execute().then(normalizedResults => {
      const totalCount = normalizedResults.result.total

      let tasks = _values(_get(normalizedResults, 'entities.tasks', {}))
      tasks = _map(tasks, task =>
        Object.assign(task, {}, task.pointReview)
      )

      !skipDispatch && dispatch(receiveBoundedTasks(tasks, RequestStatus.success, fetchId, totalCount))

      return {tasks, totalCount}
    }).catch(error => {
      dispatch(receiveBoundedTasks([], RequestStatus.error, fetchId))
      dispatch(addError(AppErrors.boundedTask.fetchFailure))
      console.log(error.response || error)
    })
  }
}

/**
 * Clear the bounded tasks from the redux store
 */
export const clearBoundedTasks = function() {
  return {
    type: CLEAR_BOUNDED_TASKS,
    receivedAt: Date.now()
  }
}

// redux reducers
export const currentBoundedTasks = function(state={}, action) {
  if (action.type === RECEIVE_BOUNDED_TASKS) {
    // Only update the state if this represents either a later fetch
    // of data or an update to the current data in the store.
    if (action.fetchId !== state.fetchId || action.status !== state.status) {
      const fetchTime = parseInt(uuidTime.v1(action.fetchId))
      const lastFetch = state.fetchId ? parseInt(uuidTime.v1(state.fetchId)) : 0

      if (fetchTime >= lastFetch) {
        const updatedTasks = {
          fetchId: action.fetchId,
        }

        if (action.status === RequestStatus.inProgress) {
          // Don't overwrite old tasks for in-progress fetches, as they're probably
          // still at least partially relevant as the user pans/zooms the map.
          updatedTasks.tasks = state.tasks
          updatedTasks.loading = true
        }
        else {
          updatedTasks.tasks = _isArray(action.tasks) ? action.tasks : []
          updatedTasks.loading = false
          updatedTasks.totalCount = action.totalCount
        }

        return updatedTasks
      }
    }

    return state
  }
  else if (action.type === CLEAR_BOUNDED_TASKS) {
    return {}
  }
  else {
    return state
  }
}
