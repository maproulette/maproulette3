import { useState, useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import SvgSymbol from "../../../SvgSymbol/SvgSymbol";
import { globalFeatureGroups, getColorForPriority } from "../context/PriorityBoundsContext";
import { polygonToGeoJSON } from "../utils/polygonUtils";
import L from "leaflet";
import "leaflet-lasso";

const BoundsSelector = ({ value, onChange, priorityType }) => {
  const map = useMap();
  const [selecting, setSelecting] = useState(false);
  const [featureGroup, setFeatureGroup] = useState(null);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const lassoInstanceRef = useRef(null);
  const polygonsAddedRef = useRef(false);

  const cleanupLasso = () => {
    if (lassoInstanceRef.current) {
      if (typeof lassoInstanceRef.current.disable === "function") {
        lassoInstanceRef.current.disable();
      }
      map.off("lasso.finished");
      lassoInstanceRef.current = null;
    }
  };

  const syncPolygonsWithParent = () => {
    if (!featureGroup?.getLayers) return;

    const layers = featureGroup.getLayers();
    const geometries = Array.from(layers).map(polygonToGeoJSON).filter(Boolean);

    onChange(geometries.length > 0 ? geometries : []);
  };

  useEffect(() => {
    if (!featureGroup?.getLayers) return;

    const layers = featureGroup.getLayers();
    const geometries = Array.from(layers).map(polygonToGeoJSON).filter(Boolean);

    const currentValue = JSON.stringify(geometries);
    const previousValue = JSON.stringify(value);

    if (currentValue !== previousValue || polygonsAddedRef.current) {
      onChange(geometries.length > 0 ? geometries : []);
      polygonsAddedRef.current = false;
    }
  }, [value]);

  useEffect(() => {
    if (featureGroup && priorityType) {
      const groupKey = `priority-${priorityType}-feature-group`;
      globalFeatureGroups[groupKey] = featureGroup;
    }
  }, [featureGroup, priorityType]);

  useEffect(() => {
    if (!map) return;

    const groupKey = `priority-${priorityType}-feature-group`;
    let fg = globalFeatureGroups[groupKey];

    if (!fg) {
      fg = L.featureGroup().addTo(map);
      globalFeatureGroups[groupKey] = fg;
    } else if (!map.hasLayer(fg)) {
      fg.addTo(map);
    }

    if (fg.setZIndex) {
      fg.setZIndex(200);
    }

    fg.clearLayers();

    setFeatureGroup(fg);

    try {
      if (value?.length > 0) {
        restorePolygons(value, fg);
      }
    } catch (error) {
      console.error("Error restoring polygons:", error);
    }

    map.on("click", () => {
      if (showModal) setShowModal(false);
      if (showClearModal) setShowClearModal(false);
    });

    return () => {
      map.off("click");
      cleanupLasso();
    };
  }, [map, value]);

  const restorePolygons = (geoJsonFeatures, fg) => {
    const leafletPolygons = convertGeoJsonToLeafletPolygons(geoJsonFeatures);

    if (leafletPolygons.length > 0) {
      leafletPolygons.forEach((polygon) => {
        const restoredPolygon = L.polygon(polygon.getLatLngs(), {
          color: getColorForPriority(priorityType, "base"),
          weight: 2,
          fillOpacity: 0.2,
        });

        restoredPolygon.priorityType = priorityType;

        restoredPolygon.on("mouseover", () => handlePolygonHover(restoredPolygon));
        restoredPolygon.on("mouseout", () => handlePolygonHoverOut(restoredPolygon));
        restoredPolygon.on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          handlePolygonClick(restoredPolygon);
        });

        if (polygon.originalCoordinates) {
          restoredPolygon.originalCoordinates = polygon.originalCoordinates;
        } else if (polygon._latlngs?.length > 0) {
          const latlngs = polygon.getLatLngs()[0];
          restoredPolygon.originalCoordinates = latlngs.map((latlng) => [latlng.lat, latlng.lng]);
        }

        fg.addLayer(restoredPolygon);
      });
    }
  };

  const convertGeoJsonToLeafletPolygons = (geoJsonFeatures) => {
    if (!geoJsonFeatures?.length) return [];

    return geoJsonFeatures
      .map((feature) => {
        try {
          const latlngs = feature.geometry.coordinates[0].map((coord) => [coord[1], coord[0]]);

          const polygon = L.polygon(latlngs, {
            color: getColorForPriority(priorityType, "base"),
            weight: 2,
            fillOpacity: 0.3,
          });

          polygon.originalCoordinates = latlngs;
          return polygon;
        } catch (error) {
          console.error("Error converting feature:", error);
          return null;
        }
      })
      .filter(Boolean);
  };

  const handlePolygonClick = (polygon) => {
    setSelectedPolygon(polygon);
    setShowModal(true);
  };

  const handlePolygonHover = (polygon) => {
    if (!selecting) {
      if (polygon.priorityType === priorityType) {
        polygon.setStyle({ color: "#ff0000", weight: 3, fillOpacity: 0.3 });
      } else {
        polygon.setStyle({ color: "#ff9900", weight: 2, fillOpacity: 0.2 });
      }
    }
  };

  const handlePolygonHoverOut = (polygon) => {
    if (!selecting) {
      if (polygon.priorityType === priorityType) {
        polygon.setStyle({
          color: getColorForPriority(priorityType, "base"),
          weight: 2,
          fillOpacity: 0.3,
        });
      } else {
        polygon.setStyle({
          color: getColorForPriority(polygon.priorityType, "inactive"),
          weight: 1,
          fillOpacity: 0.15,
        });
      }
    }
  };

  const handleRemovePolygon = () => {
    if (selectedPolygon && featureGroup) {
      featureGroup.removeLayer(selectedPolygon);
      setShowModal(false);
      setSelectedPolygon(null);

      syncPolygonsWithParent();
    }
  };

  const showClearAllConfirmation = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowClearModal(true);
  };

  const clearAllPolygons = () => {
    if (featureGroup) {
      featureGroup.clearLayers();
      setShowClearModal(false);

      syncPolygonsWithParent();
    }
  };

  const handleLassoSelection = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (selecting) {
      cleanupLasso();
      setSelecting(false);
      return;
    }

    cleanupLasso();
    setSelecting(true);

    try {
      const handleLassoFinished = (e) => {
        if (e.latLngs?.length >= 3) {
          const polygon = L.polygon(e.latLngs, {
            color: getColorForPriority(priorityType, "base"),
            weight: 2,
            fillOpacity: 0.3,
          });

          polygon.priorityType = priorityType;

          polygon.on("mouseover", () => handlePolygonHover(polygon));
          polygon.on("mouseout", () => handlePolygonHoverOut(polygon));
          polygon.on("click", (evt) => {
            L.DomEvent.stopPropagation(evt);
            handlePolygonClick(polygon);
          });

          featureGroup.addLayer(polygon);

          polygonsAddedRef.current = true;

          syncPolygonsWithParent();
        }

        cleanupLasso();
        setSelecting(false);
      };

      map.on("lasso.finished", handleLassoFinished);

      if (typeof L.Lasso === "function") {
        const lasso = new L.Lasso(map, {
          polygon: {
            color: getColorForPriority(priorityType, "hover"),
            weight: 2,
          },
          finishOn: "mouseup",
          intersect: false,
        });

        lassoInstanceRef.current = lasso;
        lasso.enable();
      } else {
        console.warn("L.Lasso not found");
        cleanupLasso();
        setSelecting(false);
      }
    } catch (error) {
      console.error("Error initializing lasso:", error);
      cleanupLasso();
      setSelecting(false);
    }
  };

  useEffect(() => {
    return () => cleanupLasso();
  }, [map]);

  return (
    <>
      <div
        className="mr-absolute mr-top-2 mr-right-2 mr-z-[1000] mr-bg-black-50 mr-backdrop-blur-sm mr-rounded-lg mr-p-2 mr-shadow-lg"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className="mr-flex mr-flex-col mr-gap-2">
          <button
            onClick={handleLassoSelection}
            className={`mr-p-2 mr-rounded-lg mr-bg-white hover:mr-bg-green-lighter mr-transition-colors mr-duration-200 mr-shadow-md ${
              selecting ? "mr-bg-green-lighter" : ""
            }`}
            title={selecting ? "Cancel Lasso" : "Lasso Select"}
          >
            <SvgSymbol
              sym="lasso-add-icon"
              viewBox="0 0 512 512"
              className={`mr-w-6 mr-h-6 ${selecting ? "mr-text-green" : "mr-text-green"}`}
            />
          </button>

          {featureGroup && featureGroup.getLayers().length > 0 && (
            <button
              onClick={showClearAllConfirmation}
              className="mr-p-2 mr-rounded-lg mr-bg-white hover:mr-bg-red-light mr-transition-colors mr-duration-200 mr-relative mr-shadow-md"
              title="Clear All Polygons"
            >
              <SvgSymbol
                sym="trash-icon"
                viewBox="0 0 20 20"
                className="mr-w-6 mr-h-6 mr-text-red"
              />
              <span className="mr-absolute mr-top-[-8px] mr-right-[-8px] mr-bg-red mr-text-white mr-rounded-full mr-w-5 mr-h-5 mr-flex mr-items-center mr-justify-center mr-text-xs mr-font-bold mr-shadow-md">
                {featureGroup.getLayers().length}
              </span>
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <div
          className="mr-fixed mr-inset-0 mr-bg-black-50 mr-backdrop-blur-sm mr-z-[2000] mr-flex mr-items-center mr-justify-center"
          onClick={() => setShowModal(false)}
        >
          <div
            className="mr-bg-white mr-rounded-lg mr-p-6 mr-shadow-lg mr-max-w-sm mr-w-full mr-mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mr-text-lg mr-font-medium mr-mb-4 mr-text-blue-firefly">
              Polygon Options
            </h3>
            <div className="mr-flex mr-justify-end mr-gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="mr-button mr-button--small mr-button--white mr-px-6"
              >
                Cancel
              </button>
              <button
                onClick={handleRemovePolygon}
                className="mr-button mr-button--small mr-button--danger mr-flex mr-items-center mr-gap-2"
              >
                <SvgSymbol sym="trash-icon" viewBox="0 0 20 20" className="mr-w-4 mr-h-4" />
                Remove Polygon
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearModal && (
        <div
          className="mr-fixed mr-inset-0 mr-bg-black-50 mr-backdrop-blur-sm mr-z-[2000] mr-flex mr-items-center mr-justify-center"
          onClick={() => setShowClearModal(false)}
        >
          <div
            className="mr-bg-white mr-rounded-lg mr-p-6 mr-shadow-lg mr-max-w-sm mr-w-full mr-mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mr-text-lg mr-font-medium mr-mb-4 mr-text-blue-firefly">
              Clear All Polygons
            </h3>
            <p className="mr-mb-4 mr-text-black-75">
              Are you sure you want to remove all {featureGroup.getLayers().length} polygon
              {featureGroup.getLayers().length !== 1 ? "s" : ""}?
            </p>
            <div className="mr-flex mr-justify-end mr-gap-2">
              <button
                onClick={() => setShowClearModal(false)}
                className="mr-button mr-button--small mr-button--white mr-px-6"
              >
                Cancel
              </button>
              <button
                onClick={clearAllPolygons}
                className="mr-button mr-button--small mr-button--danger mr-flex mr-items-center mr-gap-2"
              >
                <SvgSymbol sym="trash-icon" viewBox="0 0 20 20" className="mr-w-4 mr-h-4" />
                Remove All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BoundsSelector;
