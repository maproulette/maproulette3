import { useState, useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-lasso";
import SvgSymbol from "../../../SvgSymbol/SvgSymbol";
import { getColorForPriority } from "../context/PriorityBoundsContext";
import { polygonToGeoJSON } from "../utils/polygonUtils";

const BoundsSelector = ({ value, onChange, priorityType }) => {
  const map = useMap();
  const [selecting, setSelecting] = useState(false);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const featureGroupRef = useRef(null);
  const lassoRef = useRef(null);

  // Initialize feature group
  useEffect(() => {
    if (!map) return;
    featureGroupRef.current = new L.FeatureGroup();
    map.addLayer(featureGroupRef.current);

    // Restore existing polygons
    if (Array.isArray(value) && value.length > 0) {
      restorePolygons();
    }

    return () => {
      cleanupLasso();
      if (featureGroupRef.current && map) {
        map.removeLayer(featureGroupRef.current);
      }
    };
  }, [map]);

  // Update polygons when value changes
  useEffect(() => {
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
      if (Array.isArray(value) && value.length > 0) {
        restorePolygons();
      }
    }
  }, [value]);

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
      color: getColorForPriority(priorityType, "base"),
      weight: 2,
      fillOpacity: 0.3,
    });

    polygon.on("click", (e) => {
      L.DomEvent.stopPropagation(e);
      setSelectedPolygon(polygon);
      setShowModal(true);
    });

    polygon.on("mouseover", () => {
      polygon.setStyle({
        color: getColorForPriority(priorityType, "hover"),
        weight: 3,
      });
    });

    polygon.on("mouseout", () => {
      polygon.setStyle({
        color: getColorForPriority(priorityType, "base"),
        weight: 2,
      });
    });

    return polygon;
  };

  const syncWithParent = () => {
    if (!featureGroupRef.current) return;

    const layers = featureGroupRef.current.getLayers();
    const geoJsonFeatures = layers.map(polygonToGeoJSON).filter(Boolean);
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
            color: getColorForPriority(priorityType, "hover"),
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
      setShowModal(false);
      setSelectedPolygon(null);
    }
  };

  const clearAllPolygons = () => {
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
      syncWithParent();
      setShowClearModal(false);
    }
  };

  const polygonCount = featureGroupRef.current?.getLayers().length || 0;

  return (
    <>
      <div
        className="absolute top-2 right-2 z-[1000] bg-black/50 backdrop-blur-sm rounded-lg p-2 shadow-lg"
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          zIndex: 1000,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          borderRadius: "8px",
          padding: "8px",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          className="flex flex-col gap-2"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <button
            onClick={handleLassoSelection}
            className={`p-2 rounded-lg bg-white hover:bg-green-100 transition-colors shadow-md ${
              selecting ? "bg-green-100" : ""
            }`}
            title={selecting ? "Cancel Lasso" : "Lasso Select"}
            style={{
              padding: "8px",
              borderRadius: "8px",
              backgroundColor: selecting ? "#dcfce7" : "white",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SvgSymbol
              sym="lasso-add-icon"
              viewBox="0 0 512 512"
              className="w-6 h-6 text-green-600"
              style={{ width: "24px", height: "24px", color: "#16a34a" }}
            />
          </button>

          {polygonCount > 0 && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowClearModal(true);
              }}
              className="p-2 rounded-lg bg-white hover:bg-red-100 transition-colors relative shadow-md"
              title="Clear All Polygons"
            >
              <SvgSymbol sym="trash-icon" viewBox="0 0 20 20" className="w-6 h-6 text-red-600" />
              <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {polygonCount}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Remove polygon modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium mb-4">Remove Polygon</h3>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRemovePolygon}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
              >
                <SvgSymbol sym="trash-icon" viewBox="0 0 20 20" className="w-4 h-4" />
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear all modal */}
      {showClearModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center"
          onClick={() => setShowClearModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium mb-4">Clear All Polygons</h3>
            <p className="mb-4 text-gray-600">
              Are you sure you want to remove all {polygonCount} polygon
              {polygonCount !== 1 ? "s" : ""}?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={clearAllPolygons}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
              >
                <SvgSymbol sym="trash-icon" viewBox="0 0 20 20" className="w-4 h-4" />
                Remove All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BoundsSelector;
