import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import classNames from 'classnames'
import _map from 'lodash/map'
import _noop from 'lodash/noop'
import WithVisibleLayer from '../../HOCs/WithVisibleLayer/WithVisibleLayer'
import WithLayerSources from '../../HOCs/WithLayerSources/WithLayerSources'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import messages from './Messages'
import './LayerToggle.css'

/**
 * LayerToggle presents a control for selecting the desired map layer/tiles.
 * The required `changeLayer` prop function will be invoked with the new layer
 * name whenever the user selects a new layer.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class LayerToggle extends Component {
  render() {
    const layerButtons = _map(this.props.layerSources, layer => (
      <a className={classNames('dropdown-item',
                               {'is-active': this.props.source.id === layer.id})}
         key={layer.id}
         onClick={() => this.props.changeLayer(layer.id)}
      >
        {layer.name}
      </a>
    ))

    return (
      <div className={classNames('layer-toggle', 'dropdown',
                                 'is-hoverable', 'is-right',
                                 this.props.className)}>
        <div className='dropdown-trigger'>
          <button className="button" aria-haspopup="true"
                  aria-controls="dropdown-menu">
            <span className="icon is-small">
              <SvgSymbol sym="layers-icon" viewBox="0 0 20 20"
                         className="layer-toggle__icon" />
            </span>
          </button>
        </div>

        <div className='dropdown-menu' role='menu'>
          <div className='dropdown-content'>
            {layerButtons}
            {this.props.toggleTaskFeatures &&
             <React.Fragment>
              <hr className="dropdown-divider" />
              <div className="layer-toggle__option-controls">
                <label className="checkbox"
                  onClick={e => {
                    e.preventDefault()
                    this.props.toggleTaskFeatures()
                  }}>
                  <input type="checkbox"
                         checked={this.props.showTaskFeatures}
                         onChange={_noop}
                  /> <FormattedMessage {...messages.showTaskFeaturesLabel} />
                </label>
              </div>
             </React.Fragment>
            }
          </div>
        </div>
      </div>
    )
  }
}

LayerToggle.propTypes = {
  /** Array of layer sources to present as options */
  layerSources: PropTypes.array.isRequired,
  /** Current active layer source */
  source: PropTypes.object,
  /** Invoked when the user chooses a new layer source */
  changeLayer: PropTypes.func.isRequired,
  /** Set to true if task features are shown on the map */
  showTaskFeatures: PropTypes.bool,
  /** Invoked when the user toggles visibility of task features */
  toggleTaskFeatures: PropTypes.func,
}

export default WithVisibleLayer(WithLayerSources(LayerToggle))
