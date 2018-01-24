import RequestStatus from '../Server/RequestStatus'
import { fetchProjectChallenges } from '../Challenge/Challenge'
import { fetchChallengeTasks } from '../Task/Task'

// redux actions
export const MANAGE_PROJECT = 'MANAGE_PROJECT'
export const CLEAR_MANAGED_PROJECT = 'CLEAR_MANAGED_PROJECT'
export const SEARCH_PROJECTS = 'SEARCH_PROJECTS'
export const MANAGE_CHALLENGE = 'MANAGE_CHALLENGE'
export const CLEAR_MANAGED_CHALLENGE = 'CLEAR_MANAGED_CHALLENGE'
export const SEARCH_CHALLENGES = 'SEARCH_CHALLENGES'

// redux action creators
export const beginManagingProject = function(projectId, status = RequestStatus.success) {
  return {
    type: MANAGE_PROJECT,
    projectId,
    status,
  }
}

export const clearManagedProject = function() {
  return {
    type: CLEAR_MANAGED_PROJECT,
  }
}

export const beginManagingChallenge = function(challengeId, status = RequestStatus.success) {
  return {
    type: MANAGE_CHALLENGE,
    challengeId,
    status,
  }
}

export const clearManagedChallenge = function() {
  return {
    type: CLEAR_MANAGED_CHALLENGE,
  }
}

// async action creators
export const manageProject = function(projectId) {
  return function(dispatch) {
    dispatch(beginManagingProject(projectId, RequestStatus.inProgress))

    return fetchProjectChallenges(projectId)(dispatch)
      .then(() => dispatch(beginManagingProject(projectId, RequestStatus.success)))
  }
}

export const manageChallenge = function(challengeId) {
  return function(dispatch) {
    dispatch(beginManagingChallenge(challengeId, RequestStatus.inProgress))

    return fetchChallengeTasks(challengeId)(dispatch)
      .then(() => {
        dispatch(beginManagingChallenge(challengeId, RequestStatus.success))
      })
  }
}

// redux reducers
export const adminContext = function(state={}, action) {
  switch(action.type) {
    case MANAGE_PROJECT:
      return Object.assign({}, state, {
        managingProject: {
          id: action.projectId,
          loaded: action.status === RequestStatus.success,
        }
      })
    case CLEAR_MANAGED_PROJECT:
      return Object.assign({}, state, {managingProject: null})
    case MANAGE_CHALLENGE:
      return Object.assign({}, state, {
        managingChallenge: {
          id: action.challengeId,
          loaded: action.status === RequestStatus.success,
        }
      })
    case CLEAR_MANAGED_CHALLENGE:
      return Object.assign({}, state, {managingChallenge: null})
    default:
      return state
  }
}
