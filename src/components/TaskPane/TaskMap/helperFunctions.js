import booleanContains from '@turf/boolean-contains'
import booleanDisjoint from '@turf/boolean-disjoint'
import bboxPolygon from '@turf/bbox-polygon'
import { Point } from 'leaflet'
import _isArray from 'lodash/isArray'
import _filter from 'lodash/filter'
import _reduce from 'lodash/reduce'
import _sortBy from 'lodash/sortBy'

const PIXEL_MARGIN = 10

export const animateFeatures = () => {
  const paths = document.querySelectorAll('.task-map .leaflet-pane path.leaflet-interactive')
  if (paths.length > 0) {
    for (let path of paths) {
      pathComplete(path).then(pathLength => {
        path.style.strokeDasharray = `${pathLength} ${pathLength}`
        path.style.strokeDashoffset = pathLength
        
        path.addEventListener("transitionend", () => {
          path.style.strokeDasharray = 'none'
        })
        
        path.getBoundingClientRect()
        path.style.transition = 'stroke-dashoffset 1s ease-in-out'
        path.style.strokeDashoffset = '0'
        path.style.opacity = '1'
      })
    }
  }

  const markers = document.querySelectorAll('.task-map .leaflet-marker-pane')
  if (markers) {
    for (let marker of markers) {
      marker.classList.remove('animated')
      setTimeout(() => marker.classList.add('animated'), 100)
    }
  }
}

export const isClickOnMarker = (clickBounds, marker, map) => {
  const icon = marker.getIcon()
  const iconOptions = Object.assign({}, Object.getPrototypeOf(icon).options, icon.options)
  const markerPoint = map.containerPointToLayerPoint(
    map.latLngToContainerPoint(marker.getLatLng())
  )

  if (!_isArray(iconOptions.iconAnchor) || !_isArray(iconOptions.iconSize)) {
    return false
  }

  const nw = map.layerPointToLatLng(new Point(
    markerPoint.x - iconOptions.iconAnchor[0],
    markerPoint.y - iconOptions.iconAnchor[1]
  ))
  const se = map.layerPointToLatLng(new Point(
    markerPoint.x + (iconOptions.iconSize[0] - iconOptions.iconAnchor[0]),
    markerPoint.y + (iconOptions.iconSize[1] - iconOptions.iconAnchor[1])
  ))
  const markerPolygon = bboxPolygon([nw.lng, se.lat, se.lng, nw.lat])

  return !booleanDisjoint(clickBounds, markerPolygon)
}

export const getClickPolygon = (clickEvent, map) => {
  const center = clickEvent.layerPoint
  const nw = map.layerPointToLatLng(new Point(center.x - PIXEL_MARGIN, center.y - PIXEL_MARGIN))
  const se = map.layerPointToLatLng(new Point(center.x + PIXEL_MARGIN, center.y + PIXEL_MARGIN))
  return bboxPolygon([nw.lng, se.lat, se.lng, nw.lat])
}

export const pathComplete = (path, priorLength, subsequentCheck = false) => {
  return new Promise(resolve => {
    const currentLength = path.getTotalLength()
    if (subsequentCheck && currentLength === priorLength) {
      resolve(currentLength)
      return
    }

    setTimeout(() => {
      pathComplete(path, currentLength, true).then(length => resolve(length))
    }, 100)
  })
}

export const orderedFeatureLayers = (layers) => {
  if (!layers || layers.length < 2) {
    return layers
  }

  const geometryOrder = ['Point', 'MultiPoint', 'LineString', 'MultiLineString']
  const orderedLayers = _sortBy(
    _filter(layers, l => geometryOrder.indexOf(l.geometry.type) !== -1),
    l => geometryOrder.indexOf(l.geometry.type)
  )
  
  const polygonLayers = _filter(layers, l => l.geometry.type === 'Polygon' || l.geometry.type === 'MultiPolygon')
  const orderedPolygons = polygonLayers.length < 2 ? polygonLayers : _sortBy(
    polygonLayers,
    l => _reduce(
      polygonLayers,
      (count, other) => {
        return booleanContains(other.geometry, l.geometry) ? count + 1 : count
      },
      0
    )
  ).reverse()

  return orderedLayers.concat(orderedPolygons)
}
