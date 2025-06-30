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
export const DisplayExternalPolygons = ({ priorityType }) => {
  const featureGroupRef = useRef(null);
  const map = useMap();

  useEffect(() => {
    featureGroupRef.current = new L.FeatureGroup();
    map.addLayer(featureGroupRef.current);

    refreshExternalPolygons();

    return () => {
      if (featureGroupRef.current && map) {
        map.removeLayer(featureGroupRef.current);
        featureGroupRef.current = null;
      }
    };
  }, [map, priorityType]);

  const refreshExternalPolygons = () => {
    if (!featureGroupRef.current) return;

    featureGroupRef.current.clearLayers();

    Object.entries(window.globalFeatureGroups || {}).forEach(([type, group]) => {
      if (!group || type === `priority-${priorityType}-feature-group`) return;

      const otherPriority = type.replace(/^priority-(.+)-feature-group$/, "$1");
      const otherPolygons = group.getLayers();

      if (!otherPolygons?.length) return;

      otherPolygons.forEach((polygon, index) => {
        if (!polygon?.getLatLngs) return;

        try {
          const copy = L.polygon(polygon.getLatLngs(), {
            color: getColorForPriority(otherPriority, "inactive"),
            weight: 2,
            opacity: 0.5,
            fillOpacity: 0.1,
            dashArray: "5, 5",
            interactive: false,
          });

          copy._externalId = `${otherPriority}-${index}`;

          featureGroupRef.current.addLayer(copy);
        } catch (e) {
          console.error("Error displaying external polygon:", e);
        }
      });
    });
  };

  return null;
};
