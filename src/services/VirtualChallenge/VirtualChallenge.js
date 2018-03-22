import { schema } from 'normalizr'
import _get from 'lodash/get'
import { defaultRoutes as api } from '../Server/Server'
import Endpoint from '../Server/Endpoint'
import RequestStatus from '../Server/RequestStatus'
import genericEntityReducer from '../Server/GenericEntityReducer'
import { logoutUser } from '../User/User'
import { addError, addServerError } from '../Error/Error'
import AppErrors from '../Error/AppErrors'

/** normalizr schema for virtual challenges */
export const virtualChallengeSchema = function() {
  return new schema.Entity('virtualChallenges')
}

// redux actions
const RECEIVE_VIRTUAL_CHALLENGES = 'RECEIVE_VIRTUAL_CHALLENGES'

// redux action creators

/**
 * Add or update virtual challenge data in the redux store
 */
export const receiveVirtualChallenges = function(normalizedEntities,
                                                 status=RequestStatus.success) {
  return {
    type: RECEIVE_VIRTUAL_CHALLENGES,
    status,
    entities: normalizedEntities,
    receivedAt: Date.now()
  }
}

// async action creators

/**
 * Creates a new virtual challenge containing tasks within the given bounding
 * box, regardless of their individual parent challenges.
 */
export const createVirtualChallenge = function(taskIds) {
  return function(dispatch) {
    const challengeData = {
      name: `Virtual Challenge ${Date.now()}`,
      taskIdList: taskIds,
    }

    return new Endpoint(api.virtualChallenge.create, {
      schema: virtualChallengeSchema(),
      json: challengeData,
    }).execute().then(normalizedResults => {
      dispatch(receiveVirtualChallenges(normalizedResults.entities))
      return _get(normalizedResults,
                  `entities.virtualChallenges.${normalizedResults.result}`)
    }).catch((serverError) => {
      if (serverError.response && serverError.response.status === 401) {
        // If we get an unauthorized, we assume the user is not logged
        // in (or no longer logged in with the server).
        dispatch(logoutUser())
        dispatch(addError(AppErrors.user.unauthorized))
      }
      else {
        console.log(serverError.response || serverError)
        dispatch(addServerError(AppErrors.virtualChallenge.createFailure,
                                serverError))
      }
    })
  }
}

// redux reducers

export const virtualChallengeEntities =
  genericEntityReducer([RECEIVE_VIRTUAL_CHALLENGES], 'virtualChallenges')
