import { useEffect } from "react";
import { useMap } from "react-leaflet";

/**
 * Component to handle various map events such as resizing and focus management
 */
const MapEventHandlers = ({ widgetLayout }) => {
  const map = useMap();

  // Handle map resize when widget layout changes
  useEffect(() => {
    map.invalidateSize();
  }, [map, widgetLayout?.w, widgetLayout?.h]);

  // Handle focus removal
  useEffect(() => {
    // Add event listener to clear focus on map click
    const clearFocus = () => {
      if (document.activeElement) {
        document.activeElement.blur();
      }
    };

    const mapContainer = map.getContainer();
    mapContainer.addEventListener("click", clearFocus);
    mapContainer.addEventListener("mousedown", clearFocus);

    return () => {
      mapContainer.removeEventListener("click", clearFocus);
      mapContainer.removeEventListener("mousedown", clearFocus);
    };
  }, [map]);

  return null;
};

export default MapEventHandlers;
