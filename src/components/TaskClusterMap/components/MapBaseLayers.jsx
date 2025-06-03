import { AttributionControl, ScaleControl } from "react-leaflet";
import BusySpinner from "../../BusySpinner/BusySpinner";
import { LegendToggleControl } from "../LegendToggleControl";
import ZoomInMessage from "../ZoomInMessage";

/**
 * Handles base map layer components and controls
 */
const MapBaseLayers = ({
  loading,
  loadingChallenge,
  externalOverlay,
  searchOpen,
  mapZoomedOut,
  zoom,
}) => {
  return (
    <>
      <AttributionControl position="bottomleft" prefix={false} />
      <ScaleControl className="mr-z-10" position="bottomleft" />
      <LegendToggleControl />

      {/* Loading spinner */}
      {(Boolean(loading) || Boolean(loadingChallenge)) && <BusySpinner mapMode xlarge />}

      {/* Zoom in message */}
      {!externalOverlay && !searchOpen && !!mapZoomedOut && <ZoomInMessage zoom={zoom} />}
    </>
  );
};

export default MapBaseLayers;
