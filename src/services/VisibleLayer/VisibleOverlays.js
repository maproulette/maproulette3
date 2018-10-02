// redux actions
const ADD_VISIBLE_OVERLAY = 'AddVisibleOverlay'
const REMOVE_VISIBLE_OVERLAY = 'RemoveVisibleOverlay'
const CLEAR_VISIBLE_OVERLAYS = 'ClearVisibleOverlays'

// redux action creators

/**
 * Add the given overlay layer to the visible overlays in the redux store.
 *
 * @param {string} layerId - the layerId of the overlay to add. It must correspond
 *        to a valid layer source layerId.
 *
 * @see See VisibleOverlays/LayerSources
 */
export const addVisibleOverlay = function(layerId) {
  return {
    type: ADD_VISIBLE_OVERLAY,
    layerId,
  }
}

/**
 * Remove the given overlay layer from the visible overlays in the redux store.
 *
 * @param {string} layerId - the layerId of the overlay to remove. It must
 *        correspond to a valid layer source layerId.
 *
 * @see See VisibleOverlays/LayerSources
 */
export const removeVisibleOverlay = function(layerId) {
  return {
    type: REMOVE_VISIBLE_OVERLAY,
    layerId,
  }
}

/**
 * Clear all visible overlay layers from the redux store
 */
export const clearVisibleOverlays = function() {
  return {
    type: CLEAR_VISIBLE_OVERLAYS,
  }
}

// redux reducers
export const visibleOverlays = function(state=[], action) {
  const layerSet = new Set(state)

  switch(action.type) {
    case ADD_VISIBLE_OVERLAY:
      layerSet.add(action.layerId)
      return [...layerSet]
    case REMOVE_VISIBLE_OVERLAY:
      layerSet.delete(action.layerId)
      return [...layerSet]
    case CLEAR_VISIBLE_OVERLAYS:
      return []
    default:
      return state
  }
}
