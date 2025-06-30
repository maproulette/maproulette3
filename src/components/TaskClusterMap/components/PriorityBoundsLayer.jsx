import { Polygon } from "react-leaflet";
import { getPriorityColor } from "../utils/boundsProcessing";
import usePriorityBounds from "../hooks/usePriorityBounds";

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
