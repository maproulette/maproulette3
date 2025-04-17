import React, { useState, useEffect } from "react";
import { useMap } from "react-leaflet";
import SvgSymbol from "../SvgSymbol/SvgSymbol";
import "leaflet-lasso/dist/leaflet-lasso.esm";
import L from "leaflet";
import _compact from "lodash/compact";
import _map from "lodash/map";
import LayerToggle from "../EnhancedMap/LayerToggle/LayerToggle";

export const CLUSTER_POINTS = 25;
export const UNCLUSTER_THRESHOLD = 1000;

/**
 * MapControlsDrawer renders a drawer on the right side of the map
 * containing all map controls.
 */
const MapControlsDrawer = (props) => {
  const map = useMap();
  const [deselecting, setDeselecting] = useState(false);
  const [selecting, setSelecting] = useState(false);

  // Handle zoom in
  const handleZoomIn = () => {
    map.zoomIn();
  };

  // Handle zoom out
  const handleZoomOut = () => {
    map.zoomOut();
  };

  // Handle fit world
  const handleFitWorld = () => {
    map.setView([0, 0], 2);
  };

  // Handle fit bounds
  const handleFitBounds = () => {
    if (props.centerBounds) {
      map.fitBounds(props.centerBounds.pad(0.5));
    } else if (props.taskCenter) {
      map.panTo(props.taskCenter);
    }
  };

  // Handle search
  const handleSearch = () => {
    if (props.openSearch) {
      props.openSearch();
    }
  };

  // Handle select all in view
  const handleSelectAllInViewClick = () => {
    if (!map || !map._layers) return;
    const taskIds = _compact(
      _map(map._layers, (layer) => layer?.options?.icon?.options?.taskData?.taskId),
    );
    if (!taskIds.length) return;
    if (props.onSelectAllInView) {
      props.onSelectAllInView(taskIds);
    }
  };

  // Handle lasso selection
  const handleLassoSelection = () => {
    setDeselecting(false);
    setSelecting(true);
    if (map) {
      const lassoInstance = L.lasso(map, {});
      lassoInstance.enable();

      // Set up lasso finished event handler
      const handleLassoFinished = (event) => {
        if (props.showAsClusters && props.onBulkClusterSelection) {
          props.selectClustersInLayers(event.layers);
        } else if (props.onBulkTaskSelection) {
          props.selectTasksInLayers(event.layers);
        }
        setSelecting(false);
      };

      map.on("lasso.finished", handleLassoFinished);
      props.onLassoInteraction && props.onLassoInteraction();
    }
  };

  // Handle lasso deselection
  const handleLassoDeselection = () => {
    setDeselecting(true);
    setSelecting(false);

    if (map) {
      const lassoInstance = L.lasso(map, {});
      lassoInstance.enable();

      // Set up lasso finished event handler
      const handleLassoFinished = (event) => {
        if (props.showAsClusters && props.onBulkClusterDeselection) {
          props.deselectClustersInLayers(event.layers);
        } else if (props.onBulkTaskDeselection) {
          props.deselectTasksInLayers(event.layers);
        }
        setDeselecting(false);
      };

      map.on("lasso.finished", handleLassoFinished);
      props.onLassoInteraction && props.onLassoInteraction();
    }
  };

  // Determine if cluster lasso controls should be shown
  const shouldShowClusterLassoControls =
    props.showClusterLasso && props.onBulkClusterSelection && !props.mapZoomedOut;

  // Determine if task lasso controls should be shown
  const shouldShowTaskLassoControls =
    props.showLasso &&
    props.onBulkTaskSelection &&
    (!props.showAsClusters || (!props.showClusterLasso && props.totalTaskCount <= CLUSTER_POINTS));

  // Determine if select all in view should be shown
  const shouldShowSelectAllInView =
    typeof props.onSelectAllInView === "function" && !props.mapZoomedOut;

  // Initialize lasso when map is ready
  useEffect(() => {
    if (map && (shouldShowTaskLassoControls || shouldShowClusterLassoControls)) {
      const lassoInstance = L.lasso(map, {});

      // Clean up when component unmounts
      return () => {
        map.off("lasso.finished");
        if (lassoInstance && lassoInstance.disable) {
          lassoInstance.disable();
        }
      };
    }
  }, [map, shouldShowTaskLassoControls, shouldShowClusterLassoControls]);

  return (
    <>
      {/* Main Controls Drawer - Remains on the right */}
      <div
        className={`map-controls-drawer ${props.isOpen ? "open" : ""}`}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        {/* Toggle button with improved accessibility */}
        <button
          className="map-drawer-toggle"
          onClick={() => props.handleToggleDrawer(!props.isOpen)}
          aria-label={props.isOpen ? "Close controls drawer" : "Open controls drawer"}
          title={props.isOpen ? "Close controls" : "Open controls"}
        >
          <div className="mr-text-black">{props.isOpen ? "▶" : "◀"}</div>
        </button>

        {/* Drawer content */}
        <div className="map-drawer-content" onDoubleClick={(e) => e.stopPropagation()}>
          <div className="drawer-controls-container" onDoubleClick={(e) => e.stopPropagation()}>
            {/* Map Navigation Controls */}
            <div className="control-group">
              {/* Layer Toggle Control */}
              <div className="control-item">
                <LayerToggle {...props} />
              </div>
              {/* Zoom Controls */}
              <div className="control-item">
                <button
                  className="drawer-control-button zoom-button"
                  onClick={handleZoomIn}
                  title="Zoom In"
                  aria-label="Zoom In"
                >
                  <SvgSymbol sym="plus-icon" viewBox="0 0 20 20" className="control-icon" />
                </button>
              </div>
              <div className="control-item">
                <button
                  className="drawer-control-button zoom-button"
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  aria-label="Zoom Out"
                >
                  <SvgSymbol sym="minus-icon" viewBox="0 0 20 20" className="control-icon" />
                </button>
              </div>

              {props.fitBoundsControl && (
                <div className="control-item">
                  <button
                    className="drawer-control-button"
                    onClick={handleFitBounds}
                    title="Fit to Features"
                    aria-label="Fit to Features"
                  >
                    <SvgSymbol sym="target-icon" viewBox="0 0 20 20" className="control-icon" />
                  </button>
                </div>
              )}
              {props.showFitWorld && (
                <div className="control-item">
                  <button
                    className="drawer-control-button"
                    onClick={handleFitWorld}
                    title="Fit World"
                    aria-label="Fit World"
                  >
                    <SvgSymbol sym="globe-icon" viewBox="0 0 20 20" className="control-icon" />
                  </button>
                </div>
              )}
            </div>

            {/* Search Control */}
            {props.showSearchControl && (
              <div className="control-group">
                <div className="control-item">
                  <button
                    className="drawer-control-button"
                    onClick={handleSearch}
                    title="Search"
                    aria-label="Search"
                  >
                    <SvgSymbol sym="search-icon" viewBox="0 0 20 20" className="control-icon" />
                  </button>
                </div>
              </div>
            )}

            {/* Lasso Selection Controls */}
            {(shouldShowTaskLassoControls || shouldShowClusterLassoControls) && (
              <div className="control-group lasso-controls">
                {shouldShowSelectAllInView && (
                  <div className="control-item">
                    <button
                      className="drawer-control-button"
                      onClick={handleSelectAllInViewClick}
                      title="Select All In View"
                      aria-label="Select All In View"
                    >
                      <SvgSymbol
                        sym="check-circled-icon"
                        className="control-icon"
                        viewBox="0 0 512 512"
                      />
                    </button>
                  </div>
                )}

                {/* Lasso Selection Button */}
                {(shouldShowTaskLassoControls || shouldShowClusterLassoControls) && (
                  <div className="control-item">
                    <button
                      onClick={handleLassoSelection}
                      className={`drawer-control-button ${selecting ? "active" : ""}`}
                      title="Lasso Select"
                      aria-label="Lasso Select"
                    >
                      <SvgSymbol
                        sym="lasso-add-icon"
                        className="control-icon"
                        viewBox="0 0 512 512"
                      />
                    </button>
                  </div>
                )}

                {/* Lasso Deselection Button */}
                {(shouldShowTaskLassoControls || shouldShowClusterLassoControls) && (
                  <div className="control-item">
                    <button
                      onClick={handleLassoDeselection}
                      className={`drawer-control-button ${deselecting ? "active" : ""}`}
                      title="Lasso Deselect"
                      aria-label="Lasso Deselect"
                    >
                      <SvgSymbol
                        sym="lasso-remove-icon"
                        className="control-icon"
                        viewBox="0 0 512 512"
                      />
                    </button>
                  </div>
                )}

                {/* Clear Selection Button */}
                {props.onLassoClear &&
                  (shouldShowTaskLassoControls || shouldShowClusterLassoControls) && (
                    <div className="control-item">
                      <button
                        onClick={() => {
                          props.onLassoClear();
                          props.onLassoInteraction && props.onLassoInteraction();
                        }}
                        className="drawer-control-button"
                        title="Clear Selection"
                        aria-label="Clear Selection"
                      >
                        <SvgSymbol sym="cross-icon" className="control-icon" viewBox="0 0 20 20" />
                      </button>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .map-controls-drawer {
          position: absolute;
          top: 0px;
          right: 0px;
          z-index: 1000;
          background: rgba(0, 0, 0, 0.5);
          padding: 5px;
          transition: transform 0.3s ease-in-out;
        }

        /* Add styles for lasso icons */
        .lasso-icon-container {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .lasso-plus,
        .lasso-minus {
          position: absolute;
          bottom: -2px;
          right: -2px;
          font-size: 16px;
          font-weight: bold;
          color: currentColor;
          background-color: rgba(0, 0, 0, 0.5);
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
      `}</style>
    </>
  );
};

export default MapControlsDrawer;
