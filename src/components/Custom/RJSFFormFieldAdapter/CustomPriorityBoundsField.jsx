import L from "leaflet";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import SvgSymbol from "../../SvgSymbol/SvgSymbol";
import messages from "./Messages";
import BoundsSelector from "./components/BoundsSelector";
import { usePriorityBoundsData } from "./context/PriorityBoundsDataContext";

const MapViewPreserver = ({ onViewChange }) => {
  const map = useMap();

  useEffect(() => {
    const handleViewChange = () => {
      onViewChange({
        center: map.getCenter(),
        zoom: map.getZoom(),
      });
    };

    map.on("moveend", handleViewChange);
    map.on("zoomend", handleViewChange);

    return () => {
      map.off("moveend", handleViewChange);
      map.off("zoomend", handleViewChange);
    };
  }, [map, onViewChange]);

  return null;
};

const AutoZoomToBounds = ({
  boundsData,
  hasZoomed,
  setHasZoomed,
  allPriorityBounds,
  priorityType,
}) => {
  const map = useMap();

  useEffect(() => {
    if (!map || hasZoomed) {
      return;
    }

    try {
      // Calculate bounds from all available polygon data
      const leafletBounds = L.latLngBounds();
      let hasValidBounds = false;

      // First, try to use the current priority bounds
      if (boundsData && boundsData.length > 0) {
        boundsData.forEach((feature) => {
          if (feature?.geometry?.coordinates?.[0]) {
            const coords = feature.geometry.coordinates[0];
            coords.forEach((coord) => {
              if (Array.isArray(coord) && coord.length >= 2) {
                // Convert from [lng, lat] to [lat, lng]
                leafletBounds.extend([coord[1], coord[0]]);
                hasValidBounds = true;
              }
            });
          }
        });
      }

      // If no bounds from current priority, try to use all priority bounds
      if (!hasValidBounds && allPriorityBounds) {
        Object.entries(allPriorityBounds).forEach(([_type, priorityData]) => {
          if (Array.isArray(priorityData) && priorityData.length > 0) {
            priorityData.forEach((feature) => {
              if (feature?.geometry?.coordinates?.[0]) {
                const coords = feature.geometry.coordinates[0];
                coords.forEach((coord) => {
                  if (Array.isArray(coord) && coord.length >= 2) {
                    // Convert from [lng, lat] to [lat, lng]
                    leafletBounds.extend([coord[1], coord[0]]);
                    hasValidBounds = true;
                  }
                });
              }
            });
          }
        });
      }

      if (hasValidBounds) {
        // Add some padding to the bounds
        const paddedBounds = leafletBounds.pad(0.1);

        // Fit the map to the bounds with a slight delay to ensure map is ready
        setTimeout(() => {
          map.fitBounds(paddedBounds, {
            padding: [20, 20],
            maxZoom: 16, // Prevent zooming in too far
            animate: true,
            duration: 0.5,
          });
        }, 100);

        setHasZoomed(true);
      }
    } catch (error) {
      console.error("Error calculating bounds for auto-zoom:", error);
    }
  }, [map, boundsData, hasZoomed, setHasZoomed, allPriorityBounds, priorityType]);

  return null;
};

/**
 * Custom field for selecting priority bounds on a map
 */
const CustomPriorityBoundsField = (props) => {
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [viewState, setViewState] = useState({ center: [0, 0], zoom: 2 });
  const [hasZoomed, setHasZoomed] = useState(false);

  // Determine priority type from field name
  const priorityType = props.name?.includes("highPriorityBounds")
    ? "high"
    : props.name?.includes("mediumPriorityBounds")
      ? "medium"
      : props.name?.includes("lowPriorityBounds")
        ? "low"
        : "default";

  const formData = props.formData || [];
  const { priorityBoundsData, updatePriorityBounds } = usePriorityBoundsData();

  // Update context when this field's data changes
  useEffect(() => {
    updatePriorityBounds(priorityType, formData);
  }, [formData, priorityType, updatePriorityBounds]);

  // Also sync with form context if available
  useEffect(() => {
    const completeFormData = props.formContext?.formData || {};
    if (
      completeFormData.highPriorityBounds ||
      completeFormData.mediumPriorityBounds ||
      completeFormData.lowPriorityBounds
    ) {
      // Update all priority bounds in context
      if (completeFormData.highPriorityBounds && priorityType !== "high") {
        updatePriorityBounds("high", completeFormData.highPriorityBounds);
      }
      if (completeFormData.mediumPriorityBounds && priorityType !== "medium") {
        updatePriorityBounds("medium", completeFormData.mediumPriorityBounds);
      }
      if (completeFormData.lowPriorityBounds && priorityType !== "low") {
        updatePriorityBounds("low", completeFormData.lowPriorityBounds);
      }
    }
  }, [props.formContext?.formData, priorityType, updatePriorityBounds]);

  // Show map if there are existing polygons
  useEffect(() => {
    if (Array.isArray(formData) && formData.length > 0) {
      setIsMapVisible(true);
    }
  }, [formData]);

  // Reset zoom flag when map becomes visible or data changes
  useEffect(() => {
    if (isMapVisible) {
      setHasZoomed(false);
    }
  }, [isMapVisible]);

  const handleChange = (newData) => {
    if (typeof props.onChange === "function") {
      props.onChange(Array.isArray(newData) ? [...newData] : newData);
    }
  };

  return (
    <div className="mr-relative mr-mb-8" onClick={(e) => e.stopPropagation()}>
      <div className="mr-flex mr-items-center mr-justify-between mr-mb-3 mr-bg-black-5 mr-p-3 mr-rounded-lg mr-shadow-sm">
        <button
          type="button"
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

        {formData.length > 0 && (
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
          <MapContainer
            zoom={viewState.zoom}
            center={viewState.center}
            style={{ height: "500px", width: "100%" }}
            attributionControl={false}
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
            <MapViewPreserver onViewChange={setViewState} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            <AutoZoomToBounds
              boundsData={formData}
              hasZoomed={hasZoomed}
              setHasZoomed={setHasZoomed}
              allPriorityBounds={priorityBoundsData}
              priorityType={priorityType}
            />

            <BoundsSelector
              value={formData}
              onChange={handleChange}
              priorityType={priorityType}
              allPriorityBounds={priorityBoundsData}
            />
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default CustomPriorityBoundsField;
