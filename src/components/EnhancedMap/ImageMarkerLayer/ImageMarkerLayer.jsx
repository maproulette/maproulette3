import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { LayerGroup, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import _map from 'lodash/map'
import { Viewer } from 'mapillary-js'
import resolveConfig from 'tailwindcss/resolveConfig'
import { getAccessToken } from '../../../services/Mapillary/Mapillary'
import tailwindConfig from '../../../tailwind.config.js'
import { FormattedMessage } from 'react-intl'
import messages from './Messages.js'

const colors = resolveConfig(tailwindConfig).theme.colors
const imageCache = new Map();

/**
 * ImageMarkerLayer renders a layer of positioned image markers that, on hover,
 * display the image in a popup. If the marker or popup is clicked then the
 * `imageClicked` function is invoked with the image key.
 *
 * Each image must be an object containing `key`, `url,` and `position` (with `lat` and
 * `lon`) fields
 *
 * Pass a `markerColor` prop with the desired marker color, or an `icon` if you
 * wish to supply your own icon
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const ImageMarkerLayer = props => {
  const [imageMarkers, setImageMarkers] = useState([])
  const map = useMap()

  const { images, markerColor = colors["blue-leaflet"], imageClicked, icon, mrLayerId, mrLayerLabel, style } = props

  useEffect(() => {
    if (!map.getPane('mapillaryPopups')) {
      map.createPane('mapillaryPopups').style.zIndex = 700
    }

    setImageMarkers(
      buildImageMarkers(
        images,
        icon || circleIcon(markerColor),
        markerColor,
        imageClicked,
        mrLayerId,
        mrLayerLabel
      )
    )
  }, [images, markerColor, imageClicked, icon, mrLayerId, mrLayerLabel, map])

  return (
    <LayerGroup style={style}>
      {imageMarkers}
    </LayerGroup>
  )
}

ImageMarkerLayer.propTypes = {
  images: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  })).isRequired,
  imageClicked: PropTypes.func.isRequired,
  markerColor: PropTypes.string,
}

const MapillaryViewer = ({ initialImageKey }) => {
  const containerRef = useRef()

  useEffect(() => {
    const accessToken = getAccessToken();

    if (!initialImageKey || !accessToken) return

    const viewer = imageCache.has(initialImageKey) ? imageCache.get(initialImageKey) : new Viewer({
      accessToken,
      container: containerRef.current,
      imageId: initialImageKey,
    });
    imageCache.set(initialImageKey, viewer);

    return () => viewer && viewer.remove();
  }, [initialImageKey])

  return (
    <div className="mr-p-2 mr-pt-4 mr-relative">
      <div ref={containerRef} id="mapillary-viewer" className="mr-w-full mr-h-64"></div>
    </div>
  )
}

const getLatLng = (imageInfo) => {
  const lat = imageInfo.position?.lat ?? imageInfo.lat;
  const lon = imageInfo.position?.lon ?? imageInfo.lon;
  return (lat !== undefined && lon !== undefined) ? [lat, lon] : null;
}

const buildImageMarkers = (images, icon, markerColor, imageClicked, layerId, layerLabel) => {
  try {
    if (!images?.length) {
      return []
    }

    return _map(images, imageInfo => {
      const imageLatLon = getLatLng(imageInfo);
      if (!imageInfo || !imageLatLon) {
        console.error(`Invalid position for image key: ${imageInfo?.key}`, imageInfo)
        return null
      }

      if (!imageInfo.url) {
        console.error(`Invalid URL for image key: ${imageInfo.key}`, imageInfo)
        return null
      }

      const [lat, lon] = imageLatLon;

      return (
        <Marker
          key={imageInfo.key}
          mrLayerId={layerId}
          mrLayerLabel={layerLabel}
          position={[lat, lon]}
          icon={icon}
        >
          <Popup pane="mapillaryPopups" maxWidth="351px" offset={[0, 5]}>
            <div style={{ width: 351, marginTop: 5 }}>
              <MapillaryViewer initialImageKey={imageInfo.key} />
            </div>
            <div
              style={{
                width: '100%',
                textAlign: 'center',
                color: markerColor,
                cursor: 'pointer',
                fontSize: '1.25rem',
                padding: '8px',
                transition: 'background-color 0.3s, color 0.3s'
              }}
              onClick={() => {
                imageClicked(imageInfo.key)
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = markerColor
                e.currentTarget.style.color = 'white'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = markerColor
              }}
            >
              <FormattedMessage {...messages.openView} />
            </div>
          </Popup>
        </Marker>
      )
    }).filter(Boolean)
  } catch (error) {
    console.error('Error building image markers:', error)
    return []
  }
}

const circleIcon = (color = colors["blue-leaflet"]) => {
  return L.vectorIcon({
    svgHeight: 12,
    svgWidth: 12,
    viewBox: '0 0 12 12',
    type: 'circle',
    shape: { r: 6, cx: 6, cy: 6 },
    style: { fill: color },
  })
}

export default ImageMarkerLayer
