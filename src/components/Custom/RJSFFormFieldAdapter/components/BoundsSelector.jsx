import { useState, useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import {
  getColorForPriority,
  getFeatureGroup,
  initializeGlobalState,
  saveToUndoHistory,
  getHistoryState,
  updateHistory,
} from "../context/PriorityBoundsContext.js";
import SvgSymbol from "../../../SvgSymbol/SvgSymbol";
import { polygonToGeoJSON } from "../utils/polygonUtils";
import L from "leaflet";
import "leaflet-lasso";
import booleanOverlap from "@turf/boolean-overlap";
import union from "@turf/union";
import booleanContains from "@turf/boolean-contains";
import { featureCollection } from "@turf/helpers";

// Add missing functions from PriorityBoundsContext.jsx since they're not in the .js file
// Global state for undo/redo history and initial values by priority type
const globalBoundsState = {
  high: {
    undoHistory: [],
    redoHistory: [],
    initialValue: null,
  },
  medium: {
    undoHistory: [],
    redoHistory: [],
    initialValue: null,
  },
  low: {
    undoHistory: [],
    redoHistory: [],
    initialValue: null,
  },
};

// Helper function to get current GeoJSON from the feature group
const getCurrentGeoJSONFromFeatureGroup = (featureGroup) => {
  if (!featureGroup) return [];

  const geoJSONFeatures = [];

  featureGroup.eachLayer((layer) => {
    const geoJSON = polygonToGeoJSON(layer);
    if (geoJSON) {
      geoJSONFeatures.push(geoJSON);
    }
  });

  return geoJSONFeatures;
};

// Helper function to handle global polygon functionality
const handlePolygonEvents = (
  polygon,
  priorityType,
  selectedPolygon,
  setSelectedPolygon,
  selectedPolygons,
  setSelectedPolygons,
  mergeMode,
  featureGroup,
) => {
  // Add the event listeners to the polygon
  polygon.on("click", (e) => {
    L.DomEvent.stopPropagation(e);

    if (mergeMode) {
      // In merge mode, toggle selection
      if (selectedPolygons.includes(polygon)) {
        setSelectedPolygons(selectedPolygons.filter((p) => p !== polygon));
        polygon.setStyle({ color: getColorForPriority(priorityType, "base") });
      } else {
        setSelectedPolygons([...selectedPolygons, polygon]);
        polygon.setStyle({ color: "#0055FF" }); // Selection color
      }
    } else {
      // Regular mode, select for edit/delete
      setSelectedPolygon(polygon);

      // Reset styles on all polygons
      resetPolygonStyles(featureGroup, priorityType, selectedPolygon);

      // Highlight selected polygon
      polygon.setStyle({ color: "#0055FF" });
    }
  });

  // Add hover styles
  polygon.on("mouseover", () => {
    if (!mergeMode && polygon !== selectedPolygon) {
      polygon.setStyle({ color: getColorForPriority(priorityType, "hover") });
    }
  });

  polygon.on("mouseout", () => {
    if (!mergeMode && polygon !== selectedPolygon) {
      polygon.setStyle({ color: getColorForPriority(priorityType, "base") });
    }
  });

  return polygon;
};

// Helper function to reset polygon styles
const resetPolygonStyles = (featureGroup, priorityType, selectedPolygon) => {
  if (!featureGroup) return;

  featureGroup.eachLayer((layer) => {
    if (layer !== selectedPolygon) {
      layer.setStyle({ color: getColorForPriority(priorityType, "base") });
    }
  });
};

// Helper function to add GeoJSON data to map as polygon layers
const addGeoJSONToMap = (geoJSON, featureGroup, priorityType, addEventListeners) => {
  if (!geoJSON || !Array.isArray(geoJSON) || !featureGroup) {
    console.warn("Invalid input to addGeoJSONToMap", { geoJSON, featureGroup });
    return;
  }

  console.log(
    `***ADDING POLYGONS*** ${geoJSON.length} features to map for ${priorityType}`,
    geoJSON,
  );

  geoJSON.forEach((feature, index) => {
    try {
      if (!feature?.geometry?.coordinates) {
        console.warn(`Feature ${index} missing coordinates`, feature);
        return;
      }

      console.log(`Processing feature ${index}, type: ${feature.geometry.type}`);

      // Handle different geometry types
      if (feature.geometry.type === "Polygon") {
        // For standard polygons, get the outer ring
        const coordinates = feature.geometry.coordinates[0];
        if (!coordinates || coordinates.length < 3) {
          console.warn(`Feature ${index} has invalid coordinates`, coordinates);
          return;
        }

        console.log(`Creating polygon from ${coordinates.length} points`);

        // Convert GeoJSON coordinates (lng, lat) to Leaflet coordinates (lat, lng)
        const latlngs = coordinates.map((coord) => [coord[1], coord[0]]);

        // Create new polygon
        const polygon = L.polygon(latlngs, {
          color: getColorForPriority(priorityType, "base"),
          weight: 2,
          fillOpacity: 0.2,
        });

        // Add event listeners if provided
        if (typeof addEventListeners === "function") {
          addEventListeners(polygon);
        }

        // Add to feature group
        featureGroup.addLayer(polygon);
        console.log(`Added polygon ${index} with ${latlngs.length} points`);
      } else if (feature.geometry.type === "MultiPolygon") {
        // For multi-polygons, create multiple Leaflet polygons
        feature.geometry.coordinates.forEach((polygonCoords, polyIndex) => {
          const outerRing = polygonCoords[0];
          if (!outerRing || outerRing.length < 3) return;

          console.log(`Creating MultiPolygon part ${polyIndex} from ${outerRing.length} points`);

          // Convert GeoJSON coordinates (lng, lat) to Leaflet coordinates (lat, lng)
          const latlngs = outerRing.map((coord) => [coord[1], coord[0]]);

          // Create new polygon for this part
          const polygon = L.polygon(latlngs, {
            color: getColorForPriority(priorityType, "base"),
            weight: 2,
            fillOpacity: 0.2,
          });

          // Add event listeners if provided
          if (typeof addEventListeners === "function") {
            addEventListeners(polygon);
          }

          // Add to feature group
          featureGroup.addLayer(polygon);
          console.log(`Added MultiPolygon part ${polyIndex} with ${latlngs.length} points`);
        });
      } else {
        console.warn(`Unsupported geometry type: ${feature.geometry.type}`);
      }
    } catch (error) {
      console.error(`Error adding feature ${index} to map:`, error, feature);
    }
  });

  // Log the total number of layers after adding
  console.log(`Feature group now has ${featureGroup.getLayers().length} layers`);
};

const BoundsSelector = ({ value, onChange, priorityType }) => {
  console.log(`BoundsSelector initializing for ${priorityType} with value:`, value);
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
  const [showResetModal, setShowResetModal] = useState(false);

  // Get global history state
  const { undoHistory, redoHistory, canUndo, canRedo, initialValue } =
    getHistoryState(priorityType);

  // Initialize global state with initial value when the component mounts
  useEffect(() => {
    console.log(`Initializing global state for ${priorityType} with`, value);
    initializeGlobalState(priorityType, value);
  }, [priorityType, value]);

  // Reference to track if the component has been mounted
  const hasBeenMounted = useRef(false);

  // Initialize the map when the component mounts
  useEffect(() => {
    if (!map) {
      console.error(`Map is not available for ${priorityType}`);
      return;
    }

    console.log(
      `Map initialization for ${priorityType}, already mounted: ${hasBeenMounted.current}`,
    );

    if (!hasBeenMounted.current) {
      hasBeenMounted.current = true;

      // Get or create the feature group for this priority
      featureGroupRef.current = getFeatureGroup(priorityType);
      console.log(`Got feature group with ${featureGroupRef.current.getLayers().length} layers`);

      // Make sure the feature group is added to the map
      featureGroupRef.current.addTo(map);
      console.log(`Added feature group to map`);

      // Check if there's initial data to load
      if (Array.isArray(value) && value.length > 0) {
        console.log(`Loading ${value.length} initial polygons for ${priorityType}`);

        // Clear existing layers first to avoid duplicates
        featureGroupRef.current.clearLayers();

        // Add polygons to the map
        addGeoJSONToMap(value, featureGroupRef.current, priorityType, (polygon) =>
          addEventListenersToPolygon(polygon),
        );

        // Update UI state
        updatePolygonStatus();
        console.log(
          `After loading, feature group has ${featureGroupRef.current.getLayers().length} layers`,
        );
      } else {
        console.log(`No initial polygons to load for ${priorityType}`);
      }
    } else {
      console.log(`Component already mounted, skipping initialization`);
    }

    // Setup event listeners and controls
    setupMapControls();

    // Cleanup when component unmounts
    return () => {
      console.log(`Cleaning up for ${priorityType}`);
      cleanupLasso();
      if (featureGroupRef.current) {
        console.log(
          `Removing feature group with ${featureGroupRef.current.getLayers().length} layers`,
        );
        featureGroupRef.current.remove();
      }
    };
  }, [map, value]);

  // Listen for initialization events from CustomPriorityBoundsField
  useEffect(() => {
    if (!map) return;

    console.log(`Setting up data initialized listener for ${priorityType}`);

    const handleDataInitialized = (event) => {
      const { priorityType: eventPriorityType, data } = event.detail;

      // Only process events for this priority type
      if (eventPriorityType !== priorityType) return;

      console.log(`Received initialization data for ${priorityType}:`, data);

      if (Array.isArray(data) && data.length > 0) {
        console.log(`Received ${data.length} polygons from initialization event`);

        // Ensure we have a feature group
        if (!featureGroupRef.current) {
          featureGroupRef.current = getFeatureGroup(priorityType);
          featureGroupRef.current.addTo(map);
        }

        // Clear existing layers
        featureGroupRef.current.clearLayers();

        // Add polygons to the map
        addGeoJSONToMap(data, featureGroupRef.current, priorityType, (polygon) =>
          addEventListenersToPolygon(polygon),
        );

        // Update UI state
        updatePolygonStatus();
      }
    };

    // Add event listener
    window.addEventListener("mr:priority-bounds-data-initialized", handleDataInitialized);

    // Cleanup
    return () => {
      window.removeEventListener("mr:priority-bounds-data-initialized", handleDataInitialized);
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
    if (featureGroupRef.current && value) {
      console.log(`Value changed externally for ${priorityType}:`, value);
      const currentGeoJSON = getCurrentGeoJSON();

      // Only clear and restore if the data has actually changed
      if (JSON.stringify(currentGeoJSON) !== JSON.stringify(value)) {
        console.log("Value differs from current state, updating map...");
        featureGroupRef.current.clearLayers();
        addGeoJSONToMap(value, featureGroupRef.current, priorityType, (polygon) =>
          addEventListenersToPolygon(polygon),
        );
        updatePolygonStatus();
      }
    }
  }, [value, priorityType]);

  // Clean up lasso instance
  const cleanupLasso = () => {
    if (lassoInstanceRef.current) {
      try {
        if (typeof lassoInstanceRef.current.disable === "function") {
          lassoInstanceRef.current.disable();
        }
        map.off("lasso.finished");
        lassoInstanceRef.current = null;

        // Make sure selecting state is reset
        setSelecting(false);
      } catch (error) {
        console.error("Error cleaning up lasso:", error);
      }
    }
  };

  // Get current GeoJSON from the feature group
  const getCurrentGeoJSON = () => {
    return getCurrentGeoJSONFromFeatureGroup(featureGroupRef.current);
  };

  // Save current state to history before making changes
  const saveToHistory = (geoJSON) => {
    // Save current state to undo history
    saveToUndoHistory(priorityType, geoJSON || getCurrentGeoJSON());
  };

  // Handle undo: revert to previous state
  const handleUndo = () => {
    if (undoHistory.length === 0) {
      console.log("Nothing to undo");
      return;
    }

    // Get the last state from history
    const lastState = undoHistory[undoHistory.length - 1];
    console.log(`Undoing to previous state with ${lastState.length} polygons`);

    // Save current state to redo history
    const currentGeoJSON = getCurrentGeoJSON();
    const newRedoHistory = [...redoHistory, currentGeoJSON];

    // Update undo history (remove the last item)
    const newUndoHistory = undoHistory.slice(0, -1);

    // Update global history state
    updateHistory(priorityType, newUndoHistory, newRedoHistory);

    // Clear and restore from last state
    featureGroupRef.current.clearLayers();
    if (lastState && lastState.length > 0) {
      addGeoJSONToMap(lastState, featureGroupRef.current, priorityType, (polygon) =>
        addEventListenersToPolygon(polygon),
      );
    }

    // Reset UI states
    setSelectedPolygon(null);
    setSelectedPolygons([]);

    // Notify parent component of change
    onChange(lastState || []);
    updatePolygonStatus();
  };

  // Handle redo: apply next state from redo history
  const handleRedo = () => {
    if (redoHistory.length === 0) {
      console.log("Nothing to redo");
      return;
    }

    // Get the last state from redo history
    const lastRedoState = redoHistory[redoHistory.length - 1];
    console.log(`Redoing to next state with ${lastRedoState.length} polygons`);

    // Save current state to undo history
    const currentGeoJSON = getCurrentGeoJSON();
    const newUndoHistory = [...undoHistory, currentGeoJSON];

    // Update redo history (remove the last item)
    const newRedoHistory = redoHistory.slice(0, -1);

    // Update global history state
    updateHistory(priorityType, newUndoHistory, newRedoHistory);

    // Clear and restore from last redo state
    featureGroupRef.current.clearLayers();
    if (lastRedoState && lastRedoState.length > 0) {
      addGeoJSONToMap(lastRedoState, featureGroupRef.current, priorityType, (polygon) =>
        addEventListenersToPolygon(polygon),
      );
    }

    // Reset UI states
    setSelectedPolygon(null);
    setSelectedPolygons([]);

    // Notify parent component of change
    onChange(lastRedoState || []);
    updatePolygonStatus();
  };

  // Handle reset: show confirmation modal
  const handleReset = () => {
    setShowResetModal(true);
  };

  // Reset confirmed: restore initial state
  const confirmReset = () => {
    // Save current state to history for undo
    const currentGeoJSON = getCurrentGeoJSON();
    const newUndoHistory = [...undoHistory, currentGeoJSON];

    // Update history
    updateHistory(priorityType, newUndoHistory, []);

    // Clear all polygons
    featureGroupRef.current.clearLayers();

    // Restore initial polygons if they exist
    if (initialValue && initialValue.length > 0) {
      addGeoJSONToMap(initialValue, featureGroupRef.current, priorityType, (polygon) =>
        addEventListenersToPolygon(polygon),
      );
    }

    // Reset UI states
    setSelecting(false);
    setMergeMode(false);
    setSelectedPolygons([]);
    setSelectedPolygon(null);
    setShowResetModal(false);

    // Update parent component
    onChange(initialValue || []);
  };

  // Sync polygons with parent component
  const syncPolygonsWithParent = () => {
    // Save current state to history before syncing
    const currentGeoJSON = getCurrentGeoJSON();

    // Log the current state
    console.log(`Syncing with parent: ${currentGeoJSON.length} polygons`, currentGeoJSON);

    // Only save to history if we actually have polygons to save
    if (currentGeoJSON.length > 0) {
      saveToHistory(currentGeoJSON);
    }

    // Update parent with new state
    onChange(currentGeoJSON);

    // Update UI state
    updatePolygonStatus();
  };

  // Handle lasso finished event
  const handleLassoFinished = (e) => {
    try {
      if (e.latLngs?.length >= 3) {
        // Save current state before adding new polygon
        saveToHistory();

        // Create a new polygon from the lasso points
        const polygon = L.polygon(e.latLngs, {
          color: getColorForPriority(priorityType, "base"),
          weight: 2,
          fillOpacity: 0.2,
        });

        // Add event listeners for the new polygon
        addEventListenersToPolygon(polygon);

        // Add to the feature group
        featureGroupRef.current.addLayer(polygon);

        // Update UI state
        setSelecting(false);

        // Notify parent component
        syncPolygonsWithParent();

        // Make sure we clean up the lasso instance
        if (lassoInstanceRef.current) {
          lassoInstanceRef.current.disable();
        }
      }
    } catch (error) {
      console.error("Error in lasso finished:", error);
    }
  };

  // Check for overlapping polygons and merge if needed
  const checkAndMergeOverlappingPolygons = (newPolygon) => {
    try {
      if (!featureGroupRef.current) return newPolygon;

      // Convert new polygon to GeoJSON for comparison
      const newGeoJSON = polygonToGeoJSON(newPolygon);
      if (!newGeoJSON) return newPolygon;

      // Find overlapping polygons
      let overlappingPolygons = [];

      featureGroupRef.current.eachLayer((layer) => {
        if (layer !== newPolygon) {
          const layerGeoJSON = polygonToGeoJSON(layer);
          if (!layerGeoJSON) return;

          // Check if they overlap or one contains the other
          try {
            if (
              booleanOverlap(newGeoJSON, layerGeoJSON) ||
              booleanContains(newGeoJSON, layerGeoJSON) ||
              booleanContains(layerGeoJSON, newGeoJSON)
            ) {
              overlappingPolygons.push(layer);
            }
          } catch (error) {
            console.warn("Error checking overlap:", error);
          }
        }
      });

      // If we found overlapping polygons
      if (overlappingPolygons.length > 0) {
        console.log("Found overlapping polygons:", overlappingPolygons.length);

        // Add new polygon to the list
        const allPolygonsToMerge = [...overlappingPolygons, newPolygon];

        // Convert all polygons to GeoJSON
        const geojsons = allPolygonsToMerge.map((poly) => polygonToGeoJSON(poly)).filter(Boolean);

        // Need at least 2 polygons to merge
        if (geojsons.length < 2) {
          console.log("Not enough valid polygons to merge");
          return newPolygon;
        }

        // Get the first polygon as the base
        let base = geojsons[0];

        // Apply union operations to all polygons
        for (let i = 1; i < geojsons.length; i++) {
          try {
            const unionResult = union(base, geojsons[i]);
            if (unionResult) {
              base = unionResult;
            }
          } catch (error) {
            console.error(`Error merging polygon ${i}:`, error);
            // Continue with the remaining polygons
          }
        }

        // If we have a valid result
        if (base && base.geometry && base.geometry.coordinates) {
          // Remove all polygons that were used in the merge
          allPolygonsToMerge.forEach((poly) => {
            featureGroupRef.current.removeLayer(poly);
          });

          // Create new polygon from the merged geometry
          try {
            // Handle both Polygon and MultiPolygon types
            if (base.geometry.type === "Polygon") {
              const coordinates = base.geometry.coordinates[0].map((coord) => [coord[1], coord[0]]);
              const mergedPolygon = L.polygon(coordinates, {
                color: getColorForPriority(priorityType, "base"),
                weight: 2,
                fillOpacity: 0.2,
              });

              // Add event listeners
              addEventListenersToPolygon(mergedPolygon);

              // Add to feature group
              featureGroupRef.current.addLayer(mergedPolygon);

              // Return the merged polygon
              return mergedPolygon;
            } else if (base.geometry.type === "MultiPolygon") {
              // For MultiPolygon, create multiple separate polygons
              const mergedPolygons = [];

              base.geometry.coordinates.forEach((polyCoords) => {
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
                mergedPolygons.push(mergedPolygon);
              });

              // Return the first polygon (if any)
              return mergedPolygons.length > 0 ? mergedPolygons[0] : newPolygon;
            } else {
              console.warn("Unexpected geometry type after merge:", base.geometry.type);
              return newPolygon;
            }
          } catch (e) {
            console.error("Error creating merged polygon:", e);
            return newPolygon;
          }
        }
      }
    } catch (error) {
      console.error("Error checking for overlapping polygons:", error);
    }

    // If no overlap or error, return the original polygon
    return newPolygon;
  };

  // Add standard event listeners to a polygon
  const addEventListenersToPolygon = (polygon) => {
    if (!polygon) return;

    // Store priority type on polygon
    polygon.priorityType = priorityType;

    // Reset existing event listeners if any
    polygon.off("mouseover");
    polygon.off("mouseout");
    polygon.off("click");

    // Add mouseover event
    polygon.on("mouseover", () => {
      // Only apply hover style if not in selecting or merge mode
      if (!selecting && !mergeMode) {
        polygon.setStyle({
          color: getColorForPriority(priorityType, "hover"),
          weight: 3,
          fillOpacity: 0.3,
        });
      }
    });

    // Add mouseout event
    polygon.on("mouseout", () => {
      // Only reset style if not in selecting or merge mode and not selected
      if (!selecting && !mergeMode) {
        if (!selectedPolygons.includes(polygon)) {
          polygon.setStyle({
            color: getColorForPriority(priorityType, "base"),
            weight: 2,
            fillOpacity: 0.2,
          });
        }
      }
    });

    // Add click event
    polygon.on("click", (e) => {
      L.DomEvent.stopPropagation(e);

      if (mergeMode) {
        // Toggle selection in merge mode
        if (selectedPolygons.includes(polygon)) {
          // Deselect
          setSelectedPolygons((prev) => prev.filter((p) => p !== polygon));
          polygon.setStyle({
            color: getColorForPriority(priorityType, "base"),
            weight: 2,
            fillOpacity: 0.2,
          });
        } else {
          // Select
          setSelectedPolygons((prev) => [...prev, polygon]);
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

    return polygon;
  };

  // Restore polygons from GeoJSON
  const restorePolygonsFromGeoJSON = () => {
    console.log(`Restoring polygons from GeoJSON for ${priorityType}`, value);

    // First make sure we have a feature group
    if (!featureGroupRef.current) {
      featureGroupRef.current = getFeatureGroup(priorityType);
      featureGroupRef.current.addTo(map);
    }

    // Clear existing layers
    featureGroupRef.current.clearLayers();

    // Add the polygons from the GeoJSON value
    if (Array.isArray(value) && value.length > 0) {
      console.log(`Adding ${value.length} polygons to the map`);
      addGeoJSONToMap(value, featureGroupRef.current, priorityType, (polygon) =>
        addEventListenersToPolygon(polygon),
      );
    } else {
      console.log("No polygons to restore");
    }

    // Update UI state
    updatePolygonStatus();
  };

  // Handle polygon removal
  const handleRemovePolygon = () => {
    if (selectedPolygon && featureGroupRef.current) {
      // Save current state before removal
      saveToHistory(getCurrentGeoJSON());

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
      saveToHistory(getCurrentGeoJSON());

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

  // Setup map controls
  const setupMapControls = () => {
    if (!map) return;

    // Clean up any existing lasso instance
    cleanupLasso();

    // The lasso events will be handled in handleLassoSelection when the lasso is initiated

    return () => {
      cleanupLasso();
    };
  };

  // Merge selected polygons
  const mergeSelectedPolygons = () => {
    if (selectedPolygons.length < 2) {
      console.warn("Need at least 2 polygons to merge");
      return;
    }

    try {
      // Convert all selected polygons to GeoJSON
      const geojsons = selectedPolygons.map((polygon) => polygonToGeoJSON(polygon));

      // Save current state before merging
      saveToHistory(featureCollection(geojsons));

      // Create a feature collection from all the polygons
      let base = geojsons[0];

      // Apply union operations to all polygons
      for (let i = 1; i < geojsons.length; i++) {
        const unionResult = union(base, geojsons[i]);
        if (unionResult) {
          base = unionResult;
        }
      }

      // Create a new polygon from the merged geometry
      const mergedCoords = base.geometry.coordinates[0].map((coord) => [coord[1], coord[0]]);

      // Create new polygon with the merged coordinates
      const mergedPolygon = L.polygon(mergedCoords, {
        color: getColorForPriority(priorityType, "base"),
        weight: 2,
        fillOpacity: 0.2,
      });

      // Add event listeners to the merged polygon
      addEventListenersToPolygon(mergedPolygon);

      // Remove old polygons
      selectedPolygons.forEach((polygon) => {
        featureGroupRef.current.removeLayer(polygon);
      });

      // Add the new merged polygon
      featureGroupRef.current.addLayer(mergedPolygon);

      // Reset state
      setMergeMode(false);
      setSelectedPolygons([]);

      // Notify parent component
      onChange(getCurrentGeoJSON());

      // Reset polygon styles
      refreshPolygonStyles();
    } catch (error) {
      console.error("Error merging polygons:", error);
    }
  };

  // Reset all polygon styles and listeners
  const refreshPolygonStyles = () => {
    resetPolygonStyles(featureGroupRef.current, priorityType, selectedPolygon);
  };

  // Handle lasso selection
  const handleLassoSelection = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // If already selecting, cancel
    if (selecting) {
      cleanupLasso();
      setSelecting(false);
      refreshPolygonStyles();
      return;
    }

    // Start selection
    cleanupLasso();
    setSelecting(true);

    try {
      // Setup lasso finished handler
      const handleLassoFinished = (e) => {
        try {
          // Always clean up lasso regardless of success
          setSelecting(false);

          if (!e.latLngs || e.latLngs.length < 3) {
            console.log("Not enough points for a polygon, aborting");
            cleanupLasso();
            return;
          }

          console.log(`Lasso finished with ${e.latLngs.length} points`);

          // Save current state before adding new polygon
          saveToHistory(getCurrentGeoJSON());

          // Create a new polygon from the lasso points
          const polygon = L.polygon(e.latLngs, {
            color: getColorForPriority(priorityType, "base"),
            weight: 2,
            fillOpacity: 0.2,
          });

          // Add event listeners for the new polygon
          addEventListenersToPolygon(polygon);

          // Add to the feature group
          featureGroupRef.current.addLayer(polygon);

          // Make sure to clean up lasso before checking for overlaps
          cleanupLasso();

          try {
            // Check for overlapping polygons
            const mergedPolygon = checkAndMergeOverlappingPolygons(polygon);

            // At this point, either the original polygon or a merged polygon is on the map
            console.log("Polygon/merged polygon added to map");

            // Notify parent component
            syncPolygonsWithParent();
          } catch (overlapError) {
            console.error("Error while processing polygon overlaps:", overlapError);
            // Even if merging fails, keep the original polygon
            syncPolygonsWithParent();
          }
        } catch (error) {
          console.error("Error in lasso finished:", error);
          // Always clean up
          cleanupLasso();
        }
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

  // Update when selecting state changes to refresh polygon hover styles
  useEffect(() => {
    if (featureGroupRef.current) {
      const allPolygons = featureGroupRef.current.getLayers();

      allPolygons.forEach((polygon) => {
        // Refresh event listeners when selecting state changes
        if (!selecting && !mergeMode) {
          // Only update polygons that aren't part of a merge selection
          if (!selectedPolygons.includes(polygon)) {
            polygon.setStyle({
              color: getColorForPriority(priorityType, "base"),
              weight: 2,
              fillOpacity: 0.2,
            });

            // Reattach event listeners to ensure hover works
            addEventListenersToPolygon(polygon);
          }
        }
      });
    }
  }, [selecting, mergeMode]);

  // Alternative approach: Try to render polygons directly using Leaflet's GeoJSON layer
  useEffect(() => {
    if (!map || !value || !Array.isArray(value) || value.length === 0) return;

    console.log("DIRECT RENDER: Trying direct GeoJSON render approach for", priorityType);

    try {
      // Create a GeoJSON FeatureCollection from the polygons
      const geoJSONCollection = {
        type: "FeatureCollection",
        features: value,
      };

      console.log("DIRECT RENDER: Creating GeoJSON layer with", value.length, "features");

      // Create a new GeoJSON layer
      const geoJSONLayer = L.geoJSON(geoJSONCollection, {
        style: () => ({
          color: getColorForPriority(priorityType, "base"),
          weight: 2,
          fillOpacity: 0.2,
        }),
        onEachFeature: (feature, layer) => {
          // Add event listeners to each polygon
          if (layer instanceof L.Polygon) {
            addEventListenersToPolygon(layer);
          }
        },
      });

      // Store a reference to the layer
      const directLayerKey = `priority-${priorityType}-direct-layer`;

      // Remove any existing direct layer
      if (window[directLayerKey]) {
        console.log("DIRECT RENDER: Removing existing direct layer");
        map.removeLayer(window[directLayerKey]);
      }

      // Add the layer to the map
      geoJSONLayer.addTo(map);
      window[directLayerKey] = geoJSONLayer;

      console.log(
        "DIRECT RENDER: Added GeoJSON layer with",
        geoJSONLayer.getLayers().length,
        "layers",
      );
    } catch (error) {
      console.error("DIRECT RENDER: Error rendering GeoJSON directly:", error);
    }
  }, [map, value, priorityType]);

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

          {/* Undo button */}
          <button
            onClick={handleUndo}
            className={`mr-p-2 mr-rounded-lg mr-bg-white hover:mr-bg-blue-lighter mr-transition-colors mr-duration-200 mr-shadow-md ${
              !canUndo ? "mr-opacity-50" : ""
            }`}
            title="Undo Last Action"
            disabled={!canUndo}
          >
            <SvgSymbol
              sym="undo-icon"
              viewBox="0 0 24 24"
              className={`mr-w-6 mr-h-6 mr-text-blue ${!canUndo ? "mr-opacity-50" : ""}`}
            />
          </button>

          {/* Redo button */}
          <button
            onClick={handleRedo}
            className={`mr-p-2 mr-rounded-lg mr-bg-white hover:mr-bg-blue-lighter mr-transition-colors mr-duration-200 mr-shadow-md ${
              !canRedo ? "mr-opacity-50" : ""
            }`}
            title="Redo Last Action"
            disabled={!canRedo}
          >
            <SvgSymbol
              sym="redo-icon"
              viewBox="0 0 24 24"
              className={`mr-w-6 mr-h-6 mr-text-blue ${!canRedo ? "mr-opacity-50" : ""}`}
            />
          </button>

          {/* Zoom to fit button (disabled if no polygons exist) */}
          <button
            onClick={fitBoundsToPolygons}
            className={`mr-p-2 mr-rounded-lg mr-bg-white hover:mr-bg-blue-lighter mr-transition-colors mr-duration-200 mr-shadow-md ${
              !hasPolygons ? "mr-opacity-50" : ""
            }`}
            title="Fit to Polygons"
            disabled={!hasPolygons}
          >
            <SvgSymbol
              sym="search-icon"
              viewBox="0 0 20 20"
              className={`mr-w-6 mr-h-6 mr-text-blue ${!hasPolygons ? "mr-opacity-50" : ""}`}
            />
          </button>

          {/* Clear all button (disabled if no polygons exist) */}
          <button
            onClick={() => setShowClearModal(true)}
            className={`mr-p-2 mr-rounded-lg mr-bg-white hover:mr-bg-red-light mr-transition-colors mr-duration-200 mr-relative mr-shadow-md ${
              !hasPolygons ? "mr-opacity-50" : ""
            }`}
            title="Clear All Polygons"
            disabled={!hasPolygons}
          >
            <SvgSymbol
              sym="trash-icon"
              viewBox="0 0 20 20"
              className={`mr-w-6 mr-h-6 mr-text-red ${!hasPolygons ? "mr-opacity-50" : ""}`}
            />
            {hasPolygons && (
              <span className="mr-absolute mr-top-[-8px] mr-right-[-8px] mr-bg-red mr-text-white mr-rounded-full mr-w-5 mr-h-5 mr-flex mr-items-center mr-justify-center mr-text-xs mr-font-bold mr-shadow-md">
                {featureGroupRef.current?.getLayers().length || 0}
              </span>
            )}
          </button>

          {/* Reset button */}
          <button
            onClick={handleReset}
            className="mr-p-2 mr-rounded-lg mr-bg-white hover:mr-bg-blue-lighter mr-transition-colors mr-duration-200 mr-shadow-md"
            title="Reset to Initial State"
          >
            <SvgSymbol
              sym="refresh-icon"
              viewBox="0 0 20 20"
              className="mr-w-6 mr-h-6 mr-text-blue"
            />
          </button>
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

      {/* Reset confirmation modal */}
      {showResetModal && (
        <div
          className="mr-fixed mr-inset-0 mr-bg-black-50 mr-backdrop-blur-sm mr-z-[2000] mr-flex mr-items-center mr-justify-center"
          onClick={() => setShowResetModal(false)}
        >
          <div
            className="mr-bg-white mr-rounded-lg mr-p-6 mr-shadow-lg mr-max-w-sm mr-w-full mr-mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mr-text-lg mr-font-medium mr-mb-4 mr-text-blue-firefly">
              Reset to Initial State
            </h3>
            <p className="mr-mb-4 mr-text-black-75">
              Are you sure you want to reset all changes and restore the original{" "}
              {featureGroupRef.current?.getLayers().length || 0} polygon
              {initialValue?.length !== 1 ? "s" : ""}?
            </p>
            <div className="mr-flex mr-justify-end mr-gap-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="mr-button mr-button--small mr-button--white mr-px-6"
              >
                Cancel
              </button>
              <button
                onClick={confirmReset}
                className="mr-button mr-button--small mr-button--danger mr-flex mr-items-center mr-gap-2"
              >
                <SvgSymbol sym="refresh-icon" viewBox="0 0 20 20" className="mr-w-4 mr-h-4" />
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BoundsSelector;
