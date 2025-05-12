/**
 * Utility functions for polygon handling in priority bounds
 */

/**
 * Close a ring if needed by adding the first point to the end
 *
 * @param {Array} ring - Array of coordinate pairs
 * @returns {Array} Closed ring with matching first and last point
 */
const closeRing = (ring) => {
  if (!Array.isArray(ring) || ring.length === 0) return ring;

  const first = ring[0];
  const last = ring[ring.length - 1];

  // Check if the ring is already closed (first and last points match)
  if (first[0] === last[0] && first[1] === last[1]) {
    return ring;
  }

  // Close the ring by adding a copy of the first point at the end
  return [...ring, [first[0], first[1]]];
};

/**
 * Convert Leaflet polygon to GeoJSON
 *
 * @param {L.Polygon} polygon - Leaflet polygon object
 * @returns {Object|null} GeoJSON Feature object or null if conversion fails
 */
export const polygonToGeoJSON = (polygon) => {
  if (!polygon) return null;

  try {
    // Use native toGeoJSON if available (Leaflet 1.0+)
    if (typeof polygon.toGeoJSON === "function") {
      return polygon.toGeoJSON();
    }

    // Fallback for older Leaflet versions or custom polygon objects
    if (typeof polygon.getLatLngs !== "function") {
      console.warn("Cannot convert to GeoJSON: polygon.getLatLngs is not a function");
      return null;
    }

    const latLngs = polygon.getLatLngs();
    let coordinates = [];

    // Handle simple polygon (one ring)
    if (latLngs.length > 0 && !Array.isArray(latLngs[0])) {
      coordinates = [closeRing(latLngs.map((ll) => [ll.lng, ll.lat]))];
    }
    // Handle multi-polygon or polygon with holes
    else if (latLngs.length > 0) {
      coordinates = latLngs
        .map((ring) => {
          // Make sure ring is an array of coordinates
          if (!Array.isArray(ring)) return [];
          return closeRing(ring.map((ll) => [ll.lng, ll.lat]));
        })
        .filter((ring) => ring.length >= 4); // Valid rings need at least 4 points (3 + closing point)
    }

    // If we don't have any valid coordinates, return null
    if (coordinates.length === 0 || coordinates[0].length < 4) {
      return null;
    }

    return {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates,
      },
    };
  } catch (error) {
    console.error("Error converting polygon to GeoJSON:", error);
    return null;
  }
};

/**
 * Validate if a GeoJSON polygon is properly closed
 *
 * @param {Object} feature - GeoJSON Feature
 * @returns {Object} The valid feature with properly closed rings, or null if invalid
 */
export const validateGeoJSONPolygon = (feature) => {
  if (!feature || !feature.geometry || !feature.geometry.coordinates) {
    return null;
  }

  if (feature.geometry.type !== "Polygon") {
    return null;
  }

  try {
    // Make sure all rings are closed
    const validCoordinates = feature.geometry.coordinates.map((ring) => closeRing(ring));

    // Make sure we have at least one ring with at least 4 points
    if (validCoordinates.length === 0 || validCoordinates[0].length < 4) {
      return null;
    }

    return {
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: validCoordinates,
      },
    };
  } catch (error) {
    console.error("Error validating GeoJSON polygon:", error);
    return null;
  }
};
