import { useState, useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import SvgSymbol from "../../../SvgSymbol/SvgSymbol";
import { globalFeatureGroups, getColorForPriority } from "../context/PriorityBoundsContext";
import { polygonToGeoJSON } from "../utils/polygonUtils";
import L from "leaflet";
import "leaflet-lasso";
import union from "@turf/union";
import booleanOverlap from "@turf/boolean-overlap";
import booleanContains from "@turf/boolean-contains";
import { featureCollection } from "@turf/helpers";

const BoundsSelector = ({ value, onChange, priorityType }) => {
  const map = useMap();
  const [selecting, setSelecting] = useState(false);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [hasPolygons, setHasPolygons] = useState(false);
  const [mergeMode, setMergeMode] = useState(false);
  const [selectedPolygons, setSelectedPolygons] = useState([]);
  const lassoInstanceRef = useRef(null);
  const featureGroupRef = useRef(null);
  const [undoHistory, setUndoHistory] = useState([]);
  const [canUndo, setCanUndo] = useState(false);

  // Initialize feature group once
  useEffect(() => {
    // Get the feature group key for this priority type
    const groupKey = `priority-${priorityType}-feature-group`;

    // Create or use existing feature group
    if (!globalFeatureGroups[groupKey]) {
      featureGroupRef.current = new L.FeatureGroup();
      globalFeatureGroups[groupKey] = featureGroupRef.current;
    } else {
      featureGroupRef.current = globalFeatureGroups[groupKey];
    }

    // Add to map if not already there
    if (!map.hasLayer(featureGroupRef.current)) {
      featureGroupRef.current.addTo(map);
    }

    // Restore polygons from value (GeoJSON data)
    restorePolygonsFromGeoJSON();

    // Check if we have polygons initially
    updatePolygonStatus();

    // Cleanup
    return () => {
      cleanupLasso();
    };
  }, [map, priorityType]);

  // Update polygon status for UI elements
  const updatePolygonStatus = () => {
    if (featureGroupRef.current) {
      const hasAny = featureGroupRef.current.getLayers().length > 0;
      setHasPolygons(hasAny);
    } else {
      setHasPolygons(false);
    }
  };

  // Update when value changes externally
  useEffect(() => {
    if (featureGroupRef.current) {
      const currentGeoJSON = getCurrentGeoJSON();

      // Only clear and restore if the data has actually changed
      if (JSON.stringify(currentGeoJSON) !== JSON.stringify(value)) {
        restorePolygonsFromGeoJSON();
      }

      // Update status
      updatePolygonStatus();
    }
  }, [value]);

  // Clean up lasso instance
  const cleanupLasso = () => {
    if (lassoInstanceRef.current) {
      try {
        if (typeof lassoInstanceRef.current.disable === "function") {
          lassoInstanceRef.current.disable();
        }
        map.off("lasso.finished");
        lassoInstanceRef.current = null;
      } catch (error) {
        console.error("Error cleaning up lasso:", error);
      }
    }
  };

  // Get current GeoJSON from feature group
  const getCurrentGeoJSON = () => {
    if (!featureGroupRef.current) return [];

    const layers = featureGroupRef.current.getLayers();
    return layers.map(polygonToGeoJSON).filter(Boolean);
  };

  // Save current state to history before making changes
  const saveToHistory = () => {
    const currentGeoJSON = getCurrentGeoJSON();
    setUndoHistory((prevHistory) => [...prevHistory, currentGeoJSON]);
    setCanUndo(true);
  };

  // Undo the last action
  const handleUndo = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (undoHistory.length === 0) return;

    // Get the last state from history
    const lastState = undoHistory[undoHistory.length - 1];

    // Remove it from history
    setUndoHistory((prevHistory) => prevHistory.slice(0, prevHistory.length - 1));

    // Restore that state
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();

      // Create polygons from the last state
      lastState.forEach((feature) => {
        try {
          if (!feature?.geometry?.coordinates?.[0]) return;

          // Convert GeoJSON coordinates (lng, lat) to Leaflet coordinates (lat, lng)
          const latlngs = feature.geometry.coordinates[0].map((coord) => [coord[1], coord[0]]);

          // Create new polygon
          const polygon = L.polygon(latlngs, {
            color: getColorForPriority(priorityType, "base"),
            weight: 2,
            fillOpacity: 0.2,
          });

          // Add event listeners
          addEventListenersToPolygon(polygon);

          // Add to feature group
          featureGroupRef.current.addLayer(polygon);
        } catch (error) {
          console.error("Error restoring polygon:", error);
        }
      });

      // Update UI and notify parent component
      updatePolygonStatus();
      onChange(lastState);
    }

    // Update undo status
    setCanUndo(undoHistory.length > 1);
  };

  // Sync polygons with parent component
  const syncPolygonsWithParent = () => {
    // Save current state to history before syncing
    saveToHistory();

    // Update parent with new state
    onChange(getCurrentGeoJSON());
    updatePolygonStatus();
  };

  // Check for polygon overlaps and merge if needed
  const checkAndMergeOverlappingPolygons = (newPolygon) => {
    if (!featureGroupRef.current || !newPolygon) return newPolygon;

    try {
      // Get the GeoJSON for the new polygon
      const newPolygonGeoJSON = polygonToGeoJSON(newPolygon);
      if (!newPolygonGeoJSON) return newPolygon;

      console.log("New polygon:", newPolygonGeoJSON);

      // Get all existing polygons except the new one
      const existingPolygons = featureGroupRef.current
        .getLayers()
        .filter((layer) => layer !== newPolygon);

      console.log("Found existing polygons:", existingPolygons.length);

      // If no existing polygons, just return the new one
      if (existingPolygons.length === 0) return newPolygon;

      // Find overlapping polygons
      const overlappingPolygons = [];

      for (const polygon of existingPolygons) {
        const polygonGeoJSON = polygonToGeoJSON(polygon);
        if (!polygonGeoJSON) continue;

        console.log("Checking overlap with existing polygon:", polygonGeoJSON);

        // Check if they overlap
        try {
          // Check if geometries are valid
          const newGeom = newPolygonGeoJSON.geometry;
          const existingGeom = polygonGeoJSON.geometry;

          if (
            newGeom &&
            existingGeom &&
            newGeom.coordinates &&
            newGeom.coordinates.length > 0 &&
            existingGeom.coordinates &&
            existingGeom.coordinates.length > 0
          ) {
            // Check for overlap or containment
            let isOverlapping = false;

            try {
              // First check if one contains the other
              isOverlapping =
                booleanContains(newPolygonGeoJSON, polygonGeoJSON) ||
                booleanContains(polygonGeoJSON, newPolygonGeoJSON);

              // If not contained, check if they overlap
              if (!isOverlapping) {
                isOverlapping = booleanOverlap(newGeom, existingGeom);
              }

              console.log("Overlap check result:", isOverlapping);

              if (isOverlapping) {
                overlappingPolygons.push(polygon);
                console.log("Overlap found! Polygons intersect.");
              }
            } catch (err) {
              console.log("Error in overlap check (non-critical):", err.message);
            }
          } else {
            console.log("Skipping overlap check - invalid geometry data");
          }
        } catch (err) {
          console.error("Error in overlap checking process:", err);
        }
      }

      console.log("Found overlapping polygons:", overlappingPolygons.length);

      // If no overlapping polygons, return the new polygon as is
      if (overlappingPolygons.length === 0) return newPolygon;

      // Prepare for union operation
      const polygonsToMerge = [newPolygonGeoJSON];
      overlappingPolygons.forEach((polygon) => {
        const geoJSON = polygonToGeoJSON(polygon);
        if (geoJSON) {
          polygonsToMerge.push(geoJSON);
        }
      });

      // Create a feature collection from all the polygons
      const polygonsCollection = featureCollection(polygonsToMerge);

      // Perform the union operation on the collection
      const unionResult = union(polygonsCollection);

      console.log("Union result:", unionResult);

      if (!unionResult) {
        console.log("Union function returned null - merge failed");
        return newPolygon;
      }

      // If we have a valid result with coordinates
      if (
        unionResult.geometry &&
        unionResult.geometry.coordinates &&
        unionResult.geometry.coordinates.length > 0 &&
        unionResult.geometry.coordinates[0] &&
        unionResult.geometry.coordinates[0].length > 0
      ) {
        console.log("Creating merged polygon from geometry:", unionResult.geometry);

        // First save the current state to history
        saveToHistory();

        // Remove the new polygon and all overlapping polygons
        featureGroupRef.current.removeLayer(newPolygon);
        overlappingPolygons.forEach((polygon) => {
          featureGroupRef.current.removeLayer(polygon);
        });

        let mergedPolygons = [];

        // For MultiPolygon results, create multiple polygons
        if (unionResult.geometry.type === "MultiPolygon") {
          // Create multiple polygons, one for each part of the MultiPolygon
          unionResult.geometry.coordinates.forEach((polyCoords) => {
            const coordinates = polyCoords[0].map((coord) => [coord[1], coord[0]]);
            const polygon = L.polygon(coordinates, {
              color: getColorForPriority(priorityType, "base"),
              weight: 2,
              fillOpacity: 0.2,
            });

            // Add event listeners
            addEventListenersToPolygon(polygon);

            // Add to feature group
            featureGroupRef.current.addLayer(polygon);
            mergedPolygons.push(polygon);
          });
        } else {
          // Create a single new merged polygon for Polygon type
          const coordinates = unionResult.geometry.coordinates[0].map((coord) => [
            coord[1],
            coord[0],
          ]);
          const polygon = L.polygon(coordinates, {
            color: getColorForPriority(priorityType, "base"),
            weight: 2,
            fillOpacity: 0.2,
          });

          // Add event listeners
          addEventListenersToPolygon(polygon);

          // Add to feature group
          featureGroupRef.current.addLayer(polygon);
          mergedPolygons.push(polygon);
        }

        // Sync with parent
        onChange(getCurrentGeoJSON()); // We already saved to history above
        updatePolygonStatus();

        console.log("Merged polygon created and added to map!");
        return mergedPolygons[0]; // Return the first merged polygon
      } else {
        console.log("Invalid merged geometry - cannot create polygon");
      }
    } catch (error) {
      console.error("Error in merge check:", error);
    }

    return newPolygon;
  };

  // Add standard event listeners to a polygon
  const addEventListenersToPolygon = (polygon) => {
    if (!polygon) return;

    // Store priority type on polygon
    polygon.priorityType = priorityType;

    // Add event listeners
    polygon.on("mouseover", () => {
      if (!selecting && !mergeMode) {
        polygon.setStyle({
          color: getColorForPriority(priorityType, "hover"),
          weight: 3,
          fillOpacity: 0.3,
        });
      }
    });

    polygon.on("mouseout", () => {
      if (!selecting && !mergeMode) {
        // If not selected for merging
        if (!selectedPolygons.includes(polygon)) {
          polygon.setStyle({
            color: getColorForPriority(priorityType, "base"),
            weight: 2,
            fillOpacity: 0.2,
          });
        }
      }
    });

    polygon.on("click", (e) => {
      L.DomEvent.stopPropagation(e);

      if (mergeMode) {
        // If in merge mode, toggle selection
        if (selectedPolygons.includes(polygon)) {
          // Deselect
          setSelectedPolygons(selectedPolygons.filter((p) => p !== polygon));
          polygon.setStyle({
            color: getColorForPriority(priorityType, "base"),
            weight: 2,
            fillOpacity: 0.2,
          });
        } else {
          // Select
          setSelectedPolygons([...selectedPolygons, polygon]);
          polygon.setStyle({
            color: getColorForPriority(priorityType, "hover"),
            weight: 3,
            fillOpacity: 0.4,
            dashArray: "5, 5",
          });
        }
      } else {
        // Regular click - show polygon options
        setSelectedPolygon(polygon);
        setShowModal(true);
      }
    });
  };

  // Restore polygons from GeoJSON
  const restorePolygonsFromGeoJSON = () => {
    // Clear existing layers
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
    }

    // If no value or feature group, just return
    if (!value || !featureGroupRef.current) return;

    // Create polygons from GeoJSON
    value.forEach((feature) => {
      try {
        if (!feature?.geometry?.coordinates?.[0]) return;

        // Convert GeoJSON coordinates (lng, lat) to Leaflet coordinates (lat, lng)
        const latlngs = feature.geometry.coordinates[0].map((coord) => [coord[1], coord[0]]);

        // Create new polygon
        const polygon = L.polygon(latlngs, {
          color: getColorForPriority(priorityType, "base"),
          weight: 2,
          fillOpacity: 0.2,
        });

        // Add event listeners
        addEventListenersToPolygon(polygon);

        // Add to feature group
        featureGroupRef.current.addLayer(polygon);
      } catch (error) {
        console.error("Error restoring polygon:", error);
      }
    });

    // Update polygon status after restoration
    updatePolygonStatus();
  };

  // Handle polygon removal
  const handleRemovePolygon = () => {
    if (selectedPolygon && featureGroupRef.current) {
      // Save current state before removal
      saveToHistory();

      featureGroupRef.current.removeLayer(selectedPolygon);
      setShowModal(false);
      setSelectedPolygon(null);
      syncPolygonsWithParent();
    }
  };

  // Handle clearing all polygons
  const clearAllPolygons = () => {
    if (featureGroupRef.current) {
      // Save current state before clearing
      saveToHistory();

      featureGroupRef.current.clearLayers();
      setShowClearModal(false);
      syncPolygonsWithParent();
    }
  };

  // Fit bounds to all polygons
  const fitBoundsToPolygons = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (featureGroupRef.current && featureGroupRef.current.getLayers().length > 0) {
      try {
        const bounds = featureGroupRef.current.getBounds();
        map.fitBounds(bounds, { padding: [50, 50] });
      } catch (error) {
        console.error("Error fitting bounds:", error);
      }
    }
  };

  // Merge selected polygons
  const mergeSelectedPolygons = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (selectedPolygons.length < 2) return;

    try {
      // Convert all selected polygons to GeoJSON
      const geojsons = selectedPolygons.map(polygonToGeoJSON).filter(Boolean);

      if (geojsons.length < 2) return;

      console.log("Manual merge - selected polygon GeoJSONs:", geojsons);

      // Save current state before merging
      saveToHistory();

      // Create a feature collection from all the polygons
      const polygonsCollection = featureCollection(geojsons);

      // Perform the union operation on the collection
      const unionResult = union(polygonsCollection);

      console.log("Union result:", unionResult);

      if (!unionResult) {
        console.log("Union function returned null - merge failed");
        return;
      }

      // If we have a valid result with coordinates
      if (
        unionResult.geometry &&
        unionResult.geometry.coordinates &&
        unionResult.geometry.coordinates.length > 0 &&
        unionResult.geometry.coordinates[0] &&
        unionResult.geometry.coordinates[0].length > 0
      ) {
        console.log("Creating final merged polygon from:", unionResult.geometry);

        // Remove all selected polygons
        selectedPolygons.forEach((polygon) => {
          featureGroupRef.current.removeLayer(polygon);
        });

        // For MultiPolygon results, create multiple polygons
        if (unionResult.geometry.type === "MultiPolygon") {
          // Create multiple polygons, one for each part of the MultiPolygon
          unionResult.geometry.coordinates.forEach((polyCoords) => {
            const coordinates = polyCoords[0].map((coord) => [coord[1], coord[0]]);
            const mergedPolygon = L.polygon(coordinates, {
              color: getColorForPriority(priorityType, "base"),
              weight: 2,
              fillOpacity: 0.2,
            });

            // Add event listeners
            addEventListenersToPolygon(mergedPolygon);

            // Add to feature group
            featureGroupRef.current.addLayer(mergedPolygon);
          });
        } else {
          // Create a single new merged polygon for Polygon type
          const coordinates = unionResult.geometry.coordinates[0].map((coord) => [
            coord[1],
            coord[0],
          ]);
          const mergedPolygon = L.polygon(coordinates, {
            color: getColorForPriority(priorityType, "base"),
            weight: 2,
            fillOpacity: 0.2,
          });

          // Add event listeners
          addEventListenersToPolygon(mergedPolygon);

          // Add to feature group
          featureGroupRef.current.addLayer(mergedPolygon);
        }

        // Reset merge mode
        setMergeMode(false);
        setSelectedPolygons([]);

        // Sync with parent
        onChange(getCurrentGeoJSON()); // Don't save to history again since we did it above
        updatePolygonStatus();

        console.log("Manual merge complete!");
      } else {
        console.log("Invalid merged geometry after manual merge - cannot create polygon");
      }
    } catch (error) {
      console.error("Error merging polygons:", error);
    }
  };

  // Handle lasso selection
  const handleLassoSelection = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // If already selecting, cancel
    if (selecting) {
      cleanupLasso();
      setSelecting(false);
      return;
    }

    // Start selection
    cleanupLasso();
    setSelecting(true);

    try {
      // Setup lasso finished handler
      const handleLassoFinished = (e) => {
        if (e.latLngs?.length >= 3) {
          // Save current state before adding new polygon
          saveToHistory();

          // Create a new polygon from the lasso points
          const polygon = L.polygon(e.latLngs, {
            color: getColorForPriority(priorityType, "base"),
            weight: 2,
            fillOpacity: 0.2,
          });

          // Add event listeners
          addEventListenersToPolygon(polygon);

          // Add to feature group
          featureGroupRef.current.addLayer(polygon);

          // Check for overlaps and merge if needed
          checkAndMergeOverlappingPolygons(polygon);

          // Sync with parent
          onChange(getCurrentGeoJSON()); // Don't save to history again since we did it above
          updatePolygonStatus();
        }

        // Clean up
        cleanupLasso();
        setSelecting(false);
      };

      // Add event handler and create lasso
      map.on("lasso.finished", handleLassoFinished);

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
    } catch (error) {
      console.error("Error initializing lasso:", error);
      setSelecting(false);
      cleanupLasso();
    }
  };

  return (
    <>
      {/* Controls */}
      <div
        className="mr-absolute mr-top-2 mr-right-2 mr-z-[1000] mr-bg-black-50 mr-backdrop-blur-sm mr-rounded-lg mr-p-2 mr-shadow-lg"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className="mr-flex mr-flex-col mr-gap-2">
          {/* Lasso selection button */}
          <button
            onClick={handleLassoSelection}
            className={`mr-p-2 mr-rounded-lg mr-bg-white hover:mr-bg-green-lighter mr-transition-colors mr-duration-200 mr-shadow-md ${
              selecting ? "mr-bg-green-lighter" : ""
            }`}
            title={selecting ? "Cancel Selection" : "Draw Polygon"}
            disabled={mergeMode}
          >
            <SvgSymbol
              sym="lasso-add-icon"
              viewBox="0 0 512 512"
              className={`mr-w-6 mr-h-6 ${selecting ? "mr-text-green" : "mr-text-green"} ${
                mergeMode ? "mr-opacity-50" : ""
              }`}
            />
          </button>

          {/* Merge selected polygons button (only shown when in merge mode and at least 2 polygons selected) */}
          {mergeMode && selectedPolygons.length >= 2 && (
            <button
              onClick={mergeSelectedPolygons}
              className="mr-p-2 mr-rounded-lg mr-bg-white hover:mr-bg-yellow mr-transition-colors mr-duration-200 mr-shadow-md"
              title="Complete Merge"
            >
              <SvgSymbol
                sym="check-icon"
                viewBox="0 0 20 20"
                className="mr-w-6 mr-h-6 mr-text-green"
              />
              <span className="mr-absolute mr-top-[-8px] mr-right-[-8px] mr-bg-yellow mr-text-white mr-rounded-full mr-w-5 mr-h-5 mr-flex mr-items-center mr-justify-center mr-text-xs mr-font-bold mr-shadow-md">
                {selectedPolygons.length}
              </span>
            </button>
          )}

          {/* Undo button (only shown if there's history to undo) */}
          {canUndo && (
            <button
              onClick={handleUndo}
              className="mr-p-2 mr-rounded-lg mr-bg-white hover:mr-bg-blue-lighter mr-transition-colors mr-duration-200 mr-shadow-md"
              title="Undo Last Action"
            >
              <SvgSymbol
                sym="undo-icon"
                viewBox="0 0 20 20"
                className="mr-w-6 mr-h-6 mr-text-blue"
              />
            </button>
          )}

          {/* Zoom to fit button (only shown if polygons exist) */}
          {hasPolygons && (
            <button
              onClick={fitBoundsToPolygons}
              className="mr-p-2 mr-rounded-lg mr-bg-white hover:mr-bg-blue-lighter mr-transition-colors mr-duration-200 mr-shadow-md"
              title="Fit to Polygons"
            >
              <SvgSymbol
                sym="search-icon"
                viewBox="0 0 20 20"
                className="mr-w-6 mr-h-6 mr-text-blue"
              />
            </button>
          )}

          {/* Clear all button (only shown if polygons exist) */}
          {hasPolygons && (
            <button
              onClick={() => setShowClearModal(true)}
              className="mr-p-2 mr-rounded-lg mr-bg-white hover:mr-bg-red-light mr-transition-colors mr-duration-200 mr-relative mr-shadow-md"
              title="Clear All Polygons"
            >
              <SvgSymbol
                sym="trash-icon"
                viewBox="0 0 20 20"
                className="mr-w-6 mr-h-6 mr-text-red"
              />
              <span className="mr-absolute mr-top-[-8px] mr-right-[-8px] mr-bg-red mr-text-white mr-rounded-full mr-w-5 mr-h-5 mr-flex mr-items-center mr-justify-center mr-text-xs mr-font-bold mr-shadow-md">
                {featureGroupRef.current?.getLayers().length || 0}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Polygon menu modal */}
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

      {/* Clear all confirmation modal */}
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
              Are you sure you want to remove all {featureGroupRef.current?.getLayers().length || 0}{" "}
              polygon
              {featureGroupRef.current?.getLayers().length !== 1 ? "s" : ""}?
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
