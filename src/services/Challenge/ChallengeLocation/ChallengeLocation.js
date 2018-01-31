import bbox from '@turf/bbox'
import { map as _map,
         fromPairs as _fromPairs,
         isEmpty as _isEmpty,
         get as _get } from 'lodash'
import { toLatLngBounds } from '../../MapBounds/MapBounds'
import messages from './Messages'

export const CHALLENGE_LOCATION_NEAR_USER = 'nearMe'
export const CHALLENGE_LOCATION_MAPBOUNDS = 'withinMapBounds'

export const ChallengeLocation = Object.freeze({
  [CHALLENGE_LOCATION_MAPBOUNDS]: CHALLENGE_LOCATION_MAPBOUNDS,
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

export const challengePassesLocationFilter = function(filter, challenge, props) {
  if (filter.location === CHALLENGE_LOCATION_MAPBOUNDS ||
      filter.location === CHALLENGE_LOCATION_NEAR_USER ) {
    if (_isEmpty(_get(props, 'mapBounds.locator.bounds'))) {
      return true
    }
    else if (_isEmpty(challenge.bounding)) {
      return false
    }

    const locatorBounds = toLatLngBounds(props.mapBounds.locator.bounds)
    const challengeBounds = toLatLngBounds(
      // right now API double-nests bounding, but that will likely change.
      bbox(_get(challenge, 'bounding.bounding', challenge.bounding))
    )

    return locatorBounds.overlaps(challengeBounds)
  }
  else {
    return true
  }
}
