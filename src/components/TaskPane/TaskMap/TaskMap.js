import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { ZoomControl } from 'react-leaflet'
import _isObject from 'lodash/isObject'
import _get from 'lodash/get'
import EnhancedMap from '../../EnhancedMap/EnhancedMap'
import SourcedTileLayer from '../../EnhancedMap/SourcedTileLayer/SourcedTileLayer'
import LayerToggle from '../../EnhancedMap/LayerToggle/LayerToggle'
import WithVisibleLayer from '../../HOCs/WithVisibleLayer/WithVisibleLayer'
import WithLayerSources from '../../HOCs/WithLayerSources/WithLayerSources'
import { MIN_ZOOM,
         MAX_ZOOM,
          DEFAULT_ZOOM }
       from '../../../services/Challenge/ChallengeZoom/ChallengeZoom'
import BusySpinner from '../../BusySpinner/BusySpinner'
import './TaskMap.css'

const VisibleLayerToggle = WithVisibleLayer(WithLayerSources(LayerToggle))
const VisibleTileLayer = WithVisibleLayer(SourcedTileLayer)

/**
 * TaskMap renders a map (and controls) appropriate for the given task,
 * including the various map-related features and configuration options set on
 * the task and its parent challenge.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskMap extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    // We want to avoid constantly re-rendering, so we only re-render if the
    // task changes. We care about changes to the task id, its geometries, and
    // a few settings on the parent challenge.
    if(_get(nextProps, 'task.id') !== _get(this.props, 'task.id')) {
      return true
    }

    if (_get(nextProps, 'task.parent.defaultZoom') !==
        _get(this.props, 'task.parent.defaultZoom')) {
      return true
    }

    if (_get(nextProps, 'task.geometries') !==
        _get(this.props, 'task.geometries')) {
      return true
    }

    return false
  }

  updateTaskBounds = (bounds, zoom) => {
    this.props.setTaskMapBounds(this.props.task, bounds, zoom, false)
  }

  render() {
    if (!this.props.task || !_isObject(this.props.task.parent)) {
      return <BusySpinner />
    }

    const zoom = _get(this.props.task, "parent.defaultZoom", DEFAULT_ZOOM)
    const minZoom = _get(this.props.task, "parent.minZoom", MIN_ZOOM)
    const maxZoom = _get(this.props.task, "parent.maxZoom", MAX_ZOOM)

    // Note: we need to also pass maxZoom to the tile layer (in addition to the
    // map), or else leaflet won't autoscale if the zoom goes beyond the
    // capabilities of the layer.

    return (
      <div className={classNames("task-map full-screen-map task")}>
        <VisibleLayerToggle {...this.props} />
        <EnhancedMap key={this.props.task.id}
                     center={this.props.centerPoint} zoom={zoom} zoomControl={false}
                     minZoom={minZoom} maxZoom={maxZoom}
                     features={_get(this.props.task, 'geometries.features')}
                     fitFeaturesOnlyOnce
                     onBoundsChange={this.updateTaskBounds}
        >
          <ZoomControl position='topright' />
          <VisibleTileLayer maxZoom={maxZoom} {...this.props} />
        </EnhancedMap>
      </div>
    )
  }
}

TaskMap.propTypes = {
  /** The task for which to display the map */
  task: PropTypes.object,
  /** Invoked when the bounds of the map are modified by the user */
  setTaskMapBounds: PropTypes.func.isRequired,
  /**
   * The desired centerpoint of the map in (Lat, Lng).
   * @see See WithTaskCenterpoint HOC
   */
  centerPoint: PropTypes.object.isRequired,
}
