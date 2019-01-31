import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import classNames from 'classnames'
import _map from 'lodash/map'
import _noop from 'lodash/noop'
import _filter from 'lodash/filter'
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
  overlayVisible = layerId => this.props.visibleOverlays.indexOf(layerId) !== -1

  toggleOverlay = layerId => {
    this.overlayVisible(layerId) ? this.props.removeVisibleOverlay(layerId) :
                                   this.props.addVisibleOverlay(layerId)
  }

  render() {
    const baseSources = _filter(this.props.layerSources, source => !source.overlay)

    const layerButtons = _map(baseSources, layer => (
      <a className={classNames('dropdown-item',
                               {'is-active': this.props.source.id === layer.id})}
         key={layer.id}
         onClick={() => this.props.changeLayer(layer.id)}
      >
        {layer.name}
      </a>
    ))

    const overlayToggles = _map(this.props.intersectingOverlays, layer => (
      <div key={layer.id} className="layer-toggle__option-controls">
        <div className="checkbox"
          onClick={e => this.toggleOverlay(layer.id)}>
          <input type="checkbox"
                 checked={this.overlayVisible(layer.id)}
                 onChange={_noop} />
          <label>{layer.name}</label>
        </div>
      </div>
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
            {(overlayToggles.length > 0 || this.props.toggleTaskFeatures) &&
              <hr className="dropdown-divider" />
            }
            {overlayToggles}
            {this.props.toggleTaskFeatures &&
              <div className="layer-toggle__option-controls">
                <div className="checkbox"
                  onClick={this.props.toggleTaskFeatures}>
                  <input type="checkbox"
                         checked={this.props.showTaskFeatures}
                         onChange={_noop}
                  />
                  <label><FormattedMessage {...messages.showTaskFeaturesLabel} /></label>
                </div>
              </div>
            }
            {this.props.toggleOSMData &&
              <div className="layer-toggle__option-controls">
                <div className="checkbox"
                  onClick={this.props.toggleOSMData}>
                  <input type="checkbox"
                         checked={this.props.showOSMData}
                         onChange={_noop}
                  />
                  <label>
                    <FormattedMessage
                      {...messages.showOSMDataLabel}
                    /> {this.props.osmDataLoading && <FormattedMessage {...messages.loading} />}
                  </label>
                </div>
              </div>
            }
            {this.props.toggleMapillary &&
              <div className="layer-toggle__option-controls">
                <div className="checkbox"
                  onClick={e => this.props.toggleMapillary()}>
                  <input type="checkbox"
                         checked={this.props.showMapillary || false}
                         onChange={_noop}
                  />
                  <label>
                    <FormattedMessage
                      {...messages.showMapillaryLabel}
                    /> {(this.props.showMapillary && !this.props.mapillaryLoading) &&
                        <FormattedMessage {...messages.imageCount}
                                          values={{count: this.props.mapillaryCount}} />
                    } {this.props.mapillaryLoading && <FormattedMessage {...messages.loading} />}
                  </label>
                </div>
              </div>
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
  /** Array of overlay layers currently visible */
  visibleOverlays: PropTypes.array.isRequired,
  /** Invoked to add an overlay layer to the visible overlays */
  addVisibleOverlay: PropTypes.func.isRequired,
  /** Invoked to remove an overlay layer from the visible overlays */
  removeVisibleOverlay: PropTypes.func.isRequired,
  /** Set to true if task features are shown on the map */
  showTaskFeatures: PropTypes.bool,
  /** Invoked when the user toggles visibility of task features */
  toggleTaskFeatures: PropTypes.func,
  /** Set to true if Mapillary layer is to be shown on the map */
  showMapillary: PropTypes.bool,
  /** Set to the number of Mapillary markers available in layer */
  mapillaryCount: PropTypes.number,
  /** Invoked when the user toggles visibility of Mapillary layer */
  toggleMapillary: PropTypes.func,
}

export default WithVisibleLayer(WithLayerSources(LayerToggle))
