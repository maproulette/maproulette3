import React, { useEffect } from 'react'
import { ZoomControl, Pane, MapContainer, useMap } from 'react-leaflet'
import _get from 'lodash/get'
import _isObject from 'lodash/isObject'
import _isEmpty from 'lodash/isEmpty'
import _sortBy from 'lodash/sortBy'
import _map from 'lodash/map'
import _uniqueId from 'lodash/uniqueId'
import { MIN_ZOOM, MAX_ZOOM, DEFAULT_ZOOM }
       from '../../services/Challenge/ChallengeZoom/ChallengeZoom'
import { buildLayerSources, DEFAULT_OVERLAY_ORDER }
       from '../../services/VisibleLayer/LayerSources'
import WithTaskCenterPoint
       from '../HOCs/WithTaskCenterPoint/WithTaskCenterPoint'
import WithIntersectingOverlays
       from '../HOCs/WithIntersectingOverlays/WithIntersectingOverlays'
import WithVisibleLayer from '../HOCs/WithVisibleLayer/WithVisibleLayer'
import SourcedTileLayer
       from '../EnhancedMap/SourcedTileLayer/SourcedTileLayer'
import LayerToggle from '../EnhancedMap/LayerToggle/LayerToggle'
import BusySpinner from '../BusySpinner/BusySpinner'

const SupplementalMapContent = props => {
  const map = useMap()
  const { task, user, trackedBounds, trackedZoom, h, w } = props

  // Follow the tracked map, if provided
  useEffect(() => {
    if (map && trackedBounds) {
      if (trackedBounds.isValid()) {
        map.setView(trackedBounds.getCenter(), trackedZoom)
      }
    }
  }, [trackedBounds, trackedZoom])

  // Inform Leaflet if our map size changes
  useEffect(() => {
    if (map) {
      map.invalidateSize()
    }
  }, [h, w])

  if (!task || !_isObject(task.parent)) {
    return <BusySpinner />
  }


  const renderId = _uniqueId()
  let overlayOrder = props.getUserAppSetting(user, 'mapOverlayOrder')
  if (_isEmpty(overlayOrder)) {
    overlayOrder = DEFAULT_OVERLAY_ORDER
  }

  let overlayLayers = buildLayerSources(
    props.visibleOverlays, _get(user, 'settings.customBasemaps'),
    (layerId, index, layerSource) => ({
      id: layerId,
      component: <SourcedTileLayer key={layerId} source={layerSource} mrLayerId={layerId} />,
    })
  )

  // Sort the overlays according to the user's preferences. We then reverse
  // that order because the layer rendered on the map last will be on top
  if (overlayOrder && overlayOrder.length > 0) {
    overlayLayers = _sortBy(overlayLayers, layer => {
      const position = overlayOrder.indexOf(layer.id)
      return position === -1 ? Number.MAX_SAFE_INTEGER : position
    }).reverse()
  }

  // Note: we need to also pass maxZoom to the tile layer (in addition to the
  // map), or else leaflet won't autoscale if the zoom goes beyond the
  // capabilities of the layer.
  return (<>
    <LayerToggle {...props} overlayOrder={overlayOrder} />
        <ZoomControl position='topright' />
        <SourcedTileLayer maxZoom={props.maxZoom} {...props} />
        {_map(overlayLayers, (layer, index) => (
          <Pane
            key={`pane-${renderId}-${index}`}
            name={`pane-${renderId}-${index}`}
            style={{zIndex: 10 + index}}
            className="custom-pane"
          >
            {layer.component}
          </Pane>
        ))}
        </>
  )
}

const SupplementalMap = (props) => {
  const zoom = _get(props, "task.parent.defaultZoom", DEFAULT_ZOOM)
  const minZoom = _get(props, "task.parent.minZoom", MIN_ZOOM)
  const maxZoom = _get(props, "task.parent.maxZoom", MAX_ZOOM)
  return (
    <div className="task-map">
      <MapContainer
        taskBundle={props.taskBundle}
        center={props.centerPoint}
        zoom={zoom}
        zoomControl={false}
        minZoom={minZoom}
        maxZoom={maxZoom}
        worldCopyJump={true}
        intl={props.intl}
      >
        <SupplementalMapContent {...props} />
      </MapContainer>
    </div>
  )
}

export default
WithTaskCenterPoint(
  WithVisibleLayer(
    WithIntersectingOverlays(
      SupplementalMap
    )
  )
)
