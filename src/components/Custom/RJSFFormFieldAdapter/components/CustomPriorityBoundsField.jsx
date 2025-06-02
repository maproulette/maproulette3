import { useState, useEffect } from "react";
import {
  AttributionControl,
  MapContainer,
  ScaleControl,
  TileLayer,
  useMap,
  ZoomControl,
} from "react-leaflet";
import SvgSymbol from "../../../SvgSymbol/SvgSymbol";
import "leaflet/dist/leaflet.css";
import "leaflet-lasso";
import {
  PriorityBoundsContext,
  resetFeatureGroup,
  globalFeatureGroups,
} from "../context/PriorityBoundsContext.jsx";
import BoundsSelector from "./BoundsSelector";
import DisplayExternalPolygons from "./DisplayExternalPolygons";
import { FormattedMessage } from "react-intl";
import messages from "../Messages.js";

// Track global state for initial values by priority type
const globalInitialValues = {
  high: null,
  medium: null,
  low: null,
};

// Initialize global state for a priority type if the initial value hasn't been set yet
const initializeGlobalState = (priorityType, initialValue) => {
  if (globalInitialValues[priorityType] === null) {
    globalInitialValues[priorityType] = initialValue ? [...initialValue] : [];
  }
};

/**
 * Helper component to fit map to bounds when polygons exist
 */
const FitBoundsControl = ({ priorityType }) => {
  const map = useMap();

  useEffect(() => {
    // Function to check and fit bounds
    const fitToBounds = () => {
      // Get the feature group for this priority
      const groupKey = `priority-${priorityType}-feature-group`;
      const featureGroup = globalFeatureGroups[groupKey];

      // Check if feature group exists and has layers
      if (featureGroup && featureGroup.getLayers().length > 0) {
        try {
          // Fit bounds with padding
          const bounds = featureGroup.getBounds();
          map.fitBounds(bounds, { padding: [50, 50] });
        } catch (e) {
          console.error("Error fitting bounds:", e);
        }
      }
    };

    // Initial fit attempt with a delay to ensure layers are loaded
    const timer = setTimeout(fitToBounds, 100);

    // Also listen for bounds changed events
    const boundsChangedHandler = () => fitToBounds();
    window.addEventListener("mr:priority-bounds-changed", boundsChangedHandler);

    // Additionally, listen for map size changes (important for initial display)
    map.on("resize", fitToBounds);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mr:priority-bounds-changed", boundsChangedHandler);
      map.off("resize", fitToBounds);
    };
  }, []);

  return null;
};

/**
 * Custom field for selecting priority bounds on a map
 * Displays a map interface where users can draw polygons to define priority areas
 */
const CustomPriorityBoundsField = ({ formData, onChange, name }) => {
  const [isMapVisible, setIsMapVisible] = useState(false);
  // Extract priority type from field name
  const priorityType = name?.includes("highPriorityBounds")
    ? "high"
    : name?.includes("mediumPriorityBounds")
    ? "medium"
    : "low";

  // Initialize the global state with the initial form data
  useEffect(() => {
    console.log(
      `CustomPriorityBoundsField: Initializing global state for ${priorityType}`,
      formData,
    );

    // Store formData globally for reference
    window[`priority-${priorityType}-initial-data`] = formData
      ? JSON.parse(JSON.stringify(formData))
      : [];

    // Initialize global state with the form data when component first mounts
    initializeGlobalState(priorityType, formData);

    // Dispatch event to notify other components about the data
    window.dispatchEvent(
      new CustomEvent("mr:priority-bounds-data-initialized", {
        detail: { priorityType, data: formData },
      }),
    );
  }, []);

  // Determine if the map should be shown automatically when there's data
  useEffect(() => {
    console.log(`CustomPriorityBoundsField: formData changed for ${priorityType}`, formData);
    if (Array.isArray(formData) && formData.length > 0 && !isMapVisible) {
      console.log(
        `CustomPriorityBoundsField: Auto-showing map for ${priorityType} with ${formData.length} polygons`,
      );
      setIsMapVisible(true);
    }
  }, [formData, isMapVisible]);

  // Don't reset feature group when component unmounts - we want to keep it
  // Only clean up when we're really unmounting the entire component tree
  useEffect(() => {
    console.log(`CustomPriorityBoundsField: Component mounted for ${priorityType}`);
    return () => {
      console.log(
        `CustomPriorityBoundsField: Component unmounting for ${priorityType}`,
        window.unloadingMapField,
      );
      // Only reset if this is a true component unmount, not just a visibility toggle
      if (window.unloadingMapField) {
        resetFeatureGroup(priorityType);
      }
    };
  }, [priorityType]);

  // Dispatch custom event when bounds change to notify other components
  const handleChange = (newData) => {
    console.log(`CustomPriorityBoundsField: onChange called for ${priorityType}`, newData);
    onChange(newData);
    // Dispatch event to notify DisplayExternalPolygons components
    window.dispatchEvent(new CustomEvent("mr:priority-bounds-changed"));
  };

  return (
    <div className="mr-relative mr-mb-8" onClick={(e) => e.stopPropagation()}>
      <div className="mr-flex mr-items-center mr-justify-between mr-mb-3 mr-bg-black-5 mr-p-3 mr-rounded-lg mr-shadow-sm">
        <button
          onClick={() => setIsMapVisible(!isMapVisible)}
          className={`mr-button mr-flex mr-items-center mr-gap-2 mr-py-2 mr-transition-all mr-duration-300 ${
            isMapVisible ? "mr-button--green" : "mr-button--white"
          }`}
        >
          <SvgSymbol sym="globe-icon" viewBox="0 0 20 20" className="mr-w-5 mr-h-5" />
          <span>
            <FormattedMessage {...(isMapVisible ? messages.hideMap : messages.showMap)} />
          </span>
        </button>

        {Array.isArray(formData) && formData.length > 0 && (
          <div className="mr-bg-blue-firefly-75 mr-px-4 mr-py-2 mr-rounded-lg mr-flex mr-items-center mr-gap-2 mr-shadow-sm">
            <SvgSymbol
              sym="map-pin-icon"
              viewBox="0 0 20 20"
              className="mr-w-5 mr-h-5 mr-text-green-lighter"
            />
            <span className="mr-text-green-lighter mr-text-sm mr-font-medium">
              <FormattedMessage {...messages.polygonsDefined} values={{ count: formData.length }} />
            </span>
          </div>
        )}
      </div>

      {isMapVisible && (
        <div className="mr-relative mr-rounded-lg mr-overflow-hidden mr-shadow-lg mr-border mr-border-black-10 mr-transition-all mr-duration-300">
          <PriorityBoundsContext.Provider value={{ currentPriority: priorityType }}>
            <MapContainer
              key={`priority-${priorityType}-map`}
              zoom={2}
              style={{ height: "500px", width: "100%" }}
              attributionControl={false}
              center={[0, 0]}
              minZoom={2}
              maxZoom={18}
              maxBounds={[
                [-85, -180],
                [85, 180],
              ]}
              zoomControl={false}
              onClick={(e) => e.stopPropagation()}
              className="mr-z-10"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <AttributionControl position="bottomleft" prefix={false} />
              <ScaleControl className="mr-z-10" position="bottomleft" />
              <ZoomControl position="topright" />

              <BoundsSelector
                value={formData}
                onChange={handleChange}
                priorityType={priorityType}
              />
              <DisplayExternalPolygons priorityType={priorityType} />
              <FitBoundsControl priorityType={priorityType} />
            </MapContainer>
          </PriorityBoundsContext.Provider>
        </div>
      )}
    </div>
  );
};

export default CustomPriorityBoundsField;
