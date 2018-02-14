import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { ZoomControl } from 'react-leaflet'
import { FormattedMessage, injectIntl } from 'react-intl'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import { point, featureCollection } from '@turf/helpers'
import bbox from '@turf/bbox'
import bboxPolygon from '@turf/bbox-polygon'
import _get from 'lodash/get'
import _each from 'lodash/each'
import _map from 'lodash/map'
import _fromPairs from 'lodash/fromPairs'
import _isEqual from 'lodash/isEqual'
import L, { latLng } from 'leaflet'
import 'leaflet-vectoricon'
import { messagesByStatus }
       from '../../../../services/Task/TaskStatus/TaskStatus'
import { MAPBOX_LIGHT,
         OPEN_STREET_MAP }
       from '../../../../services/VisibleLayer/LayerSources'
import EnhancedMap from '../../../EnhancedMap/EnhancedMap'
import SourcedTileLayer from '../../../EnhancedMap/SourcedTileLayer/SourcedTileLayer'
import LayerToggle from '../../../EnhancedMap/LayerToggle/LayerToggle'
import WithVisibleLayer from '../../../HOCs/WithVisibleLayer/WithVisibleLayer'
import WithStatus from '../../../HOCs/WithStatus/WithStatus'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import messages from './Messages'
import './ChallengeTaskMap.css'

/**
 * ChallengeTaskMap displays a map of the given challenge tasks for use by
 * challenge owners, with tasks coded by status and priority.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ChallengeTaskMap extends Component {
  state = {
    clusterTasks: true,
  }

  currentBounds = null

  shouldComponentUpdate(nextProps, nextState) {
    // We want to be careful about not constantly re-rendering, so we only
    // re-render if something meaningful changes:

    // If our state changed
    if (!_isEqual(nextState, this.state)) {
      return true
    }

    // the layer has been changed, or
    if (_get(nextProps, 'source.name') !== _get(this.props, 'source.name')) {
      return true
    }

    // the filtering options have changed, or
    if (!_isEqual(nextProps.filterOptions, this.props.filterOptions)) {
      return true
    }

    // the challenge has changed, or
    if (_get(nextProps, 'challenge.id') !== 
        _get(this.props, 'challenge.id')) {
      return true
    }

    // the challenge id of the clustered tasks change
    if (_get(nextProps, 'taskInfo.challengeId') !==
        _get(this.props, 'taskInfo.challengeId')) {
      return true
    }

    // the loading status of clustered tasks change
    if (_get(nextProps, 'taskInfo.loading') !==
        _get(this.props, 'taskInfo.loading')) {
      return true
    }

    // the clustered tasks themselves change
    if (_get(nextProps, 'taskInfo.tasks.length') !==
        _get(this.props, 'taskInfo.tasks.length')) {
      return true
    }

    return false
  }

  /**
   * Invoked by the cluster-tasks switch to toggle task clustering on and off
   */
  toggleClusterTasks = () => {
    this.setState({clusterTasks: !this.state.clusterTasks})
  }

  /**
   * Signal a change to the current challenge map bounds in response to a
   * change to the map (panning or zooming).
   *
   * @private
   */
  updateBounds = (bounds, zoom) => {
    // If the new bounds are the same as the old, do nothing.
    if (this.currentBounds && this.currentBounds.equals(bounds)) {
      return
    }

    this.currentBounds = bounds
    if (this.props.setChallengeMapBounds) {
      this.props.setChallengeMapBounds(this.props.challenge.id,
                                       bounds, zoom)
    }
  }

  clusterIcon = cluster => {
    let colorScheme = null
    switch(_get(this.props, 'source.name')) {
      case MAPBOX_LIGHT:
        colorScheme = 'monochromatic-blue-cluster'
        break;
      case OPEN_STREET_MAP:
        colorScheme = 'monochromatic-brown-cluster'
        break;
      default:
        colorScheme = 'greyscale-cluster'
        break;
    }

    const count = cluster.getChildCount()
    let clusterSizeClass = ''
    if (count < 10) {
      clusterSizeClass = 'few'
    }
    else if (count > 100) {
      clusterSizeClass = 'many'
    }

    return L.divIcon({
      html: `<span class="count">${count}</span>`,
      className: `${colorScheme} ${clusterSizeClass}`,
      iconSize: L.point(40, 40),
    })
  }

  /**
   * Invoked to request popup content when a task marker on the map is clicked
   */
  popupContent = marker => {
    const taskBaseRoute =
      `/admin/project/${this.props.challenge.parent.id}` +
      `/challenge/${this.props.challenge.id}/task/${marker.options.taskId}`

    const content = (
      <div className="marker-popup-content">
        <div>
          {this.props.intl.formatMessage(messages.nameLabel)} {marker.options.name}
        </div>
        <div>
          {this.props.intl.formatMessage(messages.statusLabel)} {this.props.intl.formatMessage(messagesByStatus[marker.options.status])}
        </div>

        <div className="marker-popup-content__links">
          <div>
            <a onClick={() => this.props.history.push(`${taskBaseRoute}/review`)}>
              {this.props.intl.formatMessage(messages.reviewTaskLabel)}
            </a>
          </div>

          <div>
            <a onClick={() => this.props.history.push(`${taskBaseRoute}/edit`)}>
              {this.props.intl.formatMessage(messages.editTaskLabel)}
            </a>
          </div>
        </div>
      </div>
    )

    const contentElement = document.createElement('div')
    ReactDOM.render(content, contentElement)
    return contentElement
  }

  render() {
    if (!this.props.challenge) {
      return null
    }

    let loadingClusteredTasks = false
    const markers = []
    let bounding = null

    // Create map markers for the tasks.
    const statusIcons = _fromPairs(_map(this.props.statusColors, (color, status) => [
      status,
      L.vectorIcon({
        className: 'location-marker-icon',
        svgHeight: 20,
        svgWidth: 20,
        type: 'path',
        shape: { // zondicons "location" icon
          d: "M10 20S3 10.87 3 7a7 7 0 1 1 14 0c0 3.87-7 13-7 13zm0-11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"
        },
        style: {
          fill: color,
          stroke: '#666',
          strokeWidth: 0.5,
        },
        iconAnchor: [5, 15], // render tip of SVG near marker location
      })
    ]))

    if (_get(this.props, 'taskInfo.challengeId') ===
        this.props.challenge.id) {
      loadingClusteredTasks = this.props.taskInfo.loading

      if (_get(this.props, 'taskInfo.tasks.length') > 0) {
        _each(this.props.taskInfo.tasks, task => {
          markers.push({
            position: [task.point.lat, task.point.lng],
            options: {
              icon: statusIcons[task.status],
              taskId: task.id,
              name: task.name || task.title,
              status: task.status,
              priority: task.priority,
            },
            popup: this.popupContent,
          })
        })
      }
    }

    // Get the challenge bounding so we know which part of the map to display.
    // Right now API double-nests bounding, but that will likely change.
    bounding = _get(this.props, 'challenge.bounding.bounding') ||
               _get(this.props, 'challenge.bounding')


    // If the challenge doesn't have a bounding polygon, build one from the
    // markers instead. This is extra work and requires waiting for the clustered
    // task data to arrive, so not ideal.
    if (!bounding && markers.length > 0) {
      bounding = bboxPolygon(
        bbox(featureCollection(
          _map(markers, marker => point([marker.position[1], marker.position[0]]))
        ))
      )
    }

    // Note: would like to enable chunkedLoading, but enabling runs into
    // https://github.com/Leaflet/Leaflet.markercluster/issues/743 on
    // challenges with a large number of tasks. So disable for now.
    return (
      <div key={this.props.challenge.id}
           className={classNames('challenge-task-map', this.props.className)}>
        <div className="field cluster-tasks-control" onClick={this.toggleClusterTasks}>
          <input type="checkbox" className="switch is-rounded"
                  checked={this.state.clusterTasks}
                  onChange={() => null} />
          <label>
            <FormattedMessage {...messages.clusterTasksLabel } />
          </label>
        </div>

        <LayerToggle {...this.props} />
        <EnhancedMap center={latLng(0, 45)}
                     zoom={_get(this.props.lastZoom, 3)} minZoom={1} maxZoom={18}
                     setInitialBounds={false}
                     initialBounds = {_get(this.props, 'lastBounds', this.currentBounds)}
                     zoomControl={false} animate={true}
                     features={this.props.lastBounds ? undefined : bounding}
                     justFitFeatures={markers.length > 0}
                     onBoundsChange={this.updateBounds}>
          <ZoomControl position='topright' />
          <SourcedTileLayer {...this.props} />
          {markers.length > 0 &&
              <MarkerClusterGroup key={Date.now()} markers={markers}
                options={{
                  disableClusteringAtZoom: this.state.clusterTasks ? 19 : 1,
                  iconCreateFunction: this.props.monochromaticClusters ?
                                      this.clusterIcon : undefined,
                }}
              />
          }
        </EnhancedMap>

        {loadingClusteredTasks && <BusySpinner />}
      </div>
    )
  }
}

ChallengeTaskMap.propTypes = {
  /** The current challenge being shown */
  challenge: PropTypes.object.isRequired,
  /** The tasks to map */
  taskInfo: PropTypes.shape({
    challengeId: PropTypes.number,
    loading: PropTypes.bool,
    tasks: PropTypes.array,
  }),
  /** Color codings for the various task statuses */
  statusColors: PropTypes.object.isRequired,
  /** Options for filtering displayed tasks */
  filterOptions: PropTypes.object,
  /** Invoked when the user moves or zooms the map */
  setChallengeMapBounds: PropTypes.func,
  /** Optional default map layer to display */
  defaultLayer: PropTypes.object,
  /** Set to true to render monochromatic cluster icons */
  monochromaticClusters: PropTypes.bool,
}

ChallengeTaskMap.defaultProps = {
  filterOptions: {},
  greyscaleClusters: false,
}

export default WithStatus(WithVisibleLayer(injectIntl(ChallengeTaskMap)))
