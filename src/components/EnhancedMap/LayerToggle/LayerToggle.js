import { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { FormattedMessage } from 'react-intl'
import classNames from 'classnames'
import _map from 'lodash/map'
import _noop from 'lodash/noop'
import _filter from 'lodash/filter'
import _sortBy from 'lodash/sortBy'
import _clone from 'lodash/clone'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import { DEFAULT_OVERLAY_ORDER }
       from '../../../services/VisibleLayer/LayerSources'
import AsEndUser from '../../../interactions/User/AsEndUser'
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

  orderedOverlays = () => {
    let overlays = overlayToggles({
      ...this.props,
      overlayVisible: this.overlayVisible,
      toggleOverlay: this.toggleOverlay
    })

    const overlayOrder =
      _isEmpty(this.props.overlayOrder) ?
      DEFAULT_OVERLAY_ORDER :
      this.props.overlayOrder

    if (overlayOrder && overlayOrder.length > 0) {
      overlays = _sortBy(overlays, layer => {
        const position = overlayOrder.indexOf(layer.id)
        return position === -1 ? Number.MAX_SAFE_INTEGER : position
      })
    }

    return overlays
  }

  overlayReordered = (overlays, result) => {
    if (!this.props.user || !this.props.updateUserAppSetting) {
      return
    }

    // dropped outside the list or on itself
    if (!result.destination || result.source.index === result.destination.index) {
      return
    }

    const layers = _clone(overlays)
    const movedLayer = layers.splice(result.source.index, 1)[0]
    layers.splice(result.destination.index, 0, movedLayer)

    this.props.updateUserAppSetting(this.props.user.id, {
      mapOverlayOrder: _map(layers, 'id'),
    })
  }

  render() {
    const baseSources = _filter(this.props.layerSources, source => !source.overlay)

    const layerListItems = _map(baseSources, layer => (
      <li key={layer.id}>
        <button
          className={
            this.props.source.id === layer.id ? 'mr-text-current' : 'mr-text-green-lighter hover:mr-text-current'
          }
          onClick={() => this.props.changeLayer(layer.id, this.props.mapType)}
        >
          {layer.name}
        </button>
      </li>
    ))

    const overlays = this.orderedOverlays()
    const canReorderLayers = AsEndUser(this.props.user).isLoggedIn() && this.props.updateUserAppSetting

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
          <Fragment>
            {layerListItems.length > 0 && <ol className="mr-o-2">{layerListItems}</ol>}
            {layerListItems.length > 0 && overlays.length > 0 &&
             <hr className="mr-h-px mr-my-4 mr-bg-white-15" />
            }
            <div>
              <DragDropContext onDragEnd={result => this.overlayReordered(overlays, result)}>
                <Droppable
                  droppableId="overlay-droppable"
                  renderClone={(provided, snapshot, rubric) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <div className="mr-relative mr-my-2 mr-flex mr-justify-between">
                        <div className="mr-text-sm">{overlays[rubric.source.index].component}</div>
                        {canReorderLayers &&
                         <div {...provided.dragHandleProps}>
                           <SvgSymbol
                             sym="reorder-icon"
                             className="mr-mt-6px mr-w-6 mr-h-6 mr-fill-green-light"
                             viewBox="0 0 96 96"
                           />
                         </div>
                        }
                      </div>
                    </div>
                  )}
                >
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {_map(overlays, (overlay, index) => (
                        <Draggable key={overlay.id} draggableId={overlay.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                            >
                              <div className="mr-relative mr-my-2 mr-flex mr-justify-between">
                                <div>{overlay.component}</div>
                                {canReorderLayers &&
                                 <div {...provided.dragHandleProps}>
                                   <SvgSymbol
                                     sym="reorder-icon"
                                     className="mr-mt-6px mr-w-6 mr-h-6 mr-fill-green-light"
                                     viewBox="0 0 96 96"
                                   />
                                 </div>
                                }
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </Fragment>
        }
      />
    );
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

const overlayToggles = props => {
  const toggles = _map(props.intersectingOverlays, layer => ({
    id: layer.id,
    label: layer.name,
    component: (
      <SimpleLayerToggle
        key={layer.id}
        toggleLayerActive={() => props.toggleOverlay(layer.id)}
        isLayerActive={props.overlayVisible(layer.id)}
        layerLabel={layer.name}
      />
    ),
  }))

  if (props.togglePriorityBounds && props.priorityBounds.length > 0) {
    toggles.push({
      id: "priority-bounds",
      label: <FormattedMessage {...messages.showPriorityBoundsLabel} />,
      component: (
        <SimpleLayerToggle
          key="priority-bounds"
          toggleLayerActive={props.togglePriorityBounds}
          isLayerActive={props.showPriorityBounds}
          layerLabel={<FormattedMessage {...messages.showPriorityBoundsLabel} />}
        />
      ),
    })
  }

  if (props.toggleTaskFeatures) {
    toggles.push({
      id: "task-features",
      label: <FormattedMessage {...messages.showTaskFeaturesLabel} />,
      component: (
        <SimpleLayerToggle
          key="task-features"
          toggleLayerActive={props.toggleTaskFeatures}
          isLayerActive={props.showTaskFeatures}
          layerLabel={<FormattedMessage {...messages.showTaskFeaturesLabel} />}
        />
      ),
    })
  }

  if (props.toggleOSMData &&
      _get(process.env, 'REACT_APP_OSM_DATA_OVERLAY', 'enabled') !== 'disabled') {
    toggles.push({
      id: "osm-data",
      label: <FormattedMessage {...messages.showOSMDataLabel} />,
      component: <OSMDataLayerToggle key="osm-data" {...props} />,
    })
  }

  if (props.toggleMapillary) {
    toggles.push({
      id: "mapillary",
      label: <FormattedMessage {...messages.showMapillaryLabel} />,
      component: <MapillaryLayerToggle key="mapillary" {...props} />,
    })
  }

  if (props.toggleOpenStreetCam) {
    toggles.push({
      id: "openstreetcam",
      label: <FormattedMessage {...messages.showOpenStreetCamLabel} />,
      component: <OpenStreetCamLayerToggle key="openstreetcam" {...props} />,
    })
  }

  return toggles
}

const SimpleLayerToggle = props => {
  return (
    <div
      className={classNames(
        "mr-my-2 mr-flex mr-items-center mr-leading-none",
        props.toggleClassName
      )}
      onClick={props.toggleLayerActive}
    >
      <input
        id={props.layerLabel}
        type="checkbox"
        className="mr-checkbox-toggle"
        checked={props.isLayerActive}
        onChange={_noop}
      />
      <label htmlFor={props.layerLabel} className="mr-ml-3 mr-text-orange">{props.layerLabel}</label>
    </div>
  )
}

const OSMDataLayerToggle = props => {
  return (
    <Fragment>
      <SimpleLayerToggle
        toggleLayerActive={props.toggleOSMData}
        isLayerActive={props.showOSMData}
        layerLabel={
          <Fragment>
            <FormattedMessage
              {...messages.showOSMDataLabel}
            /> {props.osmDataLoading && <FormattedMessage {...messages.loading} />}
          </Fragment>
        }
      />

      {props.showOSMData && !props.osmDataLoading && props.toggleOSMElements &&
       <Fragment>
         {['nodes', 'ways', 'areas'].map(element => (
           <SimpleLayerToggle
             key={`osm-element-toggle-${element}`}
             toggleClassName="mr-ml-4"
             toggleLayerActive={() => props.toggleOSMElements(element)}
             isLayerActive={props.showOSMElements[element]}
             layerLabel={element}
           />
         ))}
       </Fragment>
      }
    </Fragment>
  );
}

const MapillaryLayerToggle = props => {
  return (
    <SimpleLayerToggle
      toggleLayerActive={() => props.toggleMapillary()}
      isLayerActive={props.showMapillary || false}
      layerLabel={
        <Fragment>
          <FormattedMessage
            {...messages.showMapillaryLabel}
          /> {(props.showMapillary && !props.mapillaryLoading) &&
              <FormattedMessage {...messages.imageCount}
                                values={{count: props.mapillaryCount}} />
          } {props.mapillaryLoading && <FormattedMessage {...messages.loading} />
          } {props.showMapillary && props.hasMoreMapillaryImagery && !props.mapillaryLoading &&
            <button
              className="mr-button mr-button--xsmall mr-ml-2"
              onClick={e => {
                e.stopPropagation()
                props.fetchMoreMapillaryImagery()
              }}
            >
              <FormattedMessage {...messages.moreLabel} />
            </button>
          }
        </Fragment>
      }
    />
  );
}

const OpenStreetCamLayerToggle = props => {
  return (
    <SimpleLayerToggle
      toggleLayerActive={() => props.toggleOpenStreetCam()}
      isLayerActive={props.showOpenStreetCam || false}
      layerLabel={
        <Fragment>
          <FormattedMessage
            {...messages.showOpenStreetCamLabel}
          /> {(props.showOpenStreetCam && !props.openStreetCamLoading) &&
              <FormattedMessage {...messages.imageCount}
                                values={{count: props.openStreetCamCount}} />
          } {props.openStreetCamLoading && <FormattedMessage {...messages.loading} />
          } {props.showOpenStreetCam && props.hasMoreOpenStreetCamImagery && !props.openStreetCamLoading &&
            <button
              className="mr-button mr-button--xsmall mr-ml-2"
              onClick={e => {
                e.stopPropagation()
                props.fetchMoreOpenStreetCamImagery()
              }}
            >
              <FormattedMessage {...messages.moreLabel} />
            </button>
          }
        </Fragment>
      }
    />
  );
}

export default WithVisibleLayer(WithLayerSources(LayerToggle))
