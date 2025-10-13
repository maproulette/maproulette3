import { getType } from "@turf/invariant";
import { isFeature, isFeatureCollection } from "geojson-validation";
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
  const [uploadFeedback, setUploadFeedback] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

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

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showTooltip && !event.target.closest(".tooltip-container")) {
        setShowTooltip(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showTooltip]);

  const handleChange = (newData) => {
    if (typeof props.onChange === "function") {
      props.onChange(Array.isArray(newData) ? [...newData] : newData);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file) => {
    setUploadFeedback(null);

    const validExtensions = [".json", ".geojson"];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."));

    if (!validExtensions.includes(fileExtension)) {
      setUploadFeedback({ type: "error", message: messages.fileTypeError });
      return;
    }

    try {
      const text = await file.text();
      const geoJson = JSON.parse(text);

      if (!isFeature(geoJson) && !isFeatureCollection(geoJson)) {
        throw new Error("Input must be a valid GeoJSON Feature or FeatureCollection");
      }

      const features = getType(geoJson) === "Feature" ? [geoJson] : geoJson.features || [];

      const polygonFeatures = features.filter(
        (feature) =>
          feature.type === "Feature" && feature.geometry && feature.geometry.type === "Polygon",
      );

      if (polygonFeatures.length === 0) {
        throw new Error("No valid Polygon features found");
      }

      const newData = [...formData, ...polygonFeatures];
      handleChange(newData);

      setUploadFeedback({
        type: "success",
        message: messages.uploadSuccess,
        count: polygonFeatures.length,
      });

      if (!isMapVisible) {
        setIsMapVisible(true);
      }

      setHasZoomed(false);

      setTimeout(() => setUploadFeedback(null), 3000);
    } catch (error) {
      setUploadFeedback({
        type: "error",
        message: messages.invalidGeoJSON,
        details: error.message,
      });
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
    // Reset input value to allow same file to be selected again
    e.target.value = "";
  };

  return (
    <div className="mr-relative mr-mb-4" onClick={(e) => e.stopPropagation()}>
      <div className="mr-flex mr-items-center mr-gap-2 mr-mb-2">
        <button
          type="button"
          onClick={() => setIsMapVisible(!isMapVisible)}
          className={`mr-button mr-button--small mr-flex mr-items-center mr-gap-2 mr-transition-all mr-duration-300 mr-mt-2 mr-py-2 ${
            isMapVisible ? "mr-button--green" : "mr-button--white"
          }`}
        >
          <SvgSymbol sym="globe-icon" viewBox="0 0 20 20" className="mr-w-5 mr-h-5" />
          <FormattedMessage {...(isMapVisible ? messages.hideMap : messages.showMap)} />
        </button>

        {/* Upload GeoJSON Button */}
        <div
          className={`mr-relative mr-button mr-button--small mr-flex mr-items-center mr-gap-2 mr-transition-all mr-duration-300 mr-mt-2 mr-py-2 mr-cursor-pointer ${
            isDragOver
              ? "mr-button--green mr-bg-opacity-80"
              : "mr-button--white hover:mr-bg-gray-50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".json,.geojson"
            onChange={handleFileInputChange}
            className="mr-absolute mr-inset-0 mr-w-full mr-h-full mr-opacity-0 mr-cursor-pointer"
            id={`geojson-upload-${props.name}`}
          />
          <SvgSymbol sym="upload-icon" viewBox="0 0 20 20" className="mr-w-5 mr-h-5" />
          <FormattedMessage {...messages.uploadGeoJSON} />
        </div>

        {/* Info Icon */}
        <div className="mr-relative tooltip-container">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(!showTooltip);
            }}
            className="mr-ml-1 mr-mt-2 mr-p-1 mr-rounded-full mr-text-gray-500 hover:mr-text-gray-700 hover:mr-bg-gray-100 mr-transition-colors"
            title="Show GeoJSON format info"
          >
            <SvgSymbol sym="info-icon" viewBox="0 0 20 20" className="mr-w-4 mr-h-4" />
          </button>

          {/* Custom Tooltip */}
          {showTooltip && (
            <div
              style={{ width: "300px" }}
              className="mr-absolute mr-z-50 mr-text-white mr-text-sm"
            >
              <pre className="mr-text-gray-300">
                <FormattedMessage {...messages.geoJSONFormatInfo} />
              </pre>
            </div>
          )}
        </div>

        {formData.length > 0 && (
          <span className="mr-text-green-lighter mr-text-sm mr-font-medium">
            <FormattedMessage {...messages.polygonsDefined} values={{ count: formData.length }} />
          </span>
        )}
      </div>

      {/* Upload Feedback */}
      {uploadFeedback && (
        <div
          className={`mr-mb-4 mr-p-2 mr-rounded mr-text-sm ${
            uploadFeedback.type === "success"
              ? "mr-bg-green-lighter mr-bg-opacity-20 mr-text-green-darker mr-border mr-border-green-lighter"
              : "mr-bg-red-lighter mr-bg-opacity-20 mr-text-red-darker mr-border mr-border-red-lighter"
          }`}
        >
          {uploadFeedback.type === "success" ? (
            <FormattedMessage
              {...uploadFeedback.message}
              values={{ count: uploadFeedback.count }}
            />
          ) : (
            <div>
              <FormattedMessage
                {...uploadFeedback.message}
                values={{ error: uploadFeedback.details }}
              />
              {uploadFeedback.details && (
                <div className="mr-text-xs mr-mt-1 mr-opacity-75">{uploadFeedback.details}</div>
              )}
            </div>
          )}
        </div>
      )}

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
