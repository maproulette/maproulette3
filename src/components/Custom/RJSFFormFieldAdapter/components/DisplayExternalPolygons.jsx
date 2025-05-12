import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { getColorForPriority, registerObserver } from "../context/PriorityBoundsContext";
/**
 * Component to display polygons from other priority types
 *
 * @param {Object} props Component props
 * @param {string} props.priorityType The current priority type being edited
 */
const DisplayExternalPolygons = ({ priorityType }) => {
  const [featureGroup] = useState(() => new L.FeatureGroup());
  const map = useMap();

  // Add feature group to map on mount, remove on unmount
  useEffect(() => {
    map.addLayer(featureGroup);
    return () => map.removeLayer(featureGroup);
  }, [featureGroup, map]);

  // Listen for changes to polygons of other priority types
  useEffect(() => {
    const handlePolygonChange = (changedPriority) => {
      // Only update if the change is for a different priority than ours
      if (changedPriority !== priorityType) {
        refreshExternalPolygons();
      }
    };

    // Register observer and get cleanup function
    const unregister = registerObserver(handlePolygonChange);

    // Initial refresh
    refreshExternalPolygons();

    return unregister;
  }, [priorityType]);

  // Function to refresh the display of external polygons
  const refreshExternalPolygons = () => {
    // Clear existing layers
    featureGroup.clearLayers();

    // Add external polygons from all other priority groups
    Object.entries(window.globalFeatureGroups || {}).forEach(([type, group]) => {
      // Skip our own priority type or invalid groups
      if (!group || type === `priority-${priorityType}-feature-group`) return;

      // Extract the priority type from the group name
      const otherPriority = type.replace(/^priority-(.+)-feature-group$/, "$1");
      const otherPolygons = group.getLayers();

      if (!otherPolygons?.length) return;

      otherPolygons.forEach((polygon) => {
        if (!polygon?.getLatLngs) return;

        try {
          // Create a copy with styling to show it's disabled/readonly
          const copy = L.polygon(polygon.getLatLngs(), {
            color: getColorForPriority(otherPriority, "inactive"),
            weight: 2,
            opacity: 0.5,
            fillOpacity: 0.1,
            dashArray: "5, 5",
            interactive: false, // Make it non-interactive
          });

          featureGroup.addLayer(copy);
        } catch (e) {
          console.error("Error displaying external polygon:", e);
        }
      });
    });
  };

  // Nothing to render directly in the component
  return null;
};

export default DisplayExternalPolygons;
