import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { LayerGroup, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import _map from 'lodash/map'
import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../../../tailwind.config.js'

const colors = resolveConfig(tailwindConfig).theme.colors

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

  const {images, markerColor, imageAlt, imageClicked, icon, mrLayerId, mrLayerLabel, style} = props
  useEffect(() => {
    setImageMarkers(
      buildImageMarkers(
        images,
        icon ? icon : circleIcon(markerColor),
        imageClicked,
        imageAlt,
        mrLayerId,
        mrLayerLabel
      )
    )
  }, [images, markerColor, imageAlt, imageClicked, icon, mrLayerId, mrLayerLabel])

  return (
    <LayerGroup style={style}>
      {imageMarkers}
    </LayerGroup>
  )
}

ImageMarkerLayer.propTypes = {
  layerKey: PropTypes.string,
  images: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string,
    url: PropTypes.string,
    position: PropTypes.object,
  })),
  imageClicked: PropTypes.func,
  imageAlt: PropTypes.string,
  buildIcon: PropTypes.func,
  markerColor: PropTypes.string,
}

const buildImageMarkers = (images, icon, imageClicked, imageAlt, layerId, layerLabel) => {
  if (!images || images.length === 0) {
    return []
  }

  return _map(images, imageInfo =>
    <Marker
      key={imageInfo.key}
      mrLayerId={layerId}
      mrLayerLabel={layerLabel}
      position={[imageInfo.lat, imageInfo.lon]}
      icon={icon}
      onMouseover={({target}) => target.openPopup()}
      onClick={() => imageClicked ? imageClicked(imageInfo.key) : null}
    >
      <Popup>
        <img
          src={imageInfo.url}
          alt={imageAlt}
          onClick={() => imageClicked ? imageClicked(imageInfo.key) : null}
        />
      </Popup>
    </Marker>
  )
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
