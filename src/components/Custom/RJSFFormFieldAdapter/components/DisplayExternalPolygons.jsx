import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { getColorForPriority } from "../context/PriorityBoundsContext";
/**
 * Component to display polygons from other priority types
 *
 * @param {Object} props Component props
 * @param {string} props.priorityType The current priority type being edited
 */
const DisplayExternalPolygons = ({ priorityType }) => {
  const featureGroupRef = useRef(null);
  const map = useMap();

  // Initialize feature group once
  useEffect(() => {
    featureGroupRef.current = new L.FeatureGroup();
    map.addLayer(featureGroupRef.current);

    // Initial refresh
    refreshExternalPolygons();

    // Cleanup on unmount
    return () => {
      if (featureGroupRef.current && map) {
        map.removeLayer(featureGroupRef.current);
        featureGroupRef.current = null;
      }
    };
  }, [map, priorityType]);

  // Function to refresh the display of external polygons
  const refreshExternalPolygons = () => {
    // Skip if feature group isn't ready yet
    if (!featureGroupRef.current) return;

    // Clear existing layers
    featureGroupRef.current.clearLayers();

    // Add external polygons from all other priority groups
    Object.entries(window.globalFeatureGroups || {}).forEach(([type, group]) => {
      // Skip our own priority type or invalid groups
      if (!group || type === `priority-${priorityType}-feature-group`) return;

      // Extract the priority type from the group name
      const otherPriority = type.replace(/^priority-(.+)-feature-group$/, "$1");
      const otherPolygons = group.getLayers();

      if (!otherPolygons?.length) return;

      otherPolygons.forEach((polygon, index) => {
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

          // Assign a unique ID to help with identification
          copy._externalId = `${otherPriority}-${index}`;

          featureGroupRef.current.addLayer(copy);
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
