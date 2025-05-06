import L from "leaflet";
import React, { useState, useEffect } from "react";
import { AttributionControl, MapContainer, ScaleControl, TileLayer, useMap } from "react-leaflet";
import SvgSymbol from "../../SvgSymbol/SvgSymbol";
import "leaflet/dist/leaflet.css";
import "leaflet-lasso";

const BoundsSelector = ({ value, onChange }) => {
  const map = useMap();
  const [selecting, setSelecting] = useState(false);
  const [featureGroup, setFeatureGroup] = useState(null);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  // Use a ref instead of state to prevent cleanup on updates
  const lassoInstanceRef = React.useRef(null);
  const [selectedPolygons, setSelectedPolygons] = useState([]);

  // Ensure changes are reflected in form data after any polygons are added/removed
  useEffect(() => {
    if (featureGroup && featureGroup.getLayers().length > 0) {
      const geometries = Array.from(featureGroup.getLayers()).map(polygonToGeoJSON).filter(Boolean);

      if (geometries.length > 0) {
        onChange(geometries);
      }
    }
  }, [selectedPolygons]);

  // Initialize feature group and restore polygons
  useEffect(() => {
    if (map) {
      const fg = L.featureGroup().addTo(map);
      setFeatureGroup(fg);

      // Clear any existing polygons from state
      setSelectedPolygons([]);

      try {
        // Restore existing polygons from form value
        if (value && Array.isArray(value) && value.length > 0) {
          const leafletPolygons = convertGeoJsonToLeafletPolygons(value);

          if (leafletPolygons.length > 0) {
            setSelectedPolygons(leafletPolygons);

            // Add restored polygons to the feature group
            leafletPolygons.forEach((polygon, index) => {
              try {
                // Create a new polygon instance to add to the map
                const restoredPolygon = L.polygon(polygon.getLatLngs(), {
                  color: "#3388ff",
                  weight: 2,
                  fillOpacity: 0.2,
                });

                // Add event listeners for hover effects
                restoredPolygon.on("mouseover", () => handlePolygonHover(restoredPolygon));
                restoredPolygon.on("mouseout", () => handlePolygonHoverOut(restoredPolygon));
                restoredPolygon.on("click", (e) => {
                  // Stop propagation to prevent map click
                  L.DomEvent.stopPropagation(e);
                  handlePolygonClick(restoredPolygon);
                });

                // Store original geometry data for accurate conversion later
                if (polygon.originalCoordinates) {
                  restoredPolygon.originalCoordinates = polygon.originalCoordinates;
                } else if (polygon._latlngs && polygon._latlngs.length > 0) {
                  // If we don't have stored original coordinates, save them now
                  const latlngs = polygon.getLatLngs()[0];
                  restoredPolygon.originalCoordinates = latlngs.map((latlng) => [
                    latlng.lat,
                    latlng.lng,
                  ]);
                }

                fg.addLayer(restoredPolygon);
              } catch (err) {
                console.error(`Error restoring polygon ${index}:`, err);
              }
            });

            // Fit map to bounds of all polygons
            try {
              const bounds = fg.getBounds();
              if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50] });
              }
            } catch (e) {
              console.error("Error fitting bounds:", e);
            }
          }
        }
      } catch (error) {
        console.error("Error in polygon restoration:", error);
      }

      // Add a click event to the map that will close any open modals
      map.on("click", () => {
        if (showModal) {
          setShowModal(false);
        }
        if (showClearModal) {
          setShowClearModal(false);
        }
      });

      return () => {
        if (map && map.hasLayer(fg)) {
          fg.remove();
        }
        map.off("click");
      };
    }
  }, [map]); // Only run when map changes, not when value changes

  // Convert GeoJSON to Leaflet polygons
  const convertGeoJsonToLeafletPolygons = (geoJsonFeatures) => {
    if (!geoJsonFeatures || !Array.isArray(geoJsonFeatures) || geoJsonFeatures.length === 0) {
      return [];
    }

    const result = geoJsonFeatures
      .map((feature, index) => {
        try {
          // Convert coordinates from [lng, lat] to [lat, lng] for Leaflet
          const latlngs = feature.geometry.coordinates[0].map((coord) => {
            return [coord[1], coord[0]];
          });

          const polygon = L.polygon(latlngs, {
            color: "#3388ff",
            weight: 2,
            fillOpacity: 0.2,
          });

          // Store the original coordinates for accurate conversion later
          polygon.originalCoordinates = latlngs;

          return polygon;
        } catch (error) {
          console.error(`Error converting feature ${index}:`, error);
          return null;
        }
      })
      .filter(Boolean);

    return result;
  };

  // Handle polygon click
  const handlePolygonClick = (polygon) => {
    setSelectedPolygon(polygon);
    setShowModal(true);
  };

  // Handle polygon hover
  const handlePolygonHover = (polygon) => {
    if (!selecting) {
      polygon.setStyle({ color: "red", weight: 3 });
    }
  };

  // Handle polygon hover out
  const handlePolygonHoverOut = (polygon) => {
    if (!selecting) {
      polygon.setStyle({ color: "#3388ff", weight: 2 });
    }
  };

  // Handle polygon removal
  const handleRemovePolygon = () => {
    if (selectedPolygon && featureGroup) {
      featureGroup.removeLayer(selectedPolygon);

      // Update the polygons list
      setSelectedPolygons((prev) => {
        // Filter out the selected polygon from the previous state
        const filteredPolygons = prev.filter((polygon) => polygon !== selectedPolygon);

        // Also get all layers from feature group to ensure consistency
        const allPolygons = Array.from(featureGroup.getLayers());

        // Update form data
        const geometries = allPolygons.map(polygonToGeoJSON).filter(Boolean);
        onChange(geometries);

        return filteredPolygons;
      });

      setShowModal(false);
      setSelectedPolygon(null);
    }
  };

  // Convert Leaflet polygon to GeoJSON
  const polygonToGeoJSON = (polygon) => {
    try {
      // Get the coordinates from the polygon
      let latlngs;

      // First, try to get the original coordinates if they were stored
      if (polygon.originalCoordinates) {
        latlngs = polygon.originalCoordinates;
      } else {
        // Otherwise get from Leaflet polygon
        latlngs = polygon.getLatLngs()[0];
      }

      if (!latlngs || latlngs.length < 3) {
        return null;
      }

      // Convert to GeoJSON format - [lng, lat]
      const coordinates = latlngs.map((latlng) => {
        // Handle both array form [lat, lng] and Leaflet object form {lat, lng}
        if (Array.isArray(latlng)) {
          // Already in [lat, lng] form, convert to [lng, lat]
          return [latlng[1], latlng[0]];
        } else {
          // Leaflet object form, convert to [lng, lat]
          return [latlng.lng, latlng.lat];
        }
      });

      // Make sure the polygon is closed (first and last points match)
      if (coordinates.length > 0 && !isPolygonClosed(coordinates)) {
        coordinates.push([...coordinates[0]]);
      }

      // Create a valid GeoJSON feature
      const feature = {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [coordinates],
        },
        properties: {},
      };

      return feature;
    } catch (error) {
      console.error("Error converting polygon to GeoJSON:", error);
      return null;
    }
  };

  // Helper to check if polygon is closed
  const isPolygonClosed = (coordinates) => {
    if (coordinates.length < 2) return false;
    const first = coordinates[0];
    const last = coordinates[coordinates.length - 1];
    return first[0] === last[0] && first[1] === last[1];
  };

  // Handle lasso selection
  const handleLassoSelection = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (selecting) {
      // If already in lasso mode, cancel it
      if (lassoInstanceRef.current && lassoInstanceRef.current.disable) {
        lassoInstanceRef.current.disable();
        lassoInstanceRef.current = null;
      }
      setSelecting(false);
      return;
    }

    // Clear any existing lasso instances first
    if (lassoInstanceRef.current && lassoInstanceRef.current.disable) {
      lassoInstanceRef.current.disable();
      lassoInstanceRef.current = null;
    }

    setSelecting(true);

    try {
      // Define the handler function for when lasso selection is completed
      const handleLassoFinished = (e) => {
        if (e.latLngs && e.latLngs.length >= 3) {
          // Create a polygon from the lasso points
          const polygon = L.polygon(e.latLngs, {
            color: "#3388ff",
            weight: 2,
            fillOpacity: 0.2,
          });

          // Store original coordinates for accurate conversion
          polygon.originalCoordinates = e.latLngs.map((latlng) => [latlng.lat, latlng.lng]);

          // Add event handlers
          polygon.on("mouseover", () => handlePolygonHover(polygon));
          polygon.on("mouseout", () => handlePolygonHoverOut(polygon));
          polygon.on("click", (evt) => {
            L.DomEvent.stopPropagation(evt);
            handlePolygonClick(polygon);
          });

          // Add the polygon to the feature group
          featureGroup.addLayer(polygon);

          // Update selectedPolygons state
          setSelectedPolygons((prev) => {
            const updatedPolygons = [...prev, polygon];

            // Convert to GeoJSON
            const geometries = Array.from(featureGroup.getLayers())
              .map(polygonToGeoJSON)
              .filter(Boolean);

            if (typeof onChange === "function") {
              onChange(geometries);
            }

            return updatedPolygons;
          });
        }

        // Reset state
        setSelecting(false);
      };

      // Add the event handler to the map BEFORE creating the lasso
      map.on("lasso.finished", handleLassoFinished);

      // Try several different approaches to create the lasso
      let handler;

      try {
        handler = new L.Lasso(map, {
          polygon: {
            color: "#ff3300",
            weight: 2,
          },
        });
      } catch (e) {
        try {
          handler = L.lasso(map, {
            polygon: {
              color: "#ff3300",
              weight: 2,
            },
          });
        } catch (e) {
          try {
            // If the above approaches don't work, create the bare minimum lasso
            // Using the instantiation pattern seen in the source code
            // This is a fallback approach
            handler = {
              enable: function () {
                // Set up the actual lasso drawing
                const drawLasso = (e) => {
                  // Disable map dragging
                  map.dragging.disable();

                  let points = [e.latlng];
                  let polyline = L.polyline(points, {
                    color: "#ff3300",
                    weight: 2,
                  }).addTo(map);

                  const moveHandler = (e) => {
                    points.push(e.latlng);
                    polyline.setLatLngs(points);
                  };

                  const endHandler = (e) => {
                    map.dragging.enable();
                    map.off("mousemove", moveHandler);
                    map.off("mouseup", endHandler);

                    if (polyline) {
                      map.removeLayer(polyline);
                    }

                    if (points.length >= 3) {
                      // Make sure the polygon is closed
                      if (points[0] !== points[points.length - 1]) {
                        points.push(points[0]);
                      }

                      // Fire the lasso.finished event
                      map.fire("lasso.finished", {
                        latLngs: points,
                        layers: [],
                      });
                    }
                  };

                  map.on("mousemove", moveHandler);
                  map.on("mouseup", endHandler);
                };

                map.on("mousedown", drawLasso);
                this.drawLasso = drawLasso;
              },
              disable: function () {
                if (this.drawLasso) {
                  map.off("mousedown", this.drawLasso);
                  this.drawLasso = null;
                }
              },
            };
          } catch (e) {
            throw new Error("Could not initialize lasso with any method");
          }
        }
      }

      // Store the handler in the ref
      lassoInstanceRef.current = handler;

      // Enable the handler
      handler.enable();

      // Add test function for debugging
      window._testLassoEvent = () => {
        const testLatLngs = [
          L.latLng(20, 20),
          L.latLng(20, 30),
          L.latLng(30, 30),
          L.latLng(30, 20),
          L.latLng(20, 20), // Close the polygon
        ];

        // Manually trigger the event
        map.fire("lasso.finished", { latLngs: testLatLngs, layers: [] });
      };

      // Add cleanup to stop lasso and remove event when done
      const originalDisable = handler.disable;
      handler.disable = function () {
        map.off("lasso.finished", handleLassoFinished);
        originalDisable.call(this);
      };
    } catch (error) {
      console.error("Error initializing lasso:", error);
      setSelecting(false);
    }
  };

  // Clean up lasso instance on component unmount only
  useEffect(() => {
    // This effect is only for component unmount cleanup
    return () => {
      if (lassoInstanceRef.current && lassoInstanceRef.current.disable) {
        lassoInstanceRef.current.disable();
        lassoInstanceRef.current = null;
      }

      // Clean up any possible remaining lasso event handlers
      if (map) {
        map.off("lasso.finished");
        map.off("lasso.enabled");
        map.off("lasso.disabled");
        map.off("lasso.created");
      }
    };
  }, [map]);

  // Show clear all confirmation dialog
  const showClearAllConfirmation = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Show confirmation modal
    setShowClearModal(true);
  };

  // Handle clearing all polygons
  const clearAllPolygons = () => {
    if (featureGroup) {
      // Clear all layers from the feature group
      featureGroup.clearLayers();

      // Reset the selected polygons state
      setSelectedPolygons([]);

      // Update form data
      onChange([]);

      // Hide the modal
      setShowClearModal(false);
    }
  };

  return (
    <>
      <div
        className="mr-absolute mr-top-2 mr-right-2 mr-z-[1000] mr-bg-black-50 mr-rounded mr-p-2"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className="mr-flex mr-flex-col mr-gap-2">
          <button
            onClick={handleLassoSelection}
            className={`mr-p-2 mr-rounded mr-bg-white hover:mr-bg-green-lighter mr-transition-colors mr-duration-200 mr-shadow-md ${
              selecting ? "mr-bg-green-light mr-shadow-md mr-border-2 mr-border-white" : ""
            }`}
            title={selecting ? "Cancel Lasso" : "Lasso Select"}
          >
            <SvgSymbol
              sym="lasso-add-icon"
              viewBox="0 0 512 512"
              className={`mr-w-5 mr-h-5 ${selecting ? "mr-text-white" : ""}`}
            />
            {selecting && (
              <span className="mr-absolute mr-right-[110%] mr-bg-black-50 mr-px-2 mr-py-1 mr-rounded mr-text-white mr-text-xs mr-whitespace-nowrap mr-shadow-md">
                Drawing Mode
              </span>
            )}
          </button>

          {featureGroup && featureGroup.getLayers().length > 0 && (
            <button
              onClick={showClearAllConfirmation}
              className="mr-p-2 mr-rounded mr-bg-white hover:mr-bg-red-light mr-transition-colors mr-duration-200 mr-relative mr-shadow-md"
              title="Clear All Polygons"
            >
              <SvgSymbol
                sym="trash-icon"
                viewBox="0 0 20 20"
                className="mr-w-5 mr-h-5 mr-text-red"
              />
              <span className="mr-absolute mr-top-[-8px] mr-right-[-8px] mr-bg-red mr-text-white mr-rounded-full mr-w-5 mr-h-5 mr-flex mr-items-center mr-justify-center mr-text-xs mr-shadow-md">
                {featureGroup.getLayers().length}
              </span>
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <div
          className="mr-fixed mr-inset-0 mr-bg-black-50 mr-z-[2000] mr-flex mr-items-center mr-justify-center"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowModal(false);
          }}
        >
          <div
            className="mr-bg-white mr-rounded mr-p-6 mr-shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mr-text-lg mr-font-medium mr-mb-4">Polygon Options</h3>
            <div className="mr-flex mr-justify-end mr-gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="mr-button mr-button--small mr-button--white"
              >
                Cancel
              </button>
              <button
                onClick={handleRemovePolygon}
                className="mr-button mr-button--small mr-button--danger"
              >
                Remove Polygon
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearModal && (
        <div
          className="mr-fixed mr-inset-0 mr-bg-black-50 mr-z-[2000] mr-flex mr-items-center mr-justify-center"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowClearModal(false);
          }}
        >
          <div
            className="mr-bg-white mr-rounded mr-p-6 mr-shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mr-text-lg mr-font-medium mr-mb-4">Clear All Polygons</h3>
            <p className="mr-mb-4">
              Are you sure you want to remove all {featureGroup.getLayers().length} polygons?
            </p>
            <div className="mr-flex mr-justify-end mr-gap-2">
              <button
                onClick={() => setShowClearModal(false)}
                className="mr-button mr-button--small mr-button--white"
              >
                Cancel
              </button>
              <button
                onClick={clearAllPolygons}
                className="mr-button mr-button--small mr-button--danger"
              >
                Remove All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const CustomPriorityBoundsField = (props) => {
  const [localData, setLocalData] = React.useState(props.formData || []);
  // Auto-show map if there are existing polygons
  const hasExistingPolygons = Array.isArray(props.formData) && props.formData.length > 0;
  const [isMapVisible, setIsMapVisible] = React.useState(hasExistingPolygons);

  useEffect(() => {
    // Update local state if props change (prevent loops by checking difference)
    if (JSON.stringify(props.formData) !== JSON.stringify(localData)) {
      setLocalData(props.formData || []);

      // Show map if there are polygons in the updated data
      if (Array.isArray(props.formData) && props.formData.length > 0) {
        setIsMapVisible(true);
      }
    }
  }, [props.formData]);

  // Handle changes from the bounds selector
  const handleChange = (newData) => {
    // Update local state immediately to reflect changes
    setLocalData(newData || []);

    // Make sure the data has actually changed
    const hasChanged = JSON.stringify(newData) !== JSON.stringify(props.formData);

    if (hasChanged && typeof props.onChange === "function") {
      // Call the onChange prop with a fresh copy of the data
      props.onChange(Array.isArray(newData) ? [...newData] : newData);
    }
  };

  return (
    <div className="mr-relative" onClick={(e) => e.stopPropagation()}>
      <div className="mr-flex mr-items-center mr-justify-between mr-mb-2 mr-bg-black-5 mr-p-2 mr-rounded">
        <button
          onClick={() => setIsMapVisible(!isMapVisible)}
          className={`mr-button mr-flex mr-items-center mr-gap-1 ${
            isMapVisible ? "mr-button--green" : "mr-button--white"
          }`}
        >
          <SvgSymbol sym="globe-icon" viewBox="0 0 20 20" className="mr-w-5 mr-h-5" />
          <span>{isMapVisible ? "Hide Map" : "Show Map"}</span>
        </button>

        {Array.isArray(localData) && localData.length > 0 && (
          <div className="mr-bg-blue-firefly-75 mr-p-2 mr-rounded mr-flex mr-items-center mr-gap-1">
            <SvgSymbol
              sym="map-pin-icon"
              viewBox="0 0 20 20"
              className="mr-w-4 mr-h-4 mr-text-green-lighter"
            />
            <span className="mr-text-green-lighter mr-text-sm">
              {localData.length} polygon{localData.length !== 1 ? "s" : ""} defined
            </span>
          </div>
        )}
      </div>

      {isMapVisible && (
        <div className="mr-relative">
          <MapContainer
            zoom={2}
            style={{ height: "400px", width: "100%" }}
            attributionControl={false}
            minZoom={2}
            maxZoom={18}
            maxBounds={[
              [-85, -180],
              [85, 180],
            ]}
            zoomControl={false}
            onClick={(e) => e.stopPropagation()}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <AttributionControl position="bottomleft" prefix={false} />
            <ScaleControl className="mr-z-10" position="bottomleft" />

            <BoundsSelector value={localData} onChange={handleChange} />
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default CustomPriorityBoundsField;
