import { OPEN_STREET_MAP,
         OPEN_CYCLE_MAP,
         BING } from '../../VisibleLayer/LayerSources'
import _map from 'lodash/map'
import _fromPairs from 'lodash/fromPairs'
import messages from './Messages'

/**
 * Constants representing basemap layers. These constants are defined on the
 * server
 */
export const CHALLENGE_BASEMAP_NONE = -1
export const CHALLENGE_BASEMAP_OPEN_STREET_MAP = 0
export const CHALLENGE_BASEMAP_OPEN_CYCLE_MAP = 1
export const CHALLENGE_BASEMAP_BING = 2
export const CHALLENGE_BASEMAP_CUSTOM = 3
export const CHALLENGE_BASEMAP_IDENTIFIED = 4

export const ChallengeBasemap = Object.freeze({
  none: CHALLENGE_BASEMAP_NONE,
  openStreetMap: CHALLENGE_BASEMAP_OPEN_STREET_MAP,
  openCycleMap: CHALLENGE_BASEMAP_OPEN_CYCLE_MAP,
  bing: CHALLENGE_BASEMAP_BING,
  custom: CHALLENGE_BASEMAP_CUSTOM,
  identified: CHALLENGE_BASEMAP_IDENTIFIED,
})

/** Map basemap constants to layer source constants */
export const basemapLayerSources = function() {
  return {
    [CHALLENGE_BASEMAP_OPEN_STREET_MAP]: OPEN_STREET_MAP,
    [CHALLENGE_BASEMAP_OPEN_CYCLE_MAP]: OPEN_CYCLE_MAP,
    [CHALLENGE_BASEMAP_BING]: BING,
  }
}

/**
 * Returns an object mapping basemap layer values to raw internationalized
 * messages suitable for use with FormattedMessage or formatMessage.
 */
export const messagesByBasemapLayer = _fromPairs(
  _map(messages, (message, key) => [ChallengeBasemap[key], message])
)

/** Returns object containing localized labels  */
export const basemapLayerLabels = intl => _fromPairs(
  _map(messages, (message, key) => [key, intl.formatMessage(message)])
)

export const challengeOwnerBasemapLayerLabels = intl => {
  // Use a different `none` label for challenge owners in order to promote
  // clarity as to what `none` means in the context of creating a challenge.
  const labels = basemapLayerLabels(intl)
  labels.none = intl.formatMessage(messages.noneChallengeOwner)

  return labels
}
