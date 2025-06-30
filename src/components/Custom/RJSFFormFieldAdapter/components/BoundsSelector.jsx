import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useMap } from "react-leaflet";
import "leaflet-lasso";
import Modal from "../../../Modal/Modal";
import SvgSymbol from "../../../SvgSymbol/SvgSymbol";
import messages from "./Messages";

// Simple color scheme for priority types
const PRIORITY_COLORS = {
  high: { base: "#FF0000", hover: "#FF3333" },
  medium: { base: "#FFA500", hover: "#FFB733" },
  low: { base: "#008000", hover: "#33A033" },
  default: { base: "#3388FF", hover: "#66A3FF" },
};

const getColor = (priorityType, state = "base") => {
  return PRIORITY_COLORS[priorityType]?.[state] || PRIORITY_COLORS.default[state];
};

const BoundsSelector = ({ value, onChange, priorityType, allPriorityBounds = {} }) => {
  const intl = useIntl();
  const map = useMap();
  const [selecting, setSelecting] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [selectedPolygon, setSelectedPolygon] = useState(null);

  // Modal close handlers that prevent form submission
  const handleCloseRemoveModal = (e) => {
    e?.preventDefault();
    setShowRemoveModal(false);
  };

  const handleCloseClearAllModal = (e) => {
    e?.preventDefault();
    setShowClearAllModal(false);
  };

  const featureGroupRef = useRef(null);
  const otherPriorityGroupRef = useRef(null);
  const lassoRef = useRef(null);
  const controlRef = useRef(null);

  // Initialize and cleanup
  useEffect(() => {
    if (!map) return;

    featureGroupRef.current = new L.FeatureGroup();
    otherPriorityGroupRef.current = new L.FeatureGroup();
    map.addLayer(featureGroupRef.current);
    map.addLayer(otherPriorityGroupRef.current);

    // Create custom control
    createMapControl();

    // Restore existing polygons
    restorePolygons();

    // Display other priority polygons
    displayOtherPriorityPolygons();

    return () => {
      cleanupLasso();
      if (controlRef.current && map) {
        map.removeControl(controlRef.current);
      }
      if (featureGroupRef.current && map) {
        map.removeLayer(featureGroupRef.current);
      }
      if (otherPriorityGroupRef.current && map) {
        map.removeLayer(otherPriorityGroupRef.current);
      }
    };
  }, [map]);

  // Update polygons when value changes
  useEffect(() => {
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
      restorePolygons();
    }
  }, [value]);

  // Update other priority polygons when allPriorityBounds changes
  useEffect(() => {
    if (otherPriorityGroupRef.current) {
      otherPriorityGroupRef.current.clearLayers();
      displayOtherPriorityPolygons();
    }
  }, [allPriorityBounds, priorityType]);

  const restorePolygons = () => {
    if (!featureGroupRef.current || !Array.isArray(value)) return;

    value.forEach((feature) => {
      try {
        const coords = feature.geometry.coordinates[0].map((coord) => [coord[1], coord[0]]);
        const polygon = createPolygon(coords);
        featureGroupRef.current.addLayer(polygon);
      } catch (error) {
        console.error("Error restoring polygon:", error);
      }
    });
  };

  const createPolygon = (coords) => {
    const polygon = L.polygon(coords, {
      color: getColor(priorityType, "base"),
      weight: 2,
      fillOpacity: 0.3,
    });

    polygon.on("click", (e) => {
      L.DomEvent.stopPropagation(e);
      setSelectedPolygon(polygon);
      setShowRemoveModal(true);
    });

    polygon.on("mouseover", () => {
      polygon.setStyle({
        color: getColor(priorityType, "hover"),
        weight: 3,
      });
    });

    polygon.on("mouseout", () => {
      polygon.setStyle({
        color: getColor(priorityType, "base"),
        weight: 2,
      });
    });

    return polygon;
  };

  const displayOtherPriorityPolygons = () => {
    if (!otherPriorityGroupRef.current || !allPriorityBounds) {
      return;
    }

    // Display polygons from other priority types
    Object.entries(allPriorityBounds).forEach(([type, bounds]) => {
      // Skip the current priority type
      const currentPriorityKey = `${priorityType}PriorityBounds`;
      if (type === currentPriorityKey || !Array.isArray(bounds) || bounds.length === 0) {
        return;
      }

      // Determine the priority type for coloring
      let displayType = "default";
      if (type.includes("high")) displayType = "high";
      else if (type.includes("medium")) displayType = "medium";
      else if (type.includes("low")) displayType = "low";

      bounds.forEach((feature) => {
        try {
          if (feature?.geometry?.coordinates?.[0]) {
            const coords = feature.geometry.coordinates[0].map((coord) => [coord[1], coord[0]]);

            const polygon = L.polygon(coords, {
              color: getColor(displayType, "base"),
              weight: 2,
              opacity: 0.6,
              fillOpacity: 0.2,
              dashArray: "8, 8", // Dashed line to distinguish from current priority
              interactive: false, // Make them non-interactive
            });

            otherPriorityGroupRef.current.addLayer(polygon);
          }
        } catch (error) {
          console.error("Error displaying other priority polygon:", error);
        }
      });
    });
  };

  const syncWithParent = () => {
    if (!featureGroupRef.current) return;

    const layers = featureGroupRef.current.getLayers();
    const geoJsonFeatures = layers
      .map((polygon) => {
        try {
          const geoJSON = polygon.toGeoJSON();
          if (!geoJSON.properties) geoJSON.properties = {};
          if (!geoJSON.properties.name) {
            geoJSON.properties.name = `Polygon ${Date.now()}`;
          }
          return geoJSON;
        } catch (error) {
          console.error("Error converting polygon:", error);
          return null;
        }
      })
      .filter(Boolean);

    onChange(geoJsonFeatures);
  };

  const cleanupLasso = () => {
    if (lassoRef.current) {
      if (typeof lassoRef.current.disable === "function") {
        lassoRef.current.disable();
      }
      map.off("lasso.finished");
      lassoRef.current = null;
    }
  };

  const handleLassoSelection = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (selecting) {
      cleanupLasso();
      setSelecting(false);
      return;
    }

    setSelecting(true);

    try {
      const handleLassoFinished = (e) => {
        if (e.latLngs?.length >= 3) {
          const polygon = createPolygon(e.latLngs);
          featureGroupRef.current.addLayer(polygon);
          syncWithParent();
        }
        cleanupLasso();
        setSelecting(false);
      };

      map.on("lasso.finished", handleLassoFinished);

      if (typeof L.Lasso === "function") {
        lassoRef.current = new L.Lasso(map, {
          polygon: {
            color: getColor(priorityType, "hover"),
            weight: 2,
          },
        });
        lassoRef.current.enable();
      }
    } catch (error) {
      console.error("Error with lasso:", error);
      cleanupLasso();
      setSelecting(false);
    }
  };

  const handleRemovePolygon = (e) => {
    e?.preventDefault();
    if (selectedPolygon && featureGroupRef.current) {
      featureGroupRef.current.removeLayer(selectedPolygon);
      syncWithParent();
      handleCloseRemoveModal();
      setSelectedPolygon(null);
    }
  };

  const clearAllPolygons = (e) => {
    e?.preventDefault();
    setShowClearAllModal(true);
  };

  const handleClearAllPolygons = (e) => {
    e?.preventDefault();
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
      syncWithParent();
      handleCloseClearAllModal();
    }
  };

  const recenterOnPolygons = () => {
    if (!featureGroupRef.current || !map) return;

    const layers = featureGroupRef.current.getLayers();
    if (layers.length === 0) return;

    try {
      // Get bounds of all polygons
      const group = new L.FeatureGroup(layers);
      const bounds = group.getBounds();

      if (bounds.isValid()) {
        // Fit the map to the bounds with padding
        map.fitBounds(bounds, {
          padding: [20, 20],
          maxZoom: 16, // Prevent zooming in too far
          animate: true,
          duration: 0.5,
        });
      }
    } catch (error) {
      console.error("Error recentering on polygons:", error);
    }
  };

  const createMapControl = () => {
    const LassoControl = L.Control.extend({
      onAdd: function () {
        const div = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-custom");

        div.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        div.style.borderRadius = "8px";
        div.style.padding = "8px";
        div.style.backdropFilter = "blur(4px)";

        const buttonsContainer = L.DomUtil.create("div", "", div);
        buttonsContainer.style.display = "flex";
        buttonsContainer.style.flexDirection = "column";
        buttonsContainer.style.gap = "8px";

        // Lasso button
        const lassoButton = L.DomUtil.create("button", "", buttonsContainer);
        lassoButton.type = "button"; // Prevent form submission
        lassoButton.innerHTML = `
          <svg viewBox="0 0 512 512" style="width: 24px; height: 24px; color: #16a34a;">
            <use href="#lasso-add-icon" />
          </svg>
        `;
        lassoButton.style.padding = "8px";
        lassoButton.style.borderRadius = "8px";
        lassoButton.style.backgroundColor = selecting ? "#dcfce7" : "white";
        lassoButton.style.border = "none";
        lassoButton.style.cursor = "pointer";
        lassoButton.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
        lassoButton.style.display = "flex";
        lassoButton.style.alignItems = "center";
        lassoButton.style.justifyContent = "center";
        lassoButton.title = selecting
          ? intl.formatMessage(messages.cancelLasso)
          : intl.formatMessage(messages.lassoSelect);

        L.DomEvent.on(lassoButton, "click", handleLassoSelection);
        L.DomEvent.disableClickPropagation(lassoButton);

        // Recenter and Clear buttons (if there are polygons)
        const polygonCount = featureGroupRef.current?.getLayers().length || 0;
        if (polygonCount > 0) {
          // Recenter button
          const recenterButton = L.DomUtil.create("button", "", buttonsContainer);
          recenterButton.type = "button"; // Prevent form submission
          recenterButton.innerHTML = `
            <svg viewBox="0 0 20 20" style="width: 24px; height: 24px; color: #3b82f6;">
              <use href="#target-icon" />
            </svg>
          `;
          recenterButton.style.padding = "8px";
          recenterButton.style.borderRadius = "8px";
          recenterButton.style.backgroundColor = "white";
          recenterButton.style.border = "none";
          recenterButton.style.cursor = "pointer";
          recenterButton.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
          recenterButton.style.display = "flex";
          recenterButton.style.alignItems = "center";
          recenterButton.style.justifyContent = "center";
          recenterButton.title = intl.formatMessage(messages.recenterOnPolygons);

          L.DomEvent.on(recenterButton, "click", recenterOnPolygons);
          L.DomEvent.disableClickPropagation(recenterButton);

          // Clear button
          const clearButton = L.DomUtil.create("button", "", buttonsContainer);
          clearButton.type = "button"; // Prevent form submission
          clearButton.innerHTML = `
            <svg viewBox="0 0 20 20" style="width: 24px; height: 24px; color: #dc2626;">
              <use href="#cross-icon" />
            </svg>
            <span style="position: absolute; top: -8px; right: -8px; background: #dc2626; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">${polygonCount}</span>
          `;
          clearButton.style.padding = "8px";
          clearButton.style.borderRadius = "8px";
          clearButton.style.backgroundColor = "white";
          clearButton.style.border = "none";
          clearButton.style.cursor = "pointer";
          clearButton.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
          clearButton.style.position = "relative";
          clearButton.style.display = "flex";
          clearButton.style.alignItems = "center";
          clearButton.style.justifyContent = "center";
          clearButton.title = intl.formatMessage(messages.clearAllPolygons);

          L.DomEvent.on(clearButton, "click", clearAllPolygons);
          L.DomEvent.disableClickPropagation(clearButton);
        }

        return div;
      },
    });

    controlRef.current = new LassoControl({ position: "topleft" });
    map.addControl(controlRef.current);
  };

  // Update control when selecting state changes
  useEffect(() => {
    if (controlRef.current && map) {
      // Remove and recreate control to update button state
      map.removeControl(controlRef.current);
      createMapControl();
    }
  }, [selecting, featureGroupRef.current?.getLayers().length]);

  // The component doesn't render anything directly - everything is handled by Leaflet controls
  return (
    <>
      {/* Remove polygon modal */}
      <div
        style={{
          zIndex: 99999,
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: showRemoveModal ? "auto" : "none",
        }}
      >
        <Modal isActive={showRemoveModal} onClose={handleCloseRemoveModal} extraNarrow>
          <div className="mr-text-center">
            <h3 className="mr-text-lg mr-font-medium mr-mb-4 mr-text-white">
              <FormattedMessage {...messages.removePolygon} />
            </h3>
            <div className="mr-flex mr-justify-end mr-gap-2">
              <button
                type="button"
                onClick={handleCloseRemoveModal}
                className="mr-button mr-button--white"
              >
                <FormattedMessage {...messages.cancel} />
              </button>
              <button
                type="button"
                onClick={handleRemovePolygon}
                className="mr-button mr-button--red mr-flex mr-items-center mr-gap-2"
              >
                <SvgSymbol sym="cross-icon" viewBox="0 0 20 20" className="mr-w-4 mr-h-4" />
                <FormattedMessage {...messages.remove} />
              </button>
            </div>
          </div>
        </Modal>
      </div>

      {/* Clear all polygons modal */}
      <div
        style={{
          zIndex: 99999,
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: showClearAllModal ? "auto" : "none",
        }}
      >
        <Modal isActive={showClearAllModal} onClose={handleCloseClearAllModal} extraNarrow>
          <div className="mr-text-center">
            <h3 className="mr-text-lg mr-font-medium mr-mb-4 mr-text-white">
              <FormattedMessage {...messages.clearAllPolygons} />
            </h3>
            <p className="mr-text-gray-300 mr-mb-6">
              <FormattedMessage
                {...messages.confirmClearAllMessage}
                values={{
                  count: featureGroupRef.current?.getLayers().length || 0,
                }}
              />
            </p>
            <div className="mr-flex mr-justify-end mr-gap-2">
              <button
                type="button"
                onClick={handleCloseClearAllModal}
                className="mr-button mr-button--white"
              >
                <FormattedMessage {...messages.cancel} />
              </button>
              <button
                type="button"
                onClick={handleClearAllPolygons}
                className="mr-button mr-button--red mr-flex mr-items-center mr-gap-2"
              >
                <SvgSymbol sym="cross-icon" viewBox="0 0 20 20" className="mr-w-4 mr-h-4" />
                <FormattedMessage {...messages.clearAll} />
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default BoundsSelector;
