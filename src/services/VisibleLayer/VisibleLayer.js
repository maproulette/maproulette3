import _cloneDeep from 'lodash/cloneDeep'

// redux actions
const CHANGE_VISIBLE_LAYER = 'ChangeVisibleLayer'

// redux action creators

/**
 * Set the given map tile layer as the current visible tile layer in the redux
 * store.
 *
 * @param {string} layerId - the layerId of the layer to set. It must correspond
 *        to a valid layer source layerId.
 * @param {string} mapType - optional mapType to indicate which map should only
 *        have it's visible layer changed.
 *
 * @see See VisibleLayer/LayerSources
 */
export const changeVisibleLayer = function(layerId, mapType) {
  return {
    type: CHANGE_VISIBLE_LAYER,
    layerId,
    mapType
  }
}

// redux reducers
export const visibleLayer = function(state=null, action) {
  if (action.type === CHANGE_VISIBLE_LAYER) {
    const newState = _cloneDeep(state) || {}
    if (action.mapType) {
      newState[action.mapType] = {id: action.layerId}
    }
    else {
      newState.id = action.layerId
    }
    return newState
  }
  else {
    return state
  }
}
