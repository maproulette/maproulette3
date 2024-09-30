import React, { useState, useEffect, useMemo } from 'react'
import ReactDOM from 'react-dom'
import { GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import { injectIntl } from 'react-intl'
import { featureCollection } from '@turf/helpers'
import _isFunction from 'lodash/isFunction'
import _get from 'lodash/get'
import _uniqueId from 'lodash/uniqueId'
import AsSimpleStyleableFeature from '../../../interactions/TaskFeature/AsSimpleStyleableFeature'
import PropertyList from '../PropertyList/PropertyList'
import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../../../tailwind.config.js'
import layerMessages from '../LayerToggle/Messages'
import { IntlProvider } from 'react-intl'
import './TaskFeatureLayer.css' // Import the CSS file

const colors = resolveConfig(tailwindConfig).theme.colors
const HIGHLIGHT_SIMPLESTYLE = {
  "marker-color": colors.gold,
  stroke: colors.gold,
  "stroke-width": 7,
  fill: colors.gold,
}

/**
 * TaskFeatureLayer renders a react-leaflet map layer representing the given
 * (GeoJSON) features, properly styled and with a popup for the feature
 * properties
 */
const TaskFeatureLayer = ({ features, mrLayerId, animator, externalInteractive, intl, leaflet }) => {
  const [layer, setLayer] = useState(null)
  const map = useMap()

  const propertyList = (featureProperties, onBack) => {
    const contentElement = document.createElement('div')
    ReactDOM.render(
      <IntlProvider key={intl.locale} locale={intl.locale} messages={intl.messages} textComponent="span">
        <PropertyList featureProperties={featureProperties} onBack={onBack} />
      </IntlProvider>,
      contentElement
    )
    contentElement.classList.add('popup-content')
    return contentElement
  }

  const layerLabel = useMemo(() => intl.formatMessage(layerMessages.showTaskFeaturesLabel), [intl])
  const pane = _get(leaflet, 'pane')

  useEffect(() => {
    // Create custom panes for markers and popups with higher z-index
    const markerPane = map.createPane('markerPane')
    markerPane.style.zIndex = 650

    const popupPane = map.createPane('popupPane')
    popupPane.style.zIndex = 700

    const newLayer = (
      <GeoJSON
        key={_uniqueId()}
        mrLayerId={mrLayerId}
        mrLayerLabel={layerLabel}
        data={featureCollection(features)}
        pointToLayer={(point, latLng) => {
          return L.marker(latLng, { pane: 'markerPane', mrLayerLabel: layerLabel, mrLayerId })
        }}

        onEachFeature={(feature, layer) => {
          const styleableFeature = _isFunction(feature.styleLeafletLayer) ? feature : AsSimpleStyleableFeature(feature)

          if (!externalInteractive) {
            layer.bindPopup(() => propertyList(feature.properties), { pane: 'popupPane' })
          } else {
            layer.on('mr-external-interaction', ({ map, latlng, onBack }) => {
              styleableFeature.popLeafletLayerSimpleStyles(layer, 'mr-external-interaction:start-preview')
              const popup = L.popup({ pane: 'popupPane' }, layer).setLatLng(latlng).setContent(propertyList(feature.properties, onBack))
              styleableFeature.pushLeafletLayerSimpleStyles(
                layer,
                { ...styleableFeature.markerSimplestyles(layer), ...HIGHLIGHT_SIMPLESTYLE }
              )
              popup.on('remove', () => {
                if (layer && layer._leaflet_events) {
                  styleableFeature.popLeafletLayerSimpleStyles(layer)
                }
              })
              popup.openOn(map)
            })

            layer.on('mr-external-interaction:start-preview', () => {
              styleableFeature.pushLeafletLayerSimpleStyles(
                layer,
                { ...styleableFeature.markerSimplestyles(layer), ...HIGHLIGHT_SIMPLESTYLE },
                'mr-external-interaction:start-preview'
              )
            })

            layer.on('mr-external-interaction:end-preview', () => {
              styleableFeature.popLeafletLayerSimpleStyles(layer, 'mr-external-interaction:start-preview')
            })
          }

          if (animator) {
            const oldOnAdd = layer.onAdd
            layer.onAdd = map => {
              oldOnAdd.call(layer, map)
              animator.scheduleAnimation()
            }
          }

          styleableFeature.styleLeafletLayer(layer)
        }}
      />
    )

    setLayer(newLayer)
  }, [features, mrLayerId, pane, animator, externalInteractive, layerLabel, map])

  return layer
}

export default injectIntl(TaskFeatureLayer)
