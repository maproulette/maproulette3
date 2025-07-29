import { useMemo, useState, useEffect } from "react";
import { Polygon, useMap } from "react-leaflet";
import { FormattedMessage, useIntl } from "react-intl";
import messages from "./Messages";

// Priority configuration
const PRIORITIES = {
  0: { color: "#FF0000", name: "highPriority" }, // High - Red
  1: { color: "#FFA500", name: "mediumPriority" }, // Medium - Orange
  2: { color: "#008000", name: "lowPriority" }, // Low - Green
};

/**
 * Processes and validates GeoJSON polygon bounds
 */
const processAllPriorityBounds = (challenge) => {
  if (!challenge) return [];

  const allBounds = [];
  const priorityLevels = [
    { bounds: challenge.highPriorityBounds, level: 0 },
    { bounds: challenge.mediumPriorityBounds, level: 1 },
    { bounds: challenge.lowPriorityBounds, level: 2 },
  ];

  priorityLevels.forEach(({ bounds, level }) => {
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
              name: feature.properties?.name || null,
              description: feature.properties?.description || null,
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
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const map = useMap();
  const intl = useIntl();

  // Add event listener to hide tooltip when map is moved
  useEffect(() => {
    if (!map) return;

    const hideTooltip = () => {
      setActiveTooltip(null);
    };

    map.on("movestart", hideTooltip);
    map.on("zoomstart", hideTooltip);

    return () => {
      map.off("movestart", hideTooltip);
      map.off("zoomstart", hideTooltip);
    };
  }, [map]);

  if (priorityBounds.length === 0) return null;

  const handleClick = (boundsId, event) => {
    setMousePosition({ x: event.containerPoint.x, y: event.containerPoint.y });
    setActiveTooltip(activeTooltip === boundsId ? null : boundsId);
  };

  const activePolygon = priorityBounds.find((bounds) => bounds.id === activeTooltip);

  return (
    <>
      {priorityBounds
        .sort((a, b) => b.priorityLevel - a.priorityLevel) // Render low priority first (so high priority appears on top)
        .map((bounds) => (
          <Polygon
            key={bounds.id}
            positions={bounds.coordinates}
            pathOptions={{
              color: PRIORITIES[bounds.priorityLevel]?.color || "#3388FF",
              weight: 1,
              fillOpacity: 0.2,
              opacity: 0.6,
            }}
            eventHandlers={{
              click: (event) => handleClick(bounds.id, event),
            }}
          />
        ))}

      {/* Tooltip */}
      {activeTooltip && activePolygon && (
        <div
          style={{
            position: "fixed",
            left: mousePosition.x + 10,
            top: mousePosition.y - 30,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "normal",
            pointerEvents: "none",
            zIndex: 1000,
            whiteSpace: "nowrap",
          }}
        >
          <FormattedMessage
            {...messages[PRIORITIES[activePolygon.priorityLevel]?.name || "unknownPriority"]}
          />
        </div>
      )}
    </>
  );
};

export default PriorityBoundsLayer;
