import { connect } from 'react-redux'
import _get from 'lodash/get'
import _isNumber from 'lodash/isNumber'
import _isString from 'lodash/isString'
import _isObject from 'lodash/isObject'
import _isEmpty from 'lodash/isEmpty'
import { layerSourceWithId,
         defaultLayerSource,
         createDynamicLayerSource }
       from '../../../services/VisibleLayer/LayerSources'
import { changeVisibleLayer } from '../../../services/VisibleLayer/VisibleLayer'
import { ChallengeBasemap,
         BasemapLayerSources }
       from '../../../services/Challenge/ChallengeBasemap/ChallengeBasemap'
import WithCurrentUser from '../WithCurrentUser/WithCurrentUser'
import WithChallengePreferences
       from '../WithChallengePreferences/WithChallengePreferences'

/**
 * WithVisibleLayer provides the wrapped component with the proper tile layer
 * source to be displayed in a map based on the current state of the redux
 * store or -- if there is no current active layer -- the configuration of the
 * layer sources themselves. It also provides a function for changing the active
 * layer.
 *
 * @see See LayerSources
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithVisibleLayer = WrappedComponent =>
  WithCurrentUser(WithChallengePreferences(
    connect(mapStateToProps, mapDispatchToProps)(WrappedComponent)
  ))

/**
 * Determine which map layer should be used as a default. If a challenge
 * default basemap is given, it will be used. Otherwise if a user default
 * basemap is given, it will be used. Otherwise if a `defaultLayer` prop was
 * given, it will be used. Otherwise the default layer source from LayerSources
 * will be used.
 */
export const defaultLayer = ownProps => {
  const challengeDefaultBasemap = _get(ownProps, 'challenge.defaultBasemap')
  const userDefaultBasemap = _get(ownProps, 'user.settings.defaultBasemap')
  let layer = null

  if (_isNumber(challengeDefaultBasemap) &&
      challengeDefaultBasemap !== ChallengeBasemap.none) {
    if (challengeDefaultBasemap !== ChallengeBasemap.custom) {
      layer = layerSourceWithId(BasemapLayerSources[challengeDefaultBasemap])
    }
    else if (!_isEmpty(ownProps.challenge.customBasemap)) {
      layer = createDynamicLayerSource(`challenge_${ownProps.challenge.id}`,
                                       ownProps.challenge.customBasemap)
    }
  }
  else if (_isNumber(userDefaultBasemap) &&
           userDefaultBasemap !== ChallengeBasemap.none) {
    if (userDefaultBasemap !== ChallengeBasemap.custom) {
      layer = layerSourceWithId(BasemapLayerSources[userDefaultBasemap])
    }
    else if (!_isEmpty(ownProps.user.settings.customBasemap)) {
      layer = createDynamicLayerSource(`user_${ownProps.user.id}`,
                                       ownProps.user.settings.customBasemap)
    }
  }
  else if (_isObject(ownProps.defaultLayer)) {
    layer = ownProps.defaultLayer
  }
  else if (_isString(ownProps.defaultLayer)) {
    layer = layerSourceWithId(ownProps.defaultLayer)
  }

  return layer ? layer : defaultLayerSource()
}

export const mapStateToProps = (state, ownProps) => {
  const challengeId = _get(ownProps, 'challenge.id')
  let source = null

  if (_isNumber(challengeId)) {
    if (_isString(ownProps.visibleMapLayer)) {
      source = layerSourceWithId(ownProps.visibleMapLayer)
    }
  }
  else if (state.visibleLayer) {
    source = state.visibleLayer
  }

  return {
    source: source ? source : defaultLayer(ownProps)
  }
}

export const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    changeLayer: layerId => {
      const isVirtual = _isNumber(ownProps.virtualChallengeId)
      const challengeId = isVirtual ? ownProps.virtualChallengeId :
                                      _get(ownProps, 'challenge.id')

      if (_isNumber(challengeId) && ownProps.setVisibleMapLayer) {
        ownProps.setVisibleMapLayer(challengeId, isVirtual, layerId)
      }
      else {
        dispatch(changeVisibleLayer(layerId))
      }
    },
  }
}

export default WithVisibleLayer
