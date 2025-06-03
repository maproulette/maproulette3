import { forwardRef } from "react";
import MapMarkers from "../MapMarkers";

/**
 * Manages map markers and clusters, forwarding props to MapMarkers component
 */
const MapMarkerManager = forwardRef((props, ref) => {
  return <MapMarkers {...props} ref={ref} />;
});

export default MapMarkerManager;
