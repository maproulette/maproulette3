import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { GeoJSON, withLeaflet } from 'react-leaflet'
import L from 'leaflet'
import _isFunction from 'lodash/isFunction'
import _get from 'lodash/get'
import _uniqueId from 'lodash/uniqueId'
import AsSimpleStyleableFeature
       from '../../../interactions/TaskFeature/AsSimpleStyleableFeature'
import PropertyList from '../PropertyList/PropertyList'

/**
 * TaskFeatureLayer renders a react-leaflet map layer representing the given
 * (GeoJSON) features, properly styled and with a popup for the feature
 * properties
 */
const TaskFeatureLayer = props => {
  const [layer, setLayer] = useState(null)

  const propertyList = featureProperties => {
    const contentElement = document.createElement('div')
    ReactDOM.render(
      <PropertyList featureProperties={featureProperties} />,
      contentElement
    )
    return contentElement
  }

  const { features, mrLayerId, animator } = props
  const pane = _get(props, 'leaflet.pane')

  useEffect(() => {
    setLayer(
      <GeoJSON
        key={_uniqueId()}
        mrLayerId={mrLayerId}
        data={features}
        pointToLayer={(point, latLng) => {
          return L.marker(latLng, { pane })
        }}
        onEachFeature={(feature, layer) => {
          layer.bindPopup(() => propertyList(feature.properties))

          // Animate features when added to map (if requested)
          if (animator) {
            const oldOnAdd = layer.onAdd
            layer.onAdd = map => {
              oldOnAdd.call(layer, map)
              animator.scheduleAnimation()
            }
          }

          // Support custom layer styling
          if (_isFunction(feature.styleLeafletLayer)) {
            feature.styleLeafletLayer(layer)
          }
          else {
            AsSimpleStyleableFeature(feature).styleLeafletLayer(layer)
          }
        }}
      />
    )
  }, [features, mrLayerId, pane, animator])

  return layer
}

export default withLeaflet(TaskFeatureLayer)
