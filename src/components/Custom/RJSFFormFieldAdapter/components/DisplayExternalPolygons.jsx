import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { getColorForPriority } from "../context/PriorityBoundsContext";

/**
 * Component to display polygons from other priority types
 */
export const DisplayExternalPolygons = ({ priorityType, allPriorityBounds = {} }) => {
  const featureGroupRef = useRef(null);
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    featureGroupRef.current = new L.FeatureGroup();
    map.addLayer(featureGroupRef.current);

    displayExternalPolygons();

    return () => {
      if (featureGroupRef.current && map) {
        map.removeLayer(featureGroupRef.current);
        featureGroupRef.current = null;
      }
    };
  }, [map, priorityType, allPriorityBounds]);

  const displayExternalPolygons = () => {
    if (!featureGroupRef.current) return;

    featureGroupRef.current.clearLayers();

    // Display polygons from other priority types
    Object.entries(allPriorityBounds).forEach(([type, bounds]) => {
      if (type === priorityType || !Array.isArray(bounds)) return;

      bounds.forEach((feature, index) => {
        try {
          if (feature?.geometry?.coordinates?.[0]) {
            const coords = feature.geometry.coordinates[0].map((coord) => [coord[1], coord[0]]);

            const polygon = L.polygon(coords, {
              color: getColorForPriority(type, "inactive"),
              weight: 1,
              opacity: 0.5,
              fillOpacity: 0.1,
              dashArray: "5, 5",
              interactive: false,
            });

            featureGroupRef.current.addLayer(polygon);
          }
        } catch (error) {
          console.error("Error displaying external polygon:", error);
        }
      });
    });
  };

  return null;
};
