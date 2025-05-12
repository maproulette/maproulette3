import { useState, useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import SvgSymbol from "../../../SvgSymbol/SvgSymbol";
import {
  notifyPolygonChange,
  globalFeatureGroups,
  getColorForPriority,
} from "../context/PriorityBoundsContext";
import { polygonToGeoJSON } from "../utils/polygonUtils";
import L from "leaflet";
import "leaflet-lasso";

const BoundsSelector = ({ value, onChange, priorityType }) => {
  const map = useMap();
  const [selecting, setSelecting] = useState(false);
  const [featureGroup, setFeatureGroup] = useState(null);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const lassoInstanceRef = useRef(null);

  // Helper function to clean up any existing lasso instance
  const cleanupLasso = () => {
    if (lassoInstanceRef.current) {
      if (typeof lassoInstanceRef.current.disable === "function") {
        lassoInstanceRef.current.disable();
      }
      map.off("lasso.finished");
      lassoInstanceRef.current = null;
    }
  };

  // Update form data when polygons change
  useEffect(() => {
    if (!featureGroup?.getLayers) return;

    const layers = featureGroup.getLayers();
    const geometries = Array.from(layers).map(polygonToGeoJSON).filter(Boolean);

    // Compare values to avoid unnecessary updates
    const currentValue = JSON.stringify(geometries);
    const previousValue = JSON.stringify(value);

    if (currentValue !== previousValue) {
      onChange(geometries.length > 0 ? geometries : []);
      notifyPolygonChange(priorityType);
    }
  }, [featureGroup, onChange, priorityType, value]);

  // Store feature group in the global store
  useEffect(() => {
    if (featureGroup && priorityType) {
      const groupKey = `priority-${priorityType}-feature-group`;
      globalFeatureGroups[groupKey] = featureGroup;
    }
  }, [featureGroup, priorityType]);

  // Initialize feature group and restore polygons
  useEffect(() => {
    if (!map) return;

    // Get or create feature group
    const groupKey = `priority-${priorityType}-feature-group`;
    let fg = globalFeatureGroups[groupKey];

    if (!fg) {
      fg = L.featureGroup().addTo(map);
      globalFeatureGroups[groupKey] = fg;
    } else if (!map.hasLayer(fg)) {
      fg.addTo(map);
    }

    if (fg.setZIndex) {
      fg.setZIndex(200);
    }

    setFeatureGroup(fg);

    // Restore existing polygons
    try {
      if (value?.length > 0) {
        restorePolygons(value, fg);
      }
    } catch (error) {
      console.error("Error restoring polygons:", error);
    }

    // Handle map clicks for modals
    map.on("click", () => {
      if (showModal) setShowModal(false);
      if (showClearModal) setShowClearModal(false);
    });

    return () => {
      if (map?.hasLayer(fg)) {
        fg.remove();
      }
      map.off("click");
      cleanupLasso();
    };
  }, [map]);

  // Restore polygons from GeoJSON
  const restorePolygons = (geoJsonFeatures, fg) => {
    const leafletPolygons = convertGeoJsonToLeafletPolygons(geoJsonFeatures);

    if (leafletPolygons.length > 0) {
      leafletPolygons.forEach((polygon) => {
        const restoredPolygon = L.polygon(polygon.getLatLngs(), {
          color: getColorForPriority(priorityType, "base"),
          weight: 2,
          fillOpacity: 0.2,
        });

        restoredPolygon.priorityType = priorityType;

        // Add event listeners
        restoredPolygon.on("mouseover", () => handlePolygonHover(restoredPolygon));
        restoredPolygon.on("mouseout", () => handlePolygonHoverOut(restoredPolygon));
        restoredPolygon.on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          handlePolygonClick(restoredPolygon);
        });

        // Store original coordinates
        if (polygon.originalCoordinates) {
          restoredPolygon.originalCoordinates = polygon.originalCoordinates;
        } else if (polygon._latlngs?.length > 0) {
          const latlngs = polygon.getLatLngs()[0];
          restoredPolygon.originalCoordinates = latlngs.map((latlng) => [latlng.lat, latlng.lng]);
        }

        fg.addLayer(restoredPolygon);
      });

      // Fit map to bounds
      try {
        const bounds = fg.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      } catch (e) {
        console.error("Error fitting bounds:", e);
      }
    }
  };

  // Convert GeoJSON to Leaflet polygons
  const convertGeoJsonToLeafletPolygons = (geoJsonFeatures) => {
    if (!geoJsonFeatures?.length) return [];

    return geoJsonFeatures
      .map((feature) => {
        try {
          const latlngs = feature.geometry.coordinates[0].map((coord) => [coord[1], coord[0]]);

          const polygon = L.polygon(latlngs, {
            color: getColorForPriority(priorityType, "base"),
            weight: 2,
            fillOpacity: 0.3,
          });

          polygon.originalCoordinates = latlngs;
          return polygon;
        } catch (error) {
          console.error("Error converting feature:", error);
          return null;
        }
      })
      .filter(Boolean);
  };

  // Handle polygon interactions
  const handlePolygonClick = (polygon) => {
    setSelectedPolygon(polygon);
    setShowModal(true);
  };

  const handlePolygonHover = (polygon) => {
    if (!selecting) {
      if (polygon.priorityType === priorityType) {
        polygon.setStyle({ color: "#ff0000", weight: 3, fillOpacity: 0.3 });
      } else {
        polygon.setStyle({ color: "#ff9900", weight: 2, fillOpacity: 0.2 });
      }
    }
  };

  const handlePolygonHoverOut = (polygon) => {
    if (!selecting) {
      if (polygon.priorityType === priorityType) {
        polygon.setStyle({
          color: getColorForPriority(priorityType, "base"),
          weight: 2,
          fillOpacity: 0.3,
        });
      } else {
        polygon.setStyle({
          color: getColorForPriority(polygon.priorityType, "inactive"),
          weight: 1,
          fillOpacity: 0.15,
        });
      }
    }
  };

  // Handle polygon removal
  const handleRemovePolygon = () => {
    if (selectedPolygon && featureGroup) {
      featureGroup.removeLayer(selectedPolygon);
      setShowModal(false);
      setSelectedPolygon(null);
    }
  };

  // Show clear all confirmation dialog
  const showClearAllConfirmation = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowClearModal(true);
  };

  // Handle clearing all polygons
  const clearAllPolygons = () => {
    if (featureGroup) {
      featureGroup.clearLayers();
      setShowClearModal(false);
    }
  };

  // Handle lasso selection
  const handleLassoSelection = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (selecting) {
      cleanupLasso();
      setSelecting(false);
      return;
    }

    cleanupLasso();
    setSelecting(true);

    try {
      // Define the handler function for when lasso selection is completed
      const handleLassoFinished = (e) => {
        if (e.latLngs?.length >= 3) {
          const polygon = L.polygon(e.latLngs, {
            color: getColorForPriority(priorityType, "base"),
            weight: 2,
            fillOpacity: 0.3,
          });

          polygon.priorityType = priorityType;

          polygon.on("mouseover", () => handlePolygonHover(polygon));
          polygon.on("mouseout", () => handlePolygonHoverOut(polygon));
          polygon.on("click", (evt) => {
            L.DomEvent.stopPropagation(evt);
            handlePolygonClick(polygon);
          });

          featureGroup.addLayer(polygon);
        }

        cleanupLasso();
        setSelecting(false);
      };

      // Add the event handler to the map
      map.on("lasso.finished", handleLassoFinished);

      // Create appropriate lasso instance
      if (typeof L.Lasso === "function") {
        const lasso = new L.Lasso(map, {
          polygon: {
            color: getColorForPriority(priorityType, "hover"),
            weight: 2,
          },
          finishOn: "mouseup",
          intersect: false,
        });

        lassoInstanceRef.current = lasso;
        lasso.enable();
      } else if (typeof L.lasso === "function") {
        const lasso = L.lasso(map, {
          polygon: {
            color: getColorForPriority(priorityType, "hover"),
            weight: 2,
          },
          finishOn: "mouseup",
          intersect: false,
        });

        lassoInstanceRef.current = lasso;
      } else {
        console.warn("L.Lasso not found, using custom implementation");

        const handler = {
          enable: function () {
            const drawLasso = (e) => {
              map.dragging.disable();

              let points = [e.latlng];
              let polyline = L.polyline(points, {
                color: getColorForPriority(priorityType, "hover"),
                weight: 2,
              }).addTo(map);

              const moveHandler = (e) => {
                points.push(e.latlng);
                polyline.setLatLngs(points);
              };

              const endHandler = (e) => {
                map.dragging.enable();
                map.off("mousemove", moveHandler);
                map.off("mouseup", endHandler);

                if (polyline) map.removeLayer(polyline);

                if (points.length >= 3) {
                  if (points[0] !== points[points.length - 1]) {
                    points.push(points[0]);
                  }

                  map.fire("lasso.finished", {
                    latLngs: points,
                    layers: [],
                  });
                }
              };

              map.on("mousemove", moveHandler);
              map.on("mouseup", endHandler);
            };

            map.on("mousedown", drawLasso);
            this.drawLasso = drawLasso;
          },

          disable: function () {
            if (this.drawLasso) {
              map.off("mousedown", this.drawLasso);
              this.drawLasso = null;
            }
          },
        };

        lassoInstanceRef.current = handler;
        handler.enable();
      }
    } catch (error) {
      console.error("Error initializing lasso:", error);
      cleanupLasso();
      setSelecting(false);
    }
  };

  // Clean up lasso instance on unmount
  useEffect(() => {
    return () => cleanupLasso();
  }, [map]);

  return (
    <>
      <div
        className="mr-absolute mr-top-2 mr-right-2 mr-z-[1000] mr-bg-black-50 mr-backdrop-blur-sm mr-rounded-lg mr-p-2 mr-shadow-lg"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className="mr-flex mr-flex-col mr-gap-2">
          <button
            onClick={handleLassoSelection}
            className={`mr-p-2 mr-rounded-lg mr-bg-white hover:mr-bg-green-lighter mr-transition-colors mr-duration-200 mr-shadow-md ${
              selecting ? "mr-bg-green-lighter" : ""
            }`}
            title={selecting ? "Cancel Lasso" : "Lasso Select"}
          >
            <SvgSymbol
              sym="lasso-add-icon"
              viewBox="0 0 512 512"
              className={`mr-w-6 mr-h-6 ${selecting ? "mr-text-green" : "mr-text-green"}`}
            />
          </button>

          {featureGroup && featureGroup.getLayers().length > 0 && (
            <button
              onClick={showClearAllConfirmation}
              className="mr-p-2 mr-rounded-lg mr-bg-white hover:mr-bg-red-light mr-transition-colors mr-duration-200 mr-relative mr-shadow-md"
              title="Clear All Polygons"
            >
              <SvgSymbol
                sym="trash-icon"
                viewBox="0 0 20 20"
                className="mr-w-6 mr-h-6 mr-text-red"
              />
              <span className="mr-absolute mr-top-[-8px] mr-right-[-8px] mr-bg-red mr-text-white mr-rounded-full mr-w-5 mr-h-5 mr-flex mr-items-center mr-justify-center mr-text-xs mr-font-bold mr-shadow-md">
                {featureGroup.getLayers().length}
              </span>
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <div
          className="mr-fixed mr-inset-0 mr-bg-black-50 mr-backdrop-blur-sm mr-z-[2000] mr-flex mr-items-center mr-justify-center"
          onClick={() => setShowModal(false)}
        >
          <div
            className="mr-bg-white mr-rounded-lg mr-p-6 mr-shadow-lg mr-max-w-sm mr-w-full mr-mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mr-text-lg mr-font-medium mr-mb-4 mr-text-blue-firefly">
              Polygon Options
            </h3>
            <div className="mr-flex mr-justify-end mr-gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="mr-button mr-button--small mr-button--white mr-px-6"
              >
                Cancel
              </button>
              <button
                onClick={handleRemovePolygon}
                className="mr-button mr-button--small mr-button--danger mr-flex mr-items-center mr-gap-2"
              >
                <SvgSymbol sym="trash-icon" viewBox="0 0 20 20" className="mr-w-4 mr-h-4" />
                Remove Polygon
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearModal && (
        <div
          className="mr-fixed mr-inset-0 mr-bg-black-50 mr-backdrop-blur-sm mr-z-[2000] mr-flex mr-items-center mr-justify-center"
          onClick={() => setShowClearModal(false)}
        >
          <div
            className="mr-bg-white mr-rounded-lg mr-p-6 mr-shadow-lg mr-max-w-sm mr-w-full mr-mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mr-text-lg mr-font-medium mr-mb-4 mr-text-blue-firefly">
              Clear All Polygons
            </h3>
            <p className="mr-mb-4 mr-text-black-75">
              Are you sure you want to remove all {featureGroup.getLayers().length} polygon
              {featureGroup.getLayers().length !== 1 ? "s" : ""}?
            </p>
            <div className="mr-flex mr-justify-end mr-gap-2">
              <button
                onClick={() => setShowClearModal(false)}
                className="mr-button mr-button--small mr-button--white mr-px-6"
              >
                Cancel
              </button>
              <button
                onClick={clearAllPolygons}
                className="mr-button mr-button--small mr-button--danger mr-flex mr-items-center mr-gap-2"
              >
                <SvgSymbol sym="trash-icon" viewBox="0 0 20 20" className="mr-w-4 mr-h-4" />
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
