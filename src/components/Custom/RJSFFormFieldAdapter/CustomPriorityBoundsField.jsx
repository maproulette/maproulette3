import { useState, useEffect } from "react";
import { AttributionControl, MapContainer, ScaleControl, TileLayer, useMap } from "react-leaflet";
import SvgSymbol from "../../SvgSymbol/SvgSymbol";
import "leaflet/dist/leaflet.css";
import "leaflet-lasso";
import { PriorityBoundsContext } from "./context/PriorityBoundsContext";
import BoundsSelector from "./components/BoundsSelector";
import { DisplayExternalPolygons } from "./components/DisplayExternalPolygons";
import { FormattedMessage } from "react-intl";
import messages from "./Messages";
const BOUNDS_CHANGED_EVENT = "priorityBoundsChanged";
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

/**
 * Custom field for selecting priority bounds on a map
 */
const CustomPriorityBoundsField = (props) => {
  const [localData, setLocalData] = useState(props.formData || []);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  const [viewState, setViewState] = useState({ center: [0, 0], zoom: 2 });

  let priorityType = "";
  if (props.name) {
    if (props.name.includes("highPriorityBounds")) {
      priorityType = "high";
    } else if (props.name.includes("mediumPriorityBounds")) {
      priorityType = "medium";
    } else if (props.name.includes("lowPriorityBounds")) {
      priorityType = "low";
    }
  }

  useEffect(() => {
    const propsDataStr = JSON.stringify(props.formData);
    const localDataStr = JSON.stringify(localData);

    if (propsDataStr !== localDataStr) {
      setLocalData(props.formData || []);
      setRenderKey((prev) => prev + 1);

      if (Array.isArray(props.formData) && props.formData.length > 0) {
        setIsMapVisible(true);
      }
    }
  }, [props.formData]);

  useEffect(() => {
    const handleBoundsChanged = () => {
      setRenderKey((prev) => prev + 1);
    };

    window.addEventListener(BOUNDS_CHANGED_EVENT, handleBoundsChanged);

    return () => {
      window.removeEventListener(BOUNDS_CHANGED_EVENT, handleBoundsChanged);
    };
  }, []);

  const handleChange = (newData) => {
    setLocalData(newData || []);

    if (
      JSON.stringify(newData) !== JSON.stringify(props.formData) &&
      typeof props.onChange === "function"
    ) {
      props.onChange(Array.isArray(newData) ? [...newData] : newData);

      window.dispatchEvent(new Event(BOUNDS_CHANGED_EVENT));
    }
  };

  const handleViewChange = (newViewState) => {
    setViewState(newViewState);
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

        {Array.isArray(localData) && localData.length > 0 && (
          <div className="mr-bg-blue-firefly-75 mr-px-4 mr-py-2 mr-rounded-lg mr-flex mr-items-center mr-gap-2 mr-shadow-sm">
            <SvgSymbol
              sym="map-pin-icon"
              viewBox="0 0 20 20"
              className="mr-w-5 mr-h-5 mr-text-green-lighter"
            />
            <span className="mr-text-green-lighter mr-text-sm mr-font-medium">
              <FormattedMessage
                {...messages.polygonsDefined}
                values={{ count: localData.length }}
              />
            </span>
          </div>
        )}
      </div>

      {isMapVisible && (
        <div className="mr-relative mr-rounded-lg mr-overflow-hidden mr-shadow-lg mr-border mr-border-black-10 mr-transition-all mr-duration-300">
          <PriorityBoundsContext.Provider
            value={{
              currentPriority: priorityType,
            }}
          >
            <MapContainer
              key={`map-${priorityType}`}
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
              <MapViewPreserver onViewChange={handleViewChange} />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <AttributionControl position="bottomleft" prefix={false} />
              <ScaleControl className="mr-z-10" position="bottomleft" />

              <BoundsSelector
                value={localData}
                onChange={handleChange}
                priorityType={priorityType}
              />
              <DisplayExternalPolygons
                priorityType={priorityType}
                key={`external-polygons-${priorityType}-${renderKey}`}
              />
            </MapContainer>
          </PriorityBoundsContext.Provider>
        </div>
      )}
    </div>
  );
};

export default CustomPriorityBoundsField;
