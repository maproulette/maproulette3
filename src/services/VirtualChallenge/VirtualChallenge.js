import { schema } from 'normalizr'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import _map from 'lodash/map'
import _omit from 'lodash/omit'
import _head from 'lodash/head'
import addHours from 'date-fns/add_hours'
import { defaultRoutes as api, isSecurityError } from '../Server/Server'
import Endpoint from '../Server/Endpoint'
import RequestStatus from '../Server/RequestStatus'
import genericEntityReducer from '../Server/GenericEntityReducer'
import { ensureUserLoggedIn } from '../User/User'
import { addError, addServerError } from '../Error/Error'
import AppErrors from '../Error/AppErrors'

/** normalizr schema for virtual challenges */
export const virtualChallengeSchema = function() {
  return new schema.Entity('virtualChallenges')
}

/*
 * Time, in hours, until new virtual challenges expire. Defaults to 36 hours if
 * nothing is specified in the .env file.
 */
export const DEFAULT_EXPIRATION_DURATION=
  parseInt(_get(process.env, 'REACT_APP_VIRTUAL_CHALLENGE_DURATION', 36), 10)

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
 * Fetch data for the given virtual challenge.
 */
export const fetchVirtualChallenge = function(virtualChallengeId) {
  return function(dispatch) {
    return new Endpoint(
      api.virtualChallenge.single,
      {schema: virtualChallengeSchema(), variables: {id: virtualChallengeId}}
    ).execute().then(normalizedResults => {
      if (_isFinite(normalizedResults.result)) {
        // Mark that the challenge is virtual.
        normalizedResults.entities.virtualChallenges[normalizedResults.result].isVirtual = true
      }

      dispatch(receiveVirtualChallenges(normalizedResults.entities))
      return normalizedResults
    }).catch((error) => {
      dispatch(addError(AppErrors.virtualChallenge.fetchFailure))
      console.log(error.response || error)
    })
  }
}

/**
 * Creates a new virtual challenge with the given name and tasks. If an
 * explicit expiration timestamp is given, it'll be used; otherwise the virtual
 * challenge will be set to expire after the default configured duration.
 */
export const createVirtualChallenge = function(name, taskIds, expiration, clusters) {
  return function(dispatch) {
    let searchParameters = null
    if (clusters && clusters.length > 0) {
      searchParameters = _omit(_head(clusters).params,
        ['location', 'taskTagConjunction', 'challengeTagConjunction'])
      searchParameters.boundingGeometries =
        _map(clusters, (c) => {return {bounding: c.bounding}})
    }

    const challengeData = {
      name,
      taskIdList: taskIds,
      expiry: expiration ? expiration :
              addHours(new Date(), DEFAULT_EXPIRATION_DURATION).getTime(),
      searchParameters
    }

    return saveVirtualChallenge(
      dispatch,
      new Endpoint(api.virtualChallenge.create, {
        schema: virtualChallengeSchema(),
        json: challengeData,
      })
    )
  }
}

/**
 * Renews the expiration time of the virtual challenge, either setting it to
 * the explicit expiration timestamp given or resetting it to the default
 * configured duration if no expiration is specified.
 */
export const renewVirtualChallenge = function(virtualChallengeId, expiration) {
  return function(dispatch) {
    const challengeData = {
      expiry: expiration ? expiration :
              addHours(new Date(), DEFAULT_EXPIRATION_DURATION).getTime()
    }

    return saveVirtualChallenge(
      dispatch,
      new Endpoint(api.virtualChallenge.edit, {
        variables: {id: virtualChallengeId},
        schema: virtualChallengeSchema(),
        json: challengeData,
      })
    )
  }
}

/**
 * Executes the given endpoint, saving the virtual challenge, and
 * processes the response.
 *
 * @private
 */
export const saveVirtualChallenge = function(dispatch, endpoint) {
  return endpoint.execute().then(normalizedResults => {
    dispatch(receiveVirtualChallenges(normalizedResults.entities))
    return _get(normalizedResults,
                `entities.virtualChallenges.${normalizedResults.result}`)
  }).catch(serverError => {
    if (isSecurityError(serverError)) {
      dispatch(ensureUserLoggedIn()).then(() =>
        dispatch(addError(AppErrors.user.unauthorized))
      )
    }
    else {
      console.log(serverError.response || serverError)
      dispatch(addServerError(AppErrors.virtualChallenge.createFailure,
                              serverError))
    }
  })
}

// redux reducers
//
/**
 * reduceVirtualChallengesFurther will be invoked by the genericEntityReducer function to
 * perform additional reduction on virtualChallenge entities.
 *
 * @private
 */
const reduceVirtualChallengesFurther = function(mergedState,
                                                oldState,
                                                virtualChallengeEntities) {
  const now = Date.now()
  virtualChallengeEntities.forEach(entity => {
    // Ignore deleted and expired virtual challenges
    if (entity.deleted || entity.expired < now) {
      delete mergedState[entity.id]
      return
    }
  })
}

export const virtualChallengeEntities =
  genericEntityReducer([RECEIVE_VIRTUAL_CHALLENGES],
                       'virtualChallenges',
                       reduceVirtualChallengesFurther)
