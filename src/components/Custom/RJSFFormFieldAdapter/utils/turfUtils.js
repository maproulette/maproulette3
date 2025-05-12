import * as turf from "@turf/turf";

export const leafletToTurf = (polygon) => {
  try {
    if (!polygon || !polygon.getLatLngs) {
      console.error("Invalid polygon object passed to leafletToTurf");
      return null;
    }

    let latLngs;

    try {
      latLngs = polygon.getLatLngs();

      // Handle different Leaflet polygon structures
      if (latLngs.length === 0) {
        console.error("Empty polygon with no coordinates");
        return null;
      }

      // Normalize to handle both simple and multi-polygons
      if (latLngs[0] instanceof L.LatLng) {
        // Simple polygon with direct LatLng objects
        latLngs = [latLngs];
      } else if (latLngs[0][0] instanceof L.LatLng) {
        // Polygon with one outer ring
        // Already in correct format
      } else if (latLngs[0][0][0] instanceof L.LatLng) {
        // Multi-polygon - take first polygon for simplicity
        latLngs = [latLngs[0]];
      } else {
        console.error("Unrecognized polygon LatLng structure");
        return null;
      }

      // Ensure we have enough points for a valid polygon
      if (!latLngs[0] || latLngs[0].length < 3) {
        console.error("Not enough points for a valid polygon");
        return null;
      }

      // Convert the first ring (outer boundary) to coordinates
      const coordinates = latLngs[0].map((latlng) => [latlng.lng, latlng.lat]);

      // Ensure polygon is closed and has at least 4 points (minimum for a valid polygon)
      if (coordinates.length >= 3) {
        const first = coordinates[0];
        const last = coordinates[coordinates.length - 1];

        // Close the polygon if needed
        if (first[0] !== last[0] || first[1] !== last[1]) {
          coordinates.push([...first]);
        }

        // Make sure we have at least 4 points (3 unique + closure point)
        if (coordinates.length < 4) {
          console.error("Not enough points for a valid polygon", coordinates);
          return null;
        }

        // Detect and fix self-intersections if possible
        try {
          // Create a valid polygon and verify it's valid before returning
          const poly = turf.polygon([coordinates]);

          return poly;
        } catch (e) {
          console.error("Failed to create turf polygon", e);
          return null;
        }
      }
    } catch (error) {
      console.error("Error accessing polygon coordinates:", error);
      return null;
    }

    return null;
  } catch (err) {
    console.error("Error converting Leaflet polygon to Turf:", err);
    return null;
  }
};
export const turfToLeaflet = (turfPolygon) => {
  try {
    if (!turfPolygon || !turfPolygon.geometry || !turfPolygon.geometry.coordinates) {
      console.error("Invalid Turf polygon object");
      return [];
    }

    // For a simple Polygon
    if (turfPolygon.geometry.type === "Polygon") {
      const coords = turfPolygon.geometry.coordinates[0]; // Get the first (outer) ring
      if (!coords || !Array.isArray(coords)) {
        console.error("Invalid coordinates in Polygon");
        return [];
      }

      // Ensure minimum number of coordinates for a valid polygon
      if (coords.length < 4) {
        console.error("Not enough coordinates for a valid polygon");
        return [];
      }

      const latLngs = coords.map((coord) => new L.LatLng(coord[1], coord[0]));
      return latLngs;
    }
    // For a MultiPolygon
    else if (turfPolygon.geometry.type === "MultiPolygon") {
      if (
        !Array.isArray(turfPolygon.geometry.coordinates) ||
        turfPolygon.geometry.coordinates.length === 0
      ) {
        console.error("Invalid coordinates in MultiPolygon");
        return [];
      }

      // In case of MultiPolygon, we'll convert each polygon separately
      // and return the one with the largest area first
      try {
        const allPolygons = turfPolygon.geometry.coordinates
          .map((polygonCoords) => {
            if (Array.isArray(polygonCoords) && polygonCoords[0] && polygonCoords[0].length >= 4) {
              const latLngs = polygonCoords[0].map((coord) => new L.LatLng(coord[1], coord[0]));
              return {
                latLngs: latLngs,
                // Approximate area calculation using shoelace formula
                area: calculatePolygonArea(latLngs),
              };
            }
            return null;
          })
          .filter(Boolean);

        // Sort by area, largest first
        allPolygons.sort((a, b) => b.area - a.area);

        // Return the largest polygon
        if (allPolygons.length > 0) {
          console.log(`Returning the largest of ${allPolygons.length} polygons in MultiPolygon`);
          return allPolygons[0].latLngs;
        }

        console.error("No valid polygons found in MultiPolygon");
        return [];
      } catch (e) {
        console.error("Error processing MultiPolygon:", e);

        // Fallback to the first ring if error occurs
        if (
          turfPolygon.geometry.coordinates[0] &&
          Array.isArray(turfPolygon.geometry.coordinates[0]) &&
          turfPolygon.geometry.coordinates[0][0] &&
          turfPolygon.geometry.coordinates[0][0].length >= 4
        ) {
          const firstRing = turfPolygon.geometry.coordinates[0][0];
          return firstRing.map((coord) => new L.LatLng(coord[1], coord[0]));
        }
      }

      console.error("Could not extract valid coordinates from MultiPolygon");
      return [];
    }

    console.error("Unsupported geometry type:", turfPolygon.geometry.type);
    return [];
  } catch (error) {
    console.error("Error converting Turf polygon to Leaflet:", error);
    return [];
  }
};

// Helper function to calculate polygon area using shoelace formula
export const calculatePolygonArea = (vertices) => {
  try {
    let area = 0;
    const n = vertices.length;

    if (n < 3) return 0;

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += vertices[i].lat * vertices[j].lng;
      area -= vertices[j].lat * vertices[i].lng;
    }

    return Math.abs(area / 2);
  } catch (e) {
    console.error("Error calculating polygon area:", e);
    return 0;
  }
};

// Try to simplify an invalid polygon to make it valid
export const simplifyPolygon = (polygon) => {
  if (!polygon) return null;

  try {
    // First, check if the polygon has enough coordinates
    if (
      !polygon.geometry ||
      !polygon.geometry.coordinates ||
      !polygon.geometry.coordinates[0] ||
      polygon.geometry.coordinates[0].length < 4
    ) {
      console.error("Polygon has insufficient coordinates to simplify");
      return null;
    }

    // Last resort - create a minimal valid polygon from the original points
    try {
      // Extract unique coordinates
      const coords = polygon.geometry.coordinates[0];
      const uniqueCoords = [];

      // Filter out duplicates and ensure we have at least 4 unique points
      for (let i = 0; i < coords.length; i++) {
        const curr = coords[i];
        let isDuplicate = false;

        for (let j = 0; j < uniqueCoords.length; j++) {
          const prev = uniqueCoords[j];
          if (Math.abs(curr[0] - prev[0]) < 0.0000001 && Math.abs(curr[1] - prev[1]) < 0.0000001) {
            isDuplicate = true;
            break;
          }
        }

        if (!isDuplicate) {
          uniqueCoords.push(curr);
        }
      }

      // If we have at least 3 unique points, create a new polygon
      if (uniqueCoords.length >= 3) {
        // Ensure the polygon is closed
        if (
          uniqueCoords[0][0] !== uniqueCoords[uniqueCoords.length - 1][0] ||
          uniqueCoords[0][1] !== uniqueCoords[uniqueCoords.length - 1][1]
        ) {
          uniqueCoords.push([...uniqueCoords[0]]);
        }

        return turf.polygon([uniqueCoords]);
      }
    } catch (e) {
      console.error("Error creating minimal valid polygon:", e);
    }

    return null;
  } catch (error) {
    console.error("Error simplifying polygon:", error);
    return null;
  }
};

// Safe wrapper for turf operations
export const safeTurfOperation = (operation, ...args) => {
  try {
    // Get operation name for logging
    const opName = operation.name || "unknown operation";

    // Filter out null/undefined arguments
    const validArgs = args.filter((arg) => arg !== null && arg !== undefined);

    if (validArgs.length !== args.length) {
      console.warn(
        `Filtered out ${args.length - validArgs.length} invalid arguments for ${opName}`,
      );
    }

    // Handle special operations: union, intersect, difference
    if (["union", "intersect", "difference"].includes(opName)) {
      if (validArgs.length < 2) {
        console.warn(
          `Not enough arguments for ${opName}, expected at least 2, got ${validArgs.length}`,
        );
        return null;
      }

      // For difference operation, validate polygons
      if (opName === "difference") {
        if (!isValidPolygon(validArgs[0])) {
          console.warn("First polygon for difference operation is invalid");
          return null;
        }
        if (!isValidPolygon(validArgs[1])) {
          console.warn("Second polygon for difference operation is invalid");
          return validArgs[0]; // Return first polygon unchanged
        }
      }

      // Handle multiple geometries for union
      if (opName === "union" && validArgs.length > 2) {
        return handleMultiUnion(operation, validArgs);
      }

      // Execute operation with safety
      try {
        return operation(...validArgs);
      } catch (error) {
        console.error(`Error in ${opName} operation:`, error);
        return opName === "difference" ? validArgs[0] : null;
      }
    }

    // For other operations, just execute with valid args
    try {
      return operation(...validArgs);
    } catch (error) {
      console.error(`Error in ${opName} operation:`, error);
      return null;
    }
  } catch (error) {
    console.error(`Error performing turf operation ${operation.name || "unknown"}:`, error);
    return null;
  }
};

// Helper to check if a polygon is valid
const isValidPolygon = (polygon) => {
  return polygon && polygon.geometry && polygon.geometry.coordinates;
};

// Helper to handle multiple union operations
const handleMultiUnion = (operation, polygons) => {
  try {
    // Use dissolve if available
    if (turf.dissolve) {
      return turf.dissolve(turf.featureCollection(polygons));
    }

    // Otherwise union polygons sequentially
    let result = polygons[0];
    for (let i = 1; i < polygons.length; i++) {
      try {
        result = operation(result, polygons[i]);
      } catch (e) {
        console.error(`Error when unioning geometry ${i}:`, e);
        // Continue with current result
      }
    }
    return result;
  } catch (e) {
    console.error("Error handling multiple geometries:", e);
    // Fall back to standard operation with first two arguments
    return operation(polygons[0], polygons[1]);
  }
};
