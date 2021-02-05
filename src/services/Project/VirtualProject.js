import { defaultRoutes as api, isSecurityError } from '../Server/Server'
import Endpoint from '../Server/Endpoint'
import { addError } from '../Error/Error'
import AppErrors from '../Error/AppErrors'
import { ensureUserLoggedIn } from '../User/User'
import { fetchProject } from './Project'
import { fetchChallenge, fetchProjectChallenges } from '../Challenge/Challenge'


/**
 * Add the given challenge to the given virtual project.
 */
export const addChallenge = function(challengeId, toProjectId) {
  return function(dispatch) {
    return new Endpoint(
      api.project.addToVirtual,
      {variables: {challengeId, projectId: toProjectId}}
    ).execute().then(() => {
      fetchProject(toProjectId)(dispatch) // Refresh challenge data
      fetchProjectChallenges(toProjectId, -1)(dispatch) // Refresh challenge data
    }).catch(error => {
      if (isSecurityError(error)) {
        dispatch(ensureUserLoggedIn()).then(() =>
          dispatch(addError(AppErrors.user.unauthorized))
        )
      }
    })
  }
}

/**
 * Remove the given challenge from the given virtual project.
 */
export const removeChallenge = function(challengeId, fromProjectId) {
  return function(dispatch) {
    return new Endpoint(
      api.project.removeFromVirtual,
      {variables: {challengeId, projectId: fromProjectId}}
    ).execute().then(() => {
      fetchChallenge(challengeId)(dispatch) // Refresh Challenge data
      fetchProject(fromProjectId)(dispatch) // Refresh Project data
      fetchProjectChallenges(fromProjectId)(dispatch) // Refresh challenge data
    }).catch(error => {
      if (isSecurityError(error)) {
        dispatch(ensureUserLoggedIn()).then(() =>
          dispatch(addError(AppErrors.user.unauthorized))
        )
      }
    })
  }
}
