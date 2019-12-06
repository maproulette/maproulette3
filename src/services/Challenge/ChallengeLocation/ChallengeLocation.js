import bbox from '@turf/bbox'
import _map from 'lodash/map'
import _fromPairs from 'lodash/fromPairs'
import _isEmpty from 'lodash/isEmpty'
import _get from 'lodash/get'
import _each from 'lodash/each'
import _concat from 'lodash/concat'
import _indexOf from 'lodash/indexOf'
import { maxAllowedDegrees } from '../../../components/HOCs/WithMapBoundedTasks/WithMapBoundedTasks'
import { toLatLngBounds,
         boundsWithinAllowedMaxDegrees } from '../../MapBounds/MapBounds'
import messages from './Messages'


export const CHALLENGE_LOCATION_NEAR_USER = 'nearMe'
export const CHALLENGE_LOCATION_WITHIN_MAPBOUNDS = 'withinMapBounds'
export const CHALLENGE_LOCATION_INTERSECTING_MAPBOUNDS = 'intersectingMapBounds'

export const ChallengeLocation = Object.freeze({
  [CHALLENGE_LOCATION_INTERSECTING_MAPBOUNDS]: CHALLENGE_LOCATION_INTERSECTING_MAPBOUNDS,
  [CHALLENGE_LOCATION_NEAR_USER]: CHALLENGE_LOCATION_NEAR_USER,
})

/**
 * Returns an object mapping difficulty values to raw internationalized
 * messages suitable for use with FormattedMessage or formatMessage.
 */
export const messagesByLocation = _fromPairs(
  _map(messages, (message, key) => [ChallengeLocation[key], message])
)

/** Returns object containing localized labels  */
export const locationLabels = intl => _fromPairs(
  _map(messages, (message, key) => [key, intl.formatMessage(message)])
)

/**
 * Returns true if the given challenge passes the location filter in the given
 * challenge filters.
 */
export const challengePassesLocationFilter = function(challengeFilters,
                                                      challenge,
                                                      props) {
  if (challengeFilters.location !== CHALLENGE_LOCATION_WITHIN_MAPBOUNDS &&
      challengeFilters.location !== CHALLENGE_LOCATION_INTERSECTING_MAPBOUNDS &&
      challengeFilters.location !== CHALLENGE_LOCATION_NEAR_USER ) {
    return true
  }

  if (_isEmpty(_get(props.searchCriteria, 'mapBounds.bounds'))) {
    return true
  }

  const challengeSearchMapBounds = toLatLngBounds(props.searchCriteria.mapBounds.bounds)

  // Or if the challenge is listed in the TaskClusters or in the Map Bounded Tasks
  let validChallenges = []
  _each(_get(props, 'mapBoundedTasks.tasks'), (task) => {
    validChallenges = _concat(validChallenges, task.parentId)
  })

  _each(_get(props, 'taskClusters.clusters'), (cluster) => {
    validChallenges = _concat(validChallenges, cluster.challengeIds)
  })

  if (_indexOf(validChallenges, challenge.id) > -1) {
    return true
  }

  if (!challengeSearchMapBounds ||
      !boundsWithinAllowedMaxDegrees(challengeSearchMapBounds, maxAllowedDegrees())) {
    // If user wants challenges that simply intersect the bounds, then let those
    // pass if we are not analyzing individual tasks.
    if (challengeFilters.location === CHALLENGE_LOCATION_INTERSECTING_MAPBOUNDS &&
        !_isEmpty(challenge.bounding)) {
      const challengeBounds = toLatLngBounds(bbox(challenge.bounding))

      if (challengeSearchMapBounds.intersects(challengeBounds)) {
        return true
      }
    }
  }

  return false
}
