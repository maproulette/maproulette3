import _isFinite from "lodash/isFinite";
import _isObject from "lodash/isObject";
import _isString from "lodash/isString";
import { connect } from "react-redux";
import AsMappableChallenge from "../../../interactions/Challenge/AsMappableChallenge";
import AsMappingUser from "../../../interactions/User/AsMappingUser";
import { defaultLayerSource, layerSourceWithId } from "../../../services/VisibleLayer/LayerSources";
import { changeVisibleLayer } from "../../../services/VisibleLayer/VisibleLayer";
import {
  addVisibleOverlay,
  removeVisibleOverlay,
} from "../../../services/VisibleLayer/VisibleOverlays";
import WithChallengePreferences from "../WithChallengePreferences/WithChallengePreferences";
import WithCurrentUser from "../WithCurrentUser/WithCurrentUser";

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
const WithVisibleLayer = (WrappedComponent) =>
  WithCurrentUser(
    WithChallengePreferences(connect(mapStateToProps, mapDispatchToProps)(WrappedComponent)),
  );

/**
 * Determine which map layer should be used as a default. If a challenge
 * default basemap is given, it will be used. Otherwise if a user default
 * basemap is given, it will be used. Otherwise if a `defaultLayer` prop was
 * given, it will be used. Otherwise the default layer source from LayerSources
 * will be used.
 */
export const defaultLayer = (ownProps) => {
  let layer =
    AsMappableChallenge(ownProps.challenge).defaultLayerSource() ||
    AsMappingUser(ownProps.user).defaultLayerSource();

  if (!layer) {
    if (_isObject(ownProps.defaultLayer)) {
      layer = ownProps.defaultLayer;
    } else if (_isString(ownProps.defaultLayer)) {
      layer = layerSourceWithId(ownProps.defaultLayer);
    }
  }

  return layer ? layer : defaultLayerSource();
};

/**
 * Attempts to find and return a dynamic layer matching the given layerId.
 * If no matching dynamic layers are found, null is returned.
 */
export const dynamicLayerWithId = (layerId, ownProps) => {
  const challengeLayer = AsMappableChallenge(ownProps.challenge).defaultLayerSource();
  if (challengeLayer && challengeLayer.id === layerId) {
    return challengeLayer;
  }

  const userLayer = AsMappingUser(ownProps.user).findLayerSource(layerId);
  if (userLayer && userLayer.id === layerId) {
    return userLayer;
  }

  return null;
};

export const mapStateToProps = (state, ownProps) => {
  const challengeId = ownProps?.challenge?.id;
  let source = null;

  if (_isFinite(challengeId)) {
    if (_isString(ownProps.visibleMapLayer)) {
      source = layerSourceWithId(ownProps.visibleMapLayer);
      if (!source) {
        // Try a dynamic layer
        source = dynamicLayerWithId(ownProps.visibleMapLayer, ownProps);
      }
    }
  } else if (state.visibleLayer) {
    let sourceId = state.visibleLayer.id;
    if (_isString(ownProps.mapType)) {
      // If no map has been setup for this mapType, then we want the default
      if (state.visibleLayer[ownProps.mapType]) {
        sourceId = state.visibleLayer[ownProps.mapType].id;
      } else {
        sourceId = null;
      }
    }

    source = sourceId ? layerSourceWithId(sourceId) : null;
    if (!source) {
      // Try a dynamic layer
      source = dynamicLayerWithId(sourceId, ownProps);
    }
  }

  return {
    source: source ? source : defaultLayer(ownProps),
    visibleOverlays: state.visibleOverlays,
  };
};

export const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    changeLayer: (layerId, mapType = null) => {
      const isVirtual = _isFinite(ownProps.virtualChallengeId);
      const challengeId = isVirtual ? ownProps.virtualChallengeId : ownProps?.challenge?.id;

      if (_isFinite(challengeId) && ownProps.setVisibleMapLayer) {
        ownProps.setVisibleMapLayer(challengeId, isVirtual, layerId);
      } else {
        dispatch(changeVisibleLayer(layerId, mapType));
      }
    },

    addVisibleOverlay: (layerId) => dispatch(addVisibleOverlay(layerId)),
    removeVisibleOverlay: (layerId) => dispatch(removeVisibleOverlay(layerId)),
  };
};

export default WithVisibleLayer;
