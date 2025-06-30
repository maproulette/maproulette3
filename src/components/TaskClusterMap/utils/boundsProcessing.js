/**
 * Processes GeoJSON polygon bounds data for a specific priority level
 *
 * @param {Array} boundsData - Array of GeoJSON polygon features
 * @param {Number} priorityLevel - Priority level (0=high, 1=medium, 2=low)
 * @returns {Array} Processed bounds with Leaflet-compatible coordinates
 */
export const processPriorityBounds = (boundsData, priorityLevel) => {
  if (!Array.isArray(boundsData)) return [];

  return boundsData
    .filter(
      (feature) =>
        feature?.geometry?.type === "Polygon" && feature.geometry.coordinates?.[0]?.length >= 3,
    )
    .map((feature) => ({
      coordinates: feature.geometry.coordinates[0].map((coord) => [coord[1], coord[0]]),
      priorityLevel,
    }));
};

/**
 * Gets the priority level name from the priority level number
 *
 * @param {Number} level - Priority level (0=high, 1=medium, 2=low)
 * @returns {String} Priority level name
 */
export const getPriorityLevelName = (level) => {
  const names = ["High Priority", "Medium Priority", "Low Priority"];
  return names[level] || "Unknown Priority";
};

/**
 * Priority level colors
 */
export const PRIORITY_COLORS = {
  0: { base: "#FF0000", hover: "#FF3333", inactive: "#FF9999" }, // High
  1: { base: "#FFA500", hover: "#FFB733", inactive: "#FFCC99" }, // Medium
  2: { base: "#008000", hover: "#33A033", inactive: "#99CC99" }, // Low
};

/**
 * Gets the priority level color for a specific state
 *
 * @param {Number} level - Priority level (0=high, 1=medium, 2=low)
 * @param {String} state - Color state (base, hover, inactive)
 * @returns {String} Hex color code
 */
export const getPriorityColor = (level, state = "base") => {
  return PRIORITY_COLORS[level]?.[state] || "#3388FF";
};
