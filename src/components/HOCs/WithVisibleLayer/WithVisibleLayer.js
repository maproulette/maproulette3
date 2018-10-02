import { connect } from 'react-redux'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import _isString from 'lodash/isString'
import _isObject from 'lodash/isObject'
import { layerSourceWithId,
         defaultLayerSource }
       from '../../../services/VisibleLayer/LayerSources'
import { changeVisibleLayer }
       from '../../../services/VisibleLayer/VisibleLayer'
import { addVisibleOverlay, removeVisibleOverlay }
       from '../../../services/VisibleLayer/VisibleOverlays'
import WithCurrentUser from '../WithCurrentUser/WithCurrentUser'
import WithChallengePreferences
       from '../WithChallengePreferences/WithChallengePreferences'
import AsMappableChallenge
       from '../../../interactions/Challenge/AsMappableChallenge'
import AsMappingUser
       from '../../../interactions/User/AsMappingUser'

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
  let layer = AsMappableChallenge(ownProps.challenge).defaultLayerSource() ||
              AsMappingUser(ownProps.user).defaultLayerSource()

  if (!layer) {
    if (_isObject(ownProps.defaultLayer)) {
      layer = ownProps.defaultLayer
    }
    else if (_isString(ownProps.defaultLayer)) {
      layer = layerSourceWithId(ownProps.defaultLayer)
    }
  }

  return layer ? layer : defaultLayerSource()
}

/**
 * Attempts to find and return a dynamic layer matching the given layerId.
 * If no matching dynamic layers are found, null is returned.
 */
export const dynamicLayerWithId = (layerId, ownProps) => {
  const challengeLayer = AsMappableChallenge(ownProps.challenge).defaultLayerSource()
  if (challengeLayer && challengeLayer.id === layerId) {
    return challengeLayer
  }

  const userLayer = AsMappingUser(ownProps.user).defaultLayerSource()
  if (userLayer && userLayer.id === layerId) {
    return userLayer
  }

  return null
}

export const mapStateToProps = (state, ownProps) => {
  const challengeId = _get(ownProps, 'challenge.id')
  let source = null

  if (_isFinite(challengeId)) {
    if (_isString(ownProps.visibleMapLayer)) {
      source = layerSourceWithId(ownProps.visibleMapLayer)

      if (!source) {
        // Try a dynamic layer
        source = dynamicLayerWithId(ownProps.visibleMapLayer, ownProps)
      }
    }
  }
  else if (state.visibleLayer) {
    source = layerSourceWithId(state.visibleLayer.id)

    if (!source) {
      // Try a dynamic layer
      source = dynamicLayerWithId(state.visibleLayer.id, ownProps)
    }
  }

  return {
    source: source ? source : defaultLayer(ownProps),
    visibleOverlays: state.visibleOverlays,
  }
}

export const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    changeLayer: layerId => {
      const isVirtual = _isFinite(ownProps.virtualChallengeId)
      const challengeId = isVirtual ? ownProps.virtualChallengeId :
                                      _get(ownProps, 'challenge.id')

      if (_isFinite(challengeId) && ownProps.setVisibleMapLayer) {
        ownProps.setVisibleMapLayer(challengeId, isVirtual, layerId)
      }
      else {
        dispatch(changeVisibleLayer(layerId))
      }
    },

    addVisibleOverlay: layerId => dispatch(addVisibleOverlay(layerId)),
    removeVisibleOverlay: layerId => dispatch(removeVisibleOverlay(layerId)),
  }
}

export default WithVisibleLayer
