import bbox from '@turf/bbox'
import _map from 'lodash/map'
import _fromPairs from 'lodash/fromPairs'
import _isEmpty from 'lodash/isEmpty'
import _get from 'lodash/get'
import { latLng } from 'leaflet'
import { toLatLngBounds } from '../../MapBounds/MapBounds'
import messages from './Messages'

export const CHALLENGE_LOCATION_NEAR_USER = 'nearMe'
export const CHALLENGE_LOCATION_WITHIN_MAPBOUNDS = 'withinMapBounds'
export const CHALLENGE_LOCATION_INTERSECTING_MAPBOUNDS = 'intersectingMapBounds'

export const ChallengeLocation = Object.freeze({
  [CHALLENGE_LOCATION_WITHIN_MAPBOUNDS]: CHALLENGE_LOCATION_WITHIN_MAPBOUNDS,
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
                                                      searchCriteria) {
  if (challengeFilters.location !== CHALLENGE_LOCATION_WITHIN_MAPBOUNDS &&
      challengeFilters.location !== CHALLENGE_LOCATION_INTERSECTING_MAPBOUNDS &&
      challengeFilters.location !== CHALLENGE_LOCATION_NEAR_USER ) {
    return true
  }

  if (_isEmpty(_get(searchCriteria, 'mapBounds.bounds'))) {
    return true
  }

  const challengeSearchMapBounds = toLatLngBounds(searchCriteria.mapBounds.bounds)

  // if the challenge is located within the bounds, it passes.
  if (!_isEmpty(challenge.location)) {
    const challengeLocation = latLng(challenge.location.coordinates[1],
                                     challenge.location.coordinates[0])
    if (challengeSearchMapBounds.contains(challengeLocation)) {
      return true
    }
  }

  // If user wants challenges that simply intersect the bounds, then let those
  // pass too.
  if (challengeFilters.location === CHALLENGE_LOCATION_INTERSECTING_MAPBOUNDS &&
      !_isEmpty(challenge.bounding)) {
    const challengeBounds = toLatLngBounds(bbox(challenge.bounding))

    if (challengeSearchMapBounds.intersects(challengeBounds)) {
      return true
    }
  }

  return false
}
