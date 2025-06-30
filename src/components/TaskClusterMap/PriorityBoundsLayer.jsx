import { useMemo } from "react";
import { Polygon } from "react-leaflet";

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

const usePriorityBounds = (challenge) => {
  const priorityBounds = useMemo(() => {
    if (!challenge) return [];

    const bounds = [
      ...processPriorityBounds(challenge.highPriorityBounds, 0),
      ...processPriorityBounds(challenge.mediumPriorityBounds, 1),
      ...processPriorityBounds(challenge.lowPriorityBounds, 2),
    ];

    // Add task counts to bounds
    return bounds.map((bound) => ({
      ...bound,
      count: getCountForPriority(challenge, bound.priorityLevel),
    }));
  }, [challenge]);

  return {
    priorityBounds,
    priorityBoundsCount: priorityBounds.length,
    hasPriorityBounds: priorityBounds.length > 0,
  };
};

const getCountForPriority = (challenge, level) => {
  switch (level) {
    case 0:
      return challenge.highPriorityCount || null;
    case 1:
      return challenge.mediumPriorityCount || null;
    case 2:
      return challenge.lowPriorityCount || null;
    default:
      return null;
  }
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

/**
 * Displays priority bounds polygons on the map
 */
const PriorityBoundsLayer = ({ challenge }) => {
  const { priorityBounds, hasPriorityBounds } = usePriorityBounds(challenge);

  if (!hasPriorityBounds) return null;

  return (
    <>
      {priorityBounds
        .filter((bounds) => bounds?.coordinates?.length >= 3)
        .sort((a, b) => b.priorityLevel - a.priorityLevel) // Render low priority first (so high priority is on top)
        .map((boundsItem, index) => {
          try {
            return (
              <Polygon
                key={`priority-${boundsItem.priorityLevel}-${index}`}
                positions={boundsItem.coordinates}
                pathOptions={{
                  color: getPriorityColor(boundsItem.priorityLevel, "base"),
                  weight: 1,
                  fillOpacity: 0.2,
                  opacity: 0.6,
                }}
              />
            );
          } catch (error) {
            console.error("Error rendering priority polygon:", error);
            return null;
          }
        })}
    </>
  );
};

export default PriorityBoundsLayer;
