import { Polygon } from "react-leaflet";
import { TaskPriorityColors } from "../../../services/Task/TaskPriority/TaskPriority";
import usePriorityBounds from "../hooks/usePriorityBounds";
import { isValidPolygon } from "../utils/boundsProcessing";

/**
 * Displays priority bounds polygons on the map
 */
const PriorityBoundsLayer = ({ challenge }) => {
  // Use custom hook to process priority bounds
  const { priorityBounds, hasPriorityBounds } = usePriorityBounds(challenge);

  if (!hasPriorityBounds) return null;

  return (
    <>
      {priorityBounds
        .slice() // Create a copy to avoid mutating the original array
        .sort((a, b) => b.priorityLevel - a.priorityLevel) // Sort by priority level (lowest priority rendered first)
        .map((boundsItem, index) => {
          if (!isValidPolygon(boundsItem)) {
            return null;
          }

          try {
            return (
              <Polygon
                key={`priority-${boundsItem.priorityLevel}-${index}`}
                title={`Priority ${boundsItem.priorityLevel}`}
                positions={boundsItem.coordinates}
                pathOptions={{
                  color: TaskPriorityColors[boundsItem.priorityLevel] || "#ff0000",
                  weight: 0.5,
                  fillOpacity: 0.2,
                  className: "priority-polygon",
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
