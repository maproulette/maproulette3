// redux actions
const CHANGE_VISIBLE_LAYER = 'ChangeVisibleLayer'

// redux action creators

/**
 * Set the given map tile layer as the current visible tile layer in the redux
 * store.
 *
 * @param {string} layerId - the layerId of the layer to set. It must correspond
 *        to a valid layer source layerId.
 *
 * @see See VisibleLayer/LayerSources
 */
export const changeVisibleLayer = function(layerId) {
  return {
    type: CHANGE_VISIBLE_LAYER,
    layerId,
  }
}

// redux reducers
export const visibleLayer = function(state=null, action) {
  if (action.type === CHANGE_VISIBLE_LAYER) {
    return {id: action.layerId}
  }
  else {
    return state
  }
}
