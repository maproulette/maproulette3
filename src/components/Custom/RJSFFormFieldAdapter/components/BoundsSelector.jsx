import { useState, useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-lasso";

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
  const map = useMap();
  const [selecting, setSelecting] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedPolygon, setSelectedPolygon] = useState(null);

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

  const handleRemovePolygon = () => {
    if (selectedPolygon && featureGroupRef.current) {
      featureGroupRef.current.removeLayer(selectedPolygon);
      syncWithParent();
      setShowRemoveModal(false);
      setSelectedPolygon(null);
    }
  };

  const clearAllPolygons = () => {
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
      syncWithParent();
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
        lassoButton.innerHTML = `
          <svg viewBox="0 0 512 512" style="width: 24px; height: 24px; color: #16a34a;">
            <path fill="currentColor" d="M169.7 .9c-22.8-1.6-41.9 14-47.5 34.7L96.3 214.7C91.1 234.8 96.8 256 111.1 271.5L232.7 390.1c16.7 16.4 43.1 16.4 59.8 0l121.6-118.6c14.3-15.5 20-36.7 14.8-56.8L402.9 35.6C397.3 14.9 378.2-.7 355.4 .9L169.7 .9zm159.6 63.2c8.6 0 15.6 7 15.6 15.6s-7 15.6-15.6 15.6-15.6-7-15.6-15.6 7-15.6 15.6-15.6z"/>
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
        lassoButton.title = selecting ? "Cancel Lasso" : "Lasso Select";

        L.DomEvent.on(lassoButton, "click", handleLassoSelection);
        L.DomEvent.disableClickPropagation(lassoButton);

        // Clear button (if there are polygons)
        const polygonCount = featureGroupRef.current?.getLayers().length || 0;
        if (polygonCount > 0) {
          const clearButton = L.DomUtil.create("button", "", buttonsContainer);
          clearButton.innerHTML = `
            <svg viewBox="0 0 20 20" style="width: 24px; height: 24px; color: #dc2626;">
              <path fill="currentColor" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
              <path fill="currentColor" fill-rule="evenodd" d="M4 5a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" clip-rule="evenodd"/>
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
          clearButton.title = "Clear All Polygons";

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
      {showRemoveModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center"
          onClick={() => setShowRemoveModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium mb-4">Remove Polygon</h3>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRemoveModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRemovePolygon}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
              >
                <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BoundsSelector;
