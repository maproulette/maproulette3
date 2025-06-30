/**
 * Utility functions for polygon operations
 */

/**
 * Converts a Leaflet polygon to GeoJSON format
 * @param {L.Polygon} leafletPolygon - The Leaflet polygon to convert
 * @returns {Object|null} GeoJSON feature object or null if conversion fails
 */
export const polygonToGeoJSON = (leafletPolygon) => {
  try {
    if (!leafletPolygon || typeof leafletPolygon.toGeoJSON !== "function") {
      console.warn("Invalid polygon provided to polygonToGeoJSON");
      return null;
    }

    const geoJSON = leafletPolygon.toGeoJSON();

    // Validate the result
    if (
      !geoJSON ||
      geoJSON.type !== "Feature" ||
      !geoJSON.geometry ||
      geoJSON.geometry.type !== "Polygon"
    ) {
      console.warn("Failed to convert polygon to valid GeoJSON");
      return null;
    }

    // Ensure we have properties object
    if (!geoJSON.properties) {
      geoJSON.properties = {};
    }

    // Add default name if not present
    if (!geoJSON.properties.name) {
      geoJSON.properties.name = `Polygon ${Date.now()}`;
    }

    return geoJSON;
  } catch (error) {
    console.error("Error converting polygon to GeoJSON:", error);
    return null;
  }
};
