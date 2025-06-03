/**
 * Processes GeoJSON polygon bounds data for a specific priority level
 *
 * @param {Array} boundsData - Array of GeoJSON polygon features
 * @param {Number} priorityLevel - Priority level (0=high, 1=medium, 2=low)
 * @returns {Array} Processed bounds with Leaflet-compatible coordinates
 */
export const processPriorityBounds = (boundsData, priorityLevel) => {
  if (!boundsData || !Array.isArray(boundsData)) return [];

  const bounds = [];

  boundsData.forEach((boundFeature) => {
    // Check if we have a polygon with coordinates
    if (
      boundFeature.geometry?.type === "Polygon" &&
      Array.isArray(boundFeature.geometry.coordinates) &&
      boundFeature.geometry.coordinates.length > 0
    ) {
      // Extract the polygon coordinates (outer ring)
      const coords = boundFeature.geometry.coordinates[0];
      if (!coords || !Array.isArray(coords) || coords.length < 3) return;

      // Store the polygon coordinates as an array of [lat, lng] pairs for Leaflet
      const polygonCoords = coords.map((coord) => [coord[1], coord[0]]);

      // Add to bounds collection with priority level and polygon coordinates
      bounds.push({
        coordinates: polygonCoords,
        priorityLevel,
      });
    }
  });

  return bounds;
};

/**
 * Gets the priority level name from the priority level number
 *
 * @param {Number} level - Priority level (0=high, 1=medium, 2=low)
 * @returns {String} Priority level name
 */
export const getPriorityLevelName = (level) => {
  switch (level) {
    case 0:
      return "High Priority";
    case 1:
      return "Medium Priority";
    case 2:
      return "Low Priority";
    default:
      return "Unknown Priority";
  }
};

/**
 * Checks if a polygon has valid coordinates
 *
 * @param {Object} boundsItem - Bounds item with coordinates
 * @returns {Boolean} True if valid
 */
export const isValidPolygon = (boundsItem) => {
  return (
    boundsItem?.coordinates &&
    Array.isArray(boundsItem.coordinates) &&
    boundsItem.coordinates.length >= 3
  );
};

export default {
  processPriorityBounds,
  getPriorityLevelName,
  isValidPolygon,
};
