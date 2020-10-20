import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { GeoJSON, withLeaflet } from 'react-leaflet'
import L from 'leaflet'
import { injectIntl } from 'react-intl'
import _isFunction from 'lodash/isFunction'
import _get from 'lodash/get'
import _uniqueId from 'lodash/uniqueId'
import AsSimpleStyleableFeature
       from '../../../interactions/TaskFeature/AsSimpleStyleableFeature'
import PropertyList from '../PropertyList/PropertyList'
import layerMessages from '../LayerToggle/Messages'

const HIGHLIGHT_COLOR = "gold"

/**
 * TaskFeatureLayer renders a react-leaflet map layer representing the given
 * (GeoJSON) features, properly styled and with a popup for the feature
 * properties
 */
const TaskFeatureLayer = props => {
  const [layer, setLayer] = useState(null)

  const propertyList = (featureProperties, onBack) => {
    const contentElement = document.createElement('div')
    ReactDOM.render(
      <PropertyList featureProperties={featureProperties} onBack={onBack} />,
      contentElement
    )
    return contentElement
  }

  const { features, mrLayerId, animator, externalInteractive } = props
  const layerLabel = props.intl.formatMessage(layerMessages.showTaskFeaturesLabel)
  const pane = _get(props, 'leaflet.pane')

  useEffect(() => {
    setLayer(
      <GeoJSON
        key={_uniqueId()}
        mrLayerId={mrLayerId}
        mrLayerLabel={layerLabel}
        data={features}
        pointToLayer={(point, latLng) => {
          return L.marker(latLng, {pane, mrLayerLabel: layerLabel, mrLayerId: mrLayerId})
        }}
        onEachFeature={(feature, layer) => {
          const styleableFeature =
            _isFunction(feature.styleLeafletLayer) ?
            feature :
            AsSimpleStyleableFeature(feature)

          if (!externalInteractive) {
            layer.bindPopup(() => propertyList(feature.properties))
          }
          else {
            layer.on('mr-external-interaction', ({map, latlng, onBack}) => {
              // Ensure any orphaned preview styles get cleaned up
              styleableFeature.popLeafletLayerSimpleStyles(layer, 'mr-external-interaction:start-preview')
              const popup = L.popup({}, layer).setLatLng(latlng).setContent(propertyList(feature.properties, onBack))
              // Highlight selected feature, preserving existing marker size (if a marker)
              styleableFeature.pushLeafletLayerSimpleStyles(
                layer,
                Object.assign(styleableFeature.markerSimplestyles(layer), {
                  "marker-color": HIGHLIGHT_COLOR,
                  stroke: HIGHLIGHT_COLOR,
                  fill: HIGHLIGHT_COLOR,
                })
              )
              popup.on('remove', function() {
                // Restore original styling when popup closes
                styleableFeature.popLeafletLayerSimpleStyles(layer)
              })
              popup.openOn(map)
            })

            layer.on('mr-external-interaction:start-preview', () => {
              styleableFeature.pushLeafletLayerSimpleStyles(
                layer,
                Object.assign(styleableFeature.markerSimplestyles(layer), {
                  "marker-color": HIGHLIGHT_COLOR,
                  stroke: HIGHLIGHT_COLOR,
                  fill: HIGHLIGHT_COLOR,
                }),
                'mr-external-interaction:start-preview'
              )
            })

            layer.on('mr-external-interaction:end-preview', () => {
              styleableFeature.popLeafletLayerSimpleStyles(layer, 'mr-external-interaction:start-preview')
            })
          }

          // Animate features when added to map (if requested)
          if (animator) {
            const oldOnAdd = layer.onAdd
            layer.onAdd = map => {
              oldOnAdd.call(layer, map)
              animator.scheduleAnimation()
            }
          }

          styleableFeature.styleLeafletLayer(layer) // Custom layer styling
        }}
      />
    )
  }, [features, mrLayerId, pane, animator, externalInteractive, layerLabel])

  return layer
}

export default withLeaflet(injectIntl(TaskFeatureLayer))
