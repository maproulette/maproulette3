import _find from 'lodash/find'
import { LayerSources } from './LayerSources'

// redux actions
const CHANGE_VISIBLE_LAYER = 'ChangeVisibleLayer'

// redux action creators

/**
 * Set the given map tile layer as the current visible tile layer in the redux
 * store.
 *
 * @param {string} layerName - the name of the layer to set. It must correspond
 *        to the layerName of a valid layer source.
 *
 * @see See VisibleLayer/LayerSources
 */
export const changeVisibleLayer = function(layerName) {
  return {
    type: CHANGE_VISIBLE_LAYER,
    layerName,
  }
}

// redux reducers
export const visibleLayer = function(state=null, action) {
  if (action.type === CHANGE_VISIBLE_LAYER) {
    return _find(LayerSources, {name: action.layerName})
  }
  else {
    return state
  }
}
