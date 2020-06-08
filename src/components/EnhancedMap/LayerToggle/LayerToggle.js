import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import _map from 'lodash/map'
import _noop from 'lodash/noop'
import _filter from 'lodash/filter'
import _get from 'lodash/get'
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
        <button
          className={
            this.props.source.id === layer.id ? 'mr-text-current' : 'mr-text-green-lighter hover:mr-text-current'
          }
          onClick={() => this.props.changeLayer(layer.id)}
        >
          {layer.name}
        </button>
      </li>
    ))

    const overlayToggles = _map(this.props.intersectingOverlays, layer => (
      <div key={layer.id} className="mr-my-4">
        <div
          className="mr-flex mr-items-center mr-leading-none"
          onClick={e => this.toggleOverlay(layer.id)}
        >
          <input
            type="checkbox"
            className="mr-checkbox-toggle"
            checked={this.overlayVisible(layer.id)}
            onChange={_noop}
          />
          <label className="mr-ml-3 mr-text-orange">{layer.name}</label>
        </div>
      </div>
    ))

    return (
      <Dropdown
        className="mr-dropdown--right mr-absolute mr-z-10 mr-right-0 mr-top-0 mr-mr-2 mr-mt-2"
        dropdownButton={dropdown =>
          <button onClick={dropdown.toggleDropdownVisible} className="mr-leading-none mr-p-2 mr-bg-black-50 mr-text-white mr-w-8 mr-h-8 mr-flex mr-items-center mr-shadow mr-rounded-sm mr-transition-normal-in-out-quad hover:mr-text-green-lighter" aria-haspopup="true"
          aria-controls="dropdown-menu">
            <SvgSymbol sym="layers-icon" className="mr-w-4 mr-h-4 mr-fill-current" viewBox="0 0 20 20" />
          </button>
        }
        dropdownContent={() =>
          <React.Fragment>
            {layerListItems.length > 0 &&
             <ol className="mr-o-2">{layerListItems}</ol>
            }
            {(overlayToggles.length > 0 || this.props.toggleTaskFeatures) && layerListItems.length > 0 &&
             <hr className="mr-h-px mr-my-4 mr-bg-white-15" />
            }
            {overlayToggles}
            {this.props.togglePriorityBounds && this.props.priorityBounds.length > 0 &&
             <div
               className="mr-my-4 mr-flex mr-items-center mr-leading-none"
               onClick={this.props.togglePriorityBounds}
             >
               <input
                 type="checkbox"
                 className="mr-checkbox-toggle"
                 checked={this.props.showPriorityBounds}
                 onChange={_noop}
               />
               <label className="mr-ml-3 mr-text-orange">
                 <FormattedMessage {...messages.showPriorityBoundsLabel} />
               </label>
             </div>
            }
            {this.props.toggleTaskFeatures &&
             <div
               className="mr-my-4 mr-flex mr-items-center mr-leading-none"
               onClick={this.props.toggleTaskFeatures}
             >
               <input
                 type="checkbox"
                 className="mr-checkbox-toggle"
                 checked={this.props.showTaskFeatures}
                 onChange={_noop}
               />
               <label className="mr-ml-3 mr-text-orange">
                 <FormattedMessage {...messages.showTaskFeaturesLabel} />
               </label>
             </div>
            }
            {this.props.toggleOSMData &&
             _get(process.env, 'REACT_APP_OSM_DATA_OVERLAY', 'enabled') !== 'disabled' &&
             <React.Fragment>
               <div
                 className="mr-my-4 mr-flex mr-items-center mr-leading-none"
                 onClick={this.props.toggleOSMData}
               >
                 <input
                   type="checkbox"
                   className="mr-checkbox-toggle"
                   checked={this.props.showOSMData}
                   onChange={_noop}
                 />
                 <label className="mr-ml-3 mr-text-orange">
                   <FormattedMessage
                     {...messages.showOSMDataLabel}
                   /> {this.props.osmDataLoading && <FormattedMessage {...messages.loading} />}
                 </label>
               </div>
               {this.props.showOSMData && !this.props.osmDataLoading && this.props.toggleOSMElements &&
                <React.Fragment>
                  {['nodes', 'ways', 'areas'].map(element => (
                   <div
                     key={element}
                     className="mr-my-2 mr-ml-4 mr-flex mr-items-center mr-leading-none"
                     onClick={() => this.props.toggleOSMElements(element)}
                   >
                     <input
                       type="checkbox"
                       className="mr-checkbox-toggle"
                       checked={this.props.showOSMElements[element]}
                       onChange={_noop}
                     />
                     <label className="mr-ml-3 mr-text-orange mr-capitalize">
                       {element}
                     </label>
                   </div>
                  ))}
                </React.Fragment>
               }
             </React.Fragment>
            }
            {this.props.toggleMapillary &&
             <div
               className="mr-my-4 mr-flex mr-items-center mr-leading-none"
               onClick={e => this.props.toggleMapillary()}
             >
               <input
                 type="checkbox"
                 className="mr-checkbox-toggle"
                 checked={this.props.showMapillary || false}
                 onChange={_noop}
               />
               <label className="mr-ml-3 mr-text-orange">
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
                     <FormattedMessage {...messages.moreLabel} />
                   </button>
                 }

               </label>
             </div>
            }
            {this.props.toggleOpenStreetCam &&
             <div
               className="mr-my-4 mr-flex mr-items-center mr-leading-none"
               onClick={() => this.props.toggleOpenStreetCam()}
             >
               <input
                 type="checkbox"
                 className="mr-checkbox-toggle"
                 checked={this.props.showOpenStreetCam || false}
                 onChange={_noop}
               />
               <label className="mr-ml-3 mr-text-orange">
                 <FormattedMessage
                   {...messages.showOpenStreetCamLabel}
                 /> {(this.props.showOpenStreetCam && !this.props.openStreetCamLoading) &&
                     <FormattedMessage {...messages.imageCount}
                                       values={{count: this.props.openStreetCamCount}} />
                 } {this.props.openStreetCamLoading && <FormattedMessage {...messages.loading} />
                 } {this.props.showOpenStreetCam && this.props.hasMoreOpenStreetCamImagery && !this.props.openStreetCamLoading &&
                   <button
                     className="mr-button mr-button--xsmall mr-ml-2"
                     onClick={e => {
                       e.stopPropagation()
                       this.props.fetchMoreOpenStreetCamImagery()
                     }}
                   >
                     <FormattedMessage {...messages.moreLabel} />
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
