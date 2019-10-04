import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { ZoomControl, Marker} from 'react-leaflet'
import { latLng } from 'leaflet'
import bbox from '@turf/bbox'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _isEqual from 'lodash/isEqual'
import _debounce from 'lodash/debounce'
import _noop from  'lodash/noop'
import { layerSourceWithId } from '../../services/VisibleLayer/LayerSources'
import EnhancedMap from '../EnhancedMap/EnhancedMap'
import SourcedTileLayer from '../EnhancedMap/SourcedTileLayer/SourcedTileLayer'
import LayerToggle from '../EnhancedMap/LayerToggle/LayerToggle'
import SearchControl from '../EnhancedMap/SearchControl/SearchControl'
import WithVisibleLayer from '../HOCs/WithVisibleLayer/WithVisibleLayer'
import WithIntersectingOverlays
       from '../HOCs/WithIntersectingOverlays/WithIntersectingOverlays'
import WithStatus from '../HOCs/WithStatus/WithStatus'
import BusySpinner from '../BusySpinner/BusySpinner'
import { toLatLngBounds } from '../../services/MapBounds/MapBounds'
import './TaskClusterMap.scss'

// Setup child components with necessary HOCs
const VisibleTileLayer = WithVisibleLayer(SourcedTileLayer)

/**
 * TaskClusterMap allows a user to browse tasks and task clusters
 * geographically, optionally calling back when map bounds are modified
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export class TaskClusterMap extends Component {
  currentBounds = null
  skipNextUpdateBounds = false

  state = {
    mapMarkers: null,
  }

  shouldComponentUpdate(nextProps, nextState) {
    // We want to be careful about not constantly re-rendering, so we only
    // re-render if something meaningful changes:
    if (!_isEqual(nextState, this.state)) {
      return true
    }

    // the loading status of tasks change
    if (!!nextProps.loading !== !!this.props.loading) {
      return true
    }

    // the map bounds have changed
    if (!_isEqual(nextProps.boundingBox, this.props.boundingBox)) {
      return true
    }

    // the task markers have changed
    if (!_isEqual(nextProps.taskMarkers, this.props.taskMarkers)) {
      return true
    }

    // the base layer has changed
    if (_get(nextProps, 'source.id') !== _get(this.props, 'source.id')) {
      return true
    }

    // the available overlays have changed
    if (!_isEqual(nextProps.intersectingOverlays, this.props.intersectingOverlays)) {
      return true
    }

    // the visible overlays have changed
    if (nextProps.visibleOverlays.length !== this.props.visibleOverlays.length) {
       return true
    }

    return false
  }

  componentDidUpdate(prevProps) {
    if (this.props.taskMarkers &&
        !_isEqual(this.props.taskMarkers, prevProps.taskMarkers)) {
      this.generateMarkers()
    }
  }

  /**
   * Signal a change to the current map bounds in response to a
   * change to the map (panning or zooming).
   *
   * @private
   */
  updateBounds = (bounds, zoom) => {
    // If the new bounds are the same as the old, do nothing.
    if (this.currentBounds && this.currentBounds.equals(bounds)) {
      return
    }

    if (this.skipNextUpdateBounds) {
      this.currentBounds = toLatLngBounds(bounds)
      this.skipNextUpdateBounds = false
      return
    }

    this.currentBounds = toLatLngBounds(bounds)
    if (!this.props.loading) {
      this.debouncedUpdateBounds(bounds)
    }
  }

  /**
   * Invoked when an individual task marker is clicked by the user.
   */
  markerClicked = marker => {
    this.currentBounds = toLatLngBounds(bbox(marker.options.bounding))
    this.skipNextUpdateBounds = true
    this.debouncedUpdateBounds(this.currentBounds)
  }

  debouncedUpdateBounds = _debounce(this.props.updateBounds, 200)

  generateMarkers = () => {
    const mapMarkers = _map(this.props.taskMarkers, (mark, index) => {
      if (mark.icon) {
        return <Marker key={`marker-${index}`} position={mark.position} icon={mark.icon}
                        onClick={() => this.markerClicked(mark)} />
      }
      else {
        return <Marker key={`marker-${index}`} position={mark.position}
                        onClick={() => this.markerClicked(mark)} />
      }
    })

    this.setState({mapMarkers})
  }

  render() {
    const overlayLayers = _map(this.props.visibleOverlays, (layerId, index) =>
      <SourcedTileLayer key={layerId} source={layerSourceWithId(layerId)} zIndex={index + 2} />
    )

    if (!this.currentBounds && _get(this.props, 'boundingBox.length', 0) > 0) {
      this.currentBounds = toLatLngBounds(this.props.boundingBox)
    }

    const map =
      <EnhancedMap className="mr-z-0"
                   center={latLng(0, 0)}
                   zoom={2} minZoom={2} maxZoom={18}
                   setInitialBounds={false}
                   initialBounds = {this.currentBounds}
                   zoomControl={false} animate={false} worldCopyJump={true}
                   onBoundsChange={this.updateBounds}>
        <ZoomControl className="mr-z-10" position='topright' />
        <VisibleTileLayer {...this.props} zIndex={1} />
        {overlayLayers}
        {this.state.mapMarkers}
      </EnhancedMap>

    return (
      <div className={classNames('taskcluster-map', {"full-screen-map": this.props.isMobile})}>
        <LayerToggle {...this.props} />
        <SearchControl
          {...this.props}
          onResultSelected={bounds => {
            this.currentBounds = toLatLngBounds(bounds)
            this.props.updateBounds(bounds)
          }}
        />
        {map}
        {!!this.props.loading && <BusySpinner mapMode />}
      </div>
    )
  }
}

TaskClusterMap.propTypes = {
  /** Map markers for the tasks to display */
  taskMarkers: PropTypes.array.isRequired,
  /** Set to true if tasks are still loading */
  loading: PropTypes.bool,
  /** Invoked when the user moves the map */
  updateBounds: PropTypes.func,
}

TaskClusterMap.defaultProps = {
  updateBounds: _noop,
}

export default searchName =>
  WithStatus(
    WithVisibleLayer(
      WithIntersectingOverlays(TaskClusterMap, searchName)
    )
  )
