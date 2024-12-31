import { useLeafletContext } from "@react-leaflet/core";
import { featureCollection } from "@turf/helpers";
import L from "leaflet";
import _isFunction from "lodash/isFunction";
import _uniqueId from "lodash/uniqueId";
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { injectIntl } from "react-intl";
import { IntlProvider } from "react-intl";
import { GeoJSON, useMap } from "react-leaflet";
import resolveConfig from "tailwindcss/resolveConfig";
import AsSimpleStyleableFeature from "../../../interactions/TaskFeature/AsSimpleStyleableFeature";
import tailwindConfig from "../../../tailwind.config.js";
import layerMessages from "../LayerToggle/Messages";
import PropertyList from "../PropertyList/PropertyList";

const colors = resolveConfig(tailwindConfig).theme.colors;
const HIGHLIGHT_SIMPLESTYLE = {
  "marker-color": colors.gold,
  stroke: colors.gold,
  "stroke-width": 7,
  fill: colors.gold,
};

/**
 * TaskFeatureLayer renders a react-leaflet map layer representing the given
 * (GeoJSON) features, properly styled and with a popup for the feature
 * properties
 */
const TaskFeatureLayer = (props) => {
  const [layer, setLayer] = useState(null);
  const map = useMap();
  const leaflet = useLeafletContext();

  const propertyList = (featureProperties, onBack) => {
    const contentElement = document.createElement("div");
    contentElement.style.maxHeight = "300px";
    ReactDOM.render(
      <IntlProvider
        key={props.intl.locale}
        locale={props.intl.locale}
        messages={props.intl.messages}
        textComponent="span"
      >
        <PropertyList featureProperties={featureProperties} onBack={onBack} />
      </IntlProvider>,
      contentElement,
    );
    return contentElement;
  };

  const { features, mrLayerId, animator, externalInteractive } = props;
  const layerLabel = props.intl.formatMessage(layerMessages.showTaskFeaturesLabel);
  const pane = leaflet?.pane;

  useEffect(() => {
    const newLayer = (
      <GeoJSON
        key={_uniqueId()}
        mrLayerId={mrLayerId}
        mrLayerLabel={layerLabel}
        data={featureCollection(features)}
        pointToLayer={(point, latLng) => {
          return L.marker(latLng, { pane, mrLayerLabel: layerLabel, mrLayerId: mrLayerId });
        }}
        onEachFeature={(feature, layer) => {
          const styleableFeature = _isFunction(feature.styleLeafletLayer)
            ? feature
            : AsSimpleStyleableFeature(feature);

          if (externalInteractive) {
            layer.on("click", (e) => {
              if (!layer._map) return; // Check if layer is still on the map

              L.popup({}, layer)
                .setLatLng(e.latlng)
                .setContent(propertyList(feature.properties))
                .openOn(map);

              styleableFeature.pushLeafletLayerSimpleStyles(
                layer,
                {
                  ...styleableFeature.markerSimplestyles(layer),
                  ...HIGHLIGHT_SIMPLESTYLE,
                },
                "mr-external-interaction:popup-open",
              );

              const previewHandler = () => {
                if (layer._map) {
                  styleableFeature.pushLeafletLayerSimpleStyles(
                    layer,
                    {
                      ...styleableFeature.markerSimplestyles(layer),
                      ...HIGHLIGHT_SIMPLESTYLE,
                    },
                    "mr-external-interaction:popup-open",
                  );
                }
              };

              layer.on("mr-external-interaction:start-preview", previewHandler);

              const popupCloseHandler = () => {
                if (layer._map) {
                  styleableFeature.popLeafletLayerSimpleStyles(
                    layer,
                    "mr-external-interaction:popup-open",
                  );
                  styleableFeature.popLeafletLayerSimpleStyles(
                    layer,
                    "mr-external-interaction:start-preview",
                  );
                }
                map.off("popupclose", popupCloseHandler);
                layer.off("mr-external-interaction:start-preview", previewHandler);
              };

              map.on("popupclose", popupCloseHandler);
            });

            if (
              feature.geometry.type !== "Point" &&
              feature.geometry.type !== "GeometryCollection"
            ) {
              layer.on("mouseover", () => {
                if (!layer._map) return; // Check if layer is still on the map

                styleableFeature.pushLeafletLayerSimpleStyles(
                  layer,
                  {
                    ...styleableFeature.markerSimplestyles(layer),
                    ...HIGHLIGHT_SIMPLESTYLE,
                  },
                  "mr-external-interaction:start-preview",
                );

                const mouseoutHandler = () => {
                  if (layer._map) {
                    styleableFeature.popLeafletLayerSimpleStyles(
                      layer,
                      "mr-external-interaction:start-preview",
                    );
                  }
                  layer.off("mouseout", mouseoutHandler);
                };

                layer.on("mouseout", mouseoutHandler);
              });
            }
          }

          if (animator) {
            const oldOnAdd = layer.onAdd;
            layer.onAdd = (map) => {
              oldOnAdd.call(layer, map);
              animator.scheduleAnimation();
            };
          }

          styleableFeature.styleLeafletLayer(layer); // Custom layer styling
        }}
      />
    );

    setLayer(newLayer);
  }, [features, mrLayerId, pane, animator, externalInteractive, layerLabel, map]);

  return layer;
};

export default injectIntl(TaskFeatureLayer);
