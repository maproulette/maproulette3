import { connect } from 'react-redux'
import { layerSourceWithName,
         defaultLayerSource } from '../../../services/VisibleLayer/LayerSources'
import { changeVisibleLayer } from '../../../services/VisibleLayer/VisibleLayer'
import { isString as _isString } from 'lodash'

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
const WithVisibleLayer =
  WrappedComponent => connect(mapStateToProps, mapDispatchToProps)(WrappedComponent)

const mapStateToProps = (state, ownProps) => {
  // If a specific layer has been chosen, use it. Otherwise, if a specific
  // default layer has been given, use that. Otherwise try to find a default
  // layer based on the layer configuration, and finally just give back the
  // very first layer source if no default can be found.

  let layer = state.visibleLayer
  if (!layer && _isString(ownProps.defaultLayer)) {
    layer = layerSourceWithName(ownProps.defaultLayer)
  }

  return ({source: layer ? layer : defaultLayerSource()})
}

const mapDispatchToProps = dispatch => {
  return {
    changeLayer: layerSource => dispatch(changeVisibleLayer(layerSource))
  }
}

export default WithVisibleLayer
