import { useMemo } from "react";
import { Polygon } from "react-leaflet";

/**
 * Priority level colors
 */
const PRIORITY_COLORS = {
  0: "#FF0000", // High - Red
  1: "#FFA500", // Medium - Orange
  2: "#008000", // Low - Green
};

/**
 * Gets the priority level color
 */
const getPriorityColor = (level) => {
  return PRIORITY_COLORS[level] || "#3388FF";
};

/**
 * Processes and validates GeoJSON polygon bounds
 */
const processAllPriorityBounds = (challenge) => {
  if (!challenge) return [];

  const allBounds = [];

  // Process each priority level
  const priorities = [
    { bounds: challenge.highPriorityBounds, level: 0 },
    { bounds: challenge.mediumPriorityBounds, level: 1 },
    { bounds: challenge.lowPriorityBounds, level: 2 },
  ];

  priorities.forEach(({ bounds, level }) => {
    if (Array.isArray(bounds)) {
      bounds.forEach((feature, index) => {
        if (
          feature?.geometry?.type === "Polygon" &&
          feature.geometry.coordinates?.[0]?.length >= 3
        ) {
          try {
            allBounds.push({
              id: `${level}-${index}`,
              coordinates: feature.geometry.coordinates[0].map((coord) => [coord[1], coord[0]]),
              priorityLevel: level,
            });
          } catch (error) {
            console.error("Error processing priority polygon:", error);
          }
        }
      });
    }
  });

  return allBounds;
};

/**
 * Displays priority bounds polygons on the map
 */
const PriorityBoundsLayer = ({ challenge }) => {
  const priorityBounds = useMemo(() => processAllPriorityBounds(challenge), [challenge]);

  if (priorityBounds.length === 0) return null;

  return (
    <>
      {priorityBounds
        .sort((a, b) => b.priorityLevel - a.priorityLevel) // Render low priority first (so high priority appears on top)
        .map((bounds) => (
          <Polygon
            key={bounds.id}
            positions={bounds.coordinates}
            pathOptions={{
              color: getPriorityColor(bounds.priorityLevel),
              weight: 1,
              fillOpacity: 0.2,
              opacity: 0.6,
            }}
          />
        ))}
    </>
  );
};

export default PriorityBoundsLayer;
