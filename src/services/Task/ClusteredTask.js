import uuidv1 from 'uuid/v1'
import uuidTime from 'uuid-time'
import { defaultRoutes as api } from '../Server/Server'
import Endpoint from '../Server/Endpoint'
import RequestStatus from '../Server/RequestStatus'
import { taskSchema } from './Task'
import { addError } from '../Error/Error'
import AppErrors from '../Error/AppErrors'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _each from 'lodash/each'
import _values from 'lodash/values'
import _isArray from 'lodash/isArray'
import _uniqBy from 'lodash/uniqBy'
import _cloneDeep from 'lodash/cloneDeep'
import _set from 'lodash/set'
import _omit from 'lodash/omit'
import _join from 'lodash/join'
import { fetchBoundedTasks } from './BoundedTask'

// redux actions
const RECEIVE_CLUSTERED_TASKS = 'RECEIVE_CLUSTERED_TASKS'
const CLEAR_CLUSTERED_TASKS = 'CLEAR_CLUSTERED_TASKS'

// redux action creators

/**
 * Add or replace the clustered tasks in the redux store
 */
export const receiveClusteredTasks = function(challengeId,
                                              isVirtualChallenge,
                                              tasks,
                                              status=RequestStatus.success,
                                              fetchId,
                                              mergeTasks=false,
                                              mergeOrIgnore=false,
                                              totalCount=null) {
  return {
    type: RECEIVE_CLUSTERED_TASKS,
    status,
    challengeId,
    isVirtualChallenge,
    tasks,
    fetchId,
    receivedAt: Date.now(),
    mergeTasks,
    mergeOrIgnore,
    totalCount
  }
}

/**
 * Clear the clustered tasks from the redux store
 */
export const clearClusteredTasks = function() {
  return {
    type: CLEAR_CLUSTERED_TASKS,
    receivedAt: Date.now()
  }
}


// async action creators

/**
 * Retrieve clustered task data belonging to the given challenge
 */
export const fetchClusteredTasks = function(challengeId, isVirtualChallenge=false, criteria, limit=15000, mergeTasks=false,
                                            excludeLocked=false, mergeOrIgnore=false) {
  return function(dispatch) {
    const fetchId = uuidv1()

    if (!mergeOrIgnore) {
      dispatch(receiveClusteredTasks(
        challengeId, isVirtualChallenge, [], RequestStatus.inProgress, fetchId
      ))
    }

    const statuses = _get(criteria, 'filters.status',[])
    const bounds = _join(_get(criteria, 'boundingBox'), ',')

    return new Endpoint(
      (isVirtualChallenge ? api.virtualChallenge : api.challenge).clusteredTasks, {
        schema: [ taskSchema() ],
        variables: {id: challengeId},
        params: {limit, excludeLocked, tStatus: statuses.join(','), tbb: bounds},
      }
    ).execute().then(normalizedResults => {
      // Add parent field, and copy pointReview fields to top-level for
      // backward compatibility (except reviewRequestedBy and reviewedBy)
      let tasks = _values(_get(normalizedResults, 'entities.tasks', {}))
      tasks = _map(tasks, task =>
        Object.assign(task, {parent: challengeId}, _omit(task.pointReview, ["reviewRequestedBy", "reviewedBy"]))
      )

      if (!mergeOrIgnore) {
        dispatch(receiveClusteredTasks(
          challengeId, isVirtualChallenge, tasks, RequestStatus.success, fetchId, mergeTasks
        ))
      }

      return tasks
    }).catch((error) => {
      dispatch(receiveClusteredTasks(
        challengeId, isVirtualChallenge, [], RequestStatus.error, fetchId
      ))
      dispatch(addError(AppErrors.clusteredTask.fetchFailure))
      console.log(error.response || error)
    })
  }
}

/**
 * Augment clustered task data with a bounded task fetch for the given
 * challenge (see fetchBoundedTasks for details), merging returned tasks with
 * the existing clustered task data. This can be useful for large challenges
 * -- that may have run up against limits when cluster data was originally
 * fetched -- when its necessary to ensure tasks in a bbox are included in the
 * clustered tasks
 */
export const augmentClusteredTasks = function(challengeId, isVirtualChallenge=false, criteria, limit=15000,
                                              mergeTasks=true) {
  return function(dispatch) {
    if (isVirtualChallenge) {
      return
    }

    const fetchId = uuidv1()
    const augmentedCriteria = _cloneDeep(criteria)
    _set(augmentedCriteria, 'filters.challengeId', challengeId)
    return fetchBoundedTasks(augmentedCriteria, limit, true)(dispatch).then(result => {
      // Add parent field
      _each(result.tasks, task => task.parent = challengeId)

      return dispatch(receiveClusteredTasks(
        challengeId, isVirtualChallenge, result.tasks, RequestStatus.success, fetchId,
        mergeTasks, false, result.totalCount
      ))
    })
  }
}


// redux reducers
export const currentClusteredTasks = function(state={}, action) {
  if (action.type === RECEIVE_CLUSTERED_TASKS) {
    // Only update the state if this represents either a later fetch
    // of data or an update to the current data in the store.
    const fetchTime = parseInt(uuidTime.v1(action.fetchId))
    const lastFetch = state.fetchId ? parseInt(uuidTime.v1(state.fetchId)) : 0

    if (fetchTime >= lastFetch || action.mergeTasks) {
      const merged = {
        challengeId: action.challengeId,
        isVirtualChallenge: action.isVirtualChallenge,
        loading: action.status === RequestStatus.inProgress,
        fetchId: action.fetchId,
        tasks: _isArray(action.tasks) ? action.tasks : [],
        totalCount: action.totalCount
      }

      // If a merge is requested and the new clustered tasks are from the same
      // challenge, concat the new tasks to the existing ones
      if (action.mergeTasks &&
          state.challengeId === merged.challengeId &&
          state.isVirtualChallenge === merged.isVirtualChallenge &&
          state.tasks.length > 0) {
        merged.tasks = _uniqBy(merged.tasks.concat(state.tasks), 'id')
        merged.totalCount = action.totalCount
      }
      else if (action.mergeOrIgnore) {
        // Ignore update if we can't merge it
        return state
      }

      return merged
    }
    else {
      return state
    }
  }
  else if (action.type === CLEAR_CLUSTERED_TASKS) {
    return {}
  }
  else {
    return state
  }
}
