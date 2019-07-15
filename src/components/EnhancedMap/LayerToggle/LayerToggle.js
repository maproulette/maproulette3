import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import _map from 'lodash/map'
import _noop from 'lodash/noop'
import _filter from 'lodash/filter'
import WithVisibleLayer from '../../HOCs/WithVisibleLayer/WithVisibleLayer'
import WithLayerSources from '../../HOCs/WithLayerSources/WithLayerSources'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import Dropdown from '../../Dropdown/Dropdown'
import messages from './Messages'

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

    const layerListItems = _map(baseSources, layer => (
      <li key={layer.id}>
        <button className={this.props.source.id === layer.id ? 'mr-text-green-lighter' : 'mr-text-current'}
         onClick={() => this.props.changeLayer(layer.id)}
        >
          {layer.name}
        </button>
      </li>
    ))

    const overlayToggles = _map(this.props.intersectingOverlays, layer => (
      <div key={layer.id} className="layer-toggle__option-controls">
        <div className="mr-flex mr-items-center" onClick={e => this.toggleOverlay(layer.id)}>
          <input type="checkbox"
                 checked={this.overlayVisible(layer.id)}
                 onChange={_noop} />
          <label className="mr-ml-3">{layer.name}</label>
        </div>
      </div>
    ))

    return (
      <Dropdown
        className="mr-dropdown--right mr-absolute mr-z-10 mr-pin-r mr-pin-t mr-mr-2 mr-mt-2"
        dropdownButton={dropdown =>
          <button onClick={dropdown.toggleDropdownVisible} className="mr-leading-none mr-p-2 mr-bg-black-50 mr-text-white mr-w-8 mr-h-8 mr-flex mr-items-center mr-shadow mr-rounded-sm mr-transition-normal-in-out-quad hover:mr-text-green-lighter" aria-haspopup="true"
          aria-controls="dropdown-menu">
            <SvgSymbol sym="layers-icon" className="mr-w-4 mr-h-4 mr-fill-current" viewBox="0 0 20 20" />
          </button>
        }
        dropdownContent={() =>
          <React.Fragment>
            <ol className="mr-o-2">
              {layerListItems}            
            </ol>
            {(overlayToggles.length > 0 || this.props.toggleTaskFeatures) &&
              <hr className="mr-h-px mr-my-4 mr-bg-blue" />
            }
            {overlayToggles}
            {this.props.toggleTaskFeatures &&
                <div className="mr-my-4 mr-flex mr-items-center" onClick={this.props.toggleTaskFeatures}>
                  <input type="checkbox"
                    checked={this.props.showTaskFeatures}
                    onChange={_noop}
                  />
                  <label className="mr-ml-3"><FormattedMessage {...messages.showTaskFeaturesLabel} /></label>
                </div>
              }
              {this.props.toggleOSMData &&
                <div className="mr-my-4 mr-flex mr-items-center" onClick={this.props.toggleOSMData}>
                  <input type="checkbox"
                        checked={this.props.showOSMData}
                        onChange={_noop}
                  />
                  <label className="mr-ml-3">
                    <FormattedMessage
                      {...messages.showOSMDataLabel}
                    /> {this.props.osmDataLoading && <FormattedMessage {...messages.loading} />}
                  </label>
                </div>
              }
              {this.props.toggleMapillary &&
                <div className="mr-my-4 mr-flex mr-items-center" onClick={e => this.props.toggleMapillary()}>
                  <input type="checkbox"
                        checked={this.props.showMapillary || false}
                        onChange={_noop}
                  />
                  <label className="mr-ml-3">
                    <FormattedMessage
                      {...messages.showMapillaryLabel}
                    /> {(this.props.showMapillary && !this.props.mapillaryLoading) &&
                        <FormattedMessage {...messages.imageCount}
                                          values={{count: this.props.mapillaryCount}} />
                    } {this.props.mapillaryLoading && <FormattedMessage {...messages.loading} />
                    } {this.props.showMapillary && this.props.hasMoreMapillaryImagery && !this.props.mapillaryLoading &&
                      <button
                        className="mr-button mr-button--xsmall mr-ml-2"
                        onClick={e => {
                          e.stopPropagation()
                          this.props.fetchMoreMapillaryImagery()
                        }}
                      >
                        <FormattedMessage {...messages.moreMapillaryLabel} />
                      </button>
                    }

                  </label>
                </div>
              }
          </React.Fragment>
        }
      />
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
