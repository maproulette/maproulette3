import React, { useState, useEffect } from "react";
import { useMap } from "react-leaflet";
import classNames from "classnames";
import SvgSymbol from "../SvgSymbol/SvgSymbol";
import "leaflet-lasso/dist/leaflet-lasso.esm";
import _compact from "lodash/compact";
import _map from "lodash/map";
import { TaskStatus, TaskStatusColors } from "../../services/Task/TaskStatus/TaskStatus";
import L from "leaflet";

export const CLUSTER_POINTS = 25;
export const UNCLUSTER_THRESHOLD = 1000;

/**
 * MapControlsDrawer renders a drawer on the right side of the map
 * containing all map controls.
 */
const MapControlsDrawer = (props) => {
  const map = useMap();
  const [legendOpen, setLegendOpen] = useState(false);
  const [lasso, setLasso] = useState(null);
  const [deselecting, setDeselecting] = useState(false);

  // Initialize lasso when map is available
  useEffect(() => {
    if (map) {
      const lassoInstance = L.lasso(map, {});
      setLasso(lassoInstance);

      // Set up lasso finished event handler
      const handleLassoFinished = (event) => {
        // Access the current deselecting state directly from the ref
        const currentDeselecting = deselecting;

        if (currentDeselecting) {
          if (props.showAsClusters && props.onBulkClusterDeselection) {
            props.deselectClustersInLayers(event.layers);
          } else if (props.onBulkTaskDeselection) {
            props.deselectTasksInLayers(event.layers);
          }
        } else {
          if (props.showAsClusters && props.onBulkClusterSelection) {
            props.selectClustersInLayers(event.layers);
          } else if (props.onBulkTaskSelection) {
            props.selectTasksInLayers(event.layers);
          }
        }
      };

      map.on("lasso.finished", handleLassoFinished);

      return () => {
        // Clean up event listener when component unmounts
        map.off("lasso.finished", handleLassoFinished);
        // Also clean up the lasso instance
        if (lassoInstance && lassoInstance.disable) {
          lassoInstance.disable();
        }
      };
    }
  }, [
    map,
    deselecting,
    props.deselectClustersInLayers,
    props.deselectTasksInLayers,
    props.selectClustersInLayers,
    props.selectTasksInLayers,
    props.showAsClusters,
    props.onBulkClusterDeselection,
    props.onBulkTaskDeselection,
    props.onBulkClusterSelection,
    props.onBulkTaskSelection,
  ]);

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
      map.fitBounds(props.centerBounds);
    } else if (props.taskCenter) {
      map.setView(props.taskCenter, 14);
    }
  };

  // Handle search
  const handleSearch = () => {
    if (props.openSearch) {
      props.openSearch();
    }
  };

  // Handle layer toggle
  const handleLayerToggle = () => {
    // This would typically open a layer control panel
    const layerControl = document.querySelector(".leaflet-control-layers");
    if (layerControl) {
      // Simulate a click on the layer control
      layerControl.click();
    }
  };

  // Toggle legend
  const toggleLegend = () => {
    setLegendOpen(!legendOpen);
  };

  // Handle select all in view
  const handleSelectAllInViewClick = () => {
    if (!map || !map._layers) return;
    const taskIds = _compact(
      _map(map._layers, (layer) => layer?.options?.icon?.options?.taskData?.taskId),
    );
    // Disallow use if cannot populate taskIds from map
    if (!taskIds.length) return;
    if (props.onSelectAllInView) {
      props.onSelectAllInView(taskIds);
    }
  };

  // Handle lasso selection
  const handleLassoSelection = () => {
    setDeselecting(false);
    lasso && lasso.toggle();
    props.onLassoInteraction && props.onLassoInteraction();
  };

  // Handle lasso deselection
  const handleLassoDeselection = () => {
    setDeselecting(true);
    lasso && lasso.toggle();
    props.onLassoInteraction && props.onLassoInteraction();
  };

  // Define all possible status items for the legend
  const legendItems = [
    { id: TaskStatus.created, color: TaskStatusColors[TaskStatus.created], status: "Created" },
    { id: TaskStatus.fixed, color: TaskStatusColors[TaskStatus.fixed], status: "Fixed" },
    {
      id: TaskStatus.falsePositive,
      color: TaskStatusColors[TaskStatus.falsePositive],
      status: "Not an Issue",
    },
    { id: TaskStatus.skipped, color: TaskStatusColors[TaskStatus.skipped], status: "Skipped" },
    { id: TaskStatus.deleted, color: TaskStatusColors[TaskStatus.deleted], status: "Deleted" },
    {
      id: TaskStatus.alreadyFixed,
      color: TaskStatusColors[TaskStatus.alreadyFixed],
      status: "Already Fixed",
    },
    {
      id: TaskStatus.tooHard,
      color: TaskStatusColors[TaskStatus.tooHard],
      status: "Can't Complete",
    },
    { id: TaskStatus.disabled, color: TaskStatusColors[TaskStatus.disabled], status: "Disabled" },
  ];

  // Filter legend items based on active filters if provided
  const filteredLegendItems =
    props.includeTaskStatuses && props.includeTaskStatuses.length > 0
      ? legendItems.filter((item) => props.includeTaskStatuses.includes(item.id))
      : legendItems;

  // Determine if cluster lasso controls should be shown
  const shouldShowClusterLassoControls =
    props.showClusterLasso &&
    props.onBulkClusterSelection &&
    !props.mapZoomedOut &&
    props.showAsClusters;

  // Determine if task lasso controls should be shown
  const shouldShowTaskLassoControls =
    props.showLasso &&
    props.onBulkTaskSelection &&
    (!props.showAsClusters ||
      (!props.showClusterLasso && props.totalTaskCount <= CLUSTER_POINTS)) &&
    !props.mapZoomedOut;

  return (
    <div className={classNames("map-controls-drawer", { open: props.isOpen })}>
      {/* Toggle button with improved accessibility */}
      <button
        className="map-drawer-toggle"
        onClick={() => props.handleToggleDrawer(!props.isOpen)}
        aria-label={props.isOpen ? "Close controls drawer" : "Open controls drawer"}
        title={props.isOpen ? "Close controls" : "Open controls"}
      >
        {props.isOpen ? "▶" : "◀"}
      </button>

      {/* Drawer content */}
      <div className="map-drawer-content">
        <div className="drawer-controls-container">
          {/* Map Navigation Controls */}
          <div className="control-group">
            {/* Layer Toggle Control */}
            <div className="control-item">
              <button
                className="drawer-control-button"
                onClick={handleLayerToggle}
                title="Toggle Map Layers"
                aria-label="Toggle Map Layers"
              >
                <SvgSymbol sym="layers-icon" viewBox="0 0 20 20" className="control-icon" />
              </button>
            </div>

            {/* Legend Control */}
            <div className="control-item">
              <button
                className={classNames("drawer-control-button", { active: legendOpen })}
                onClick={toggleLegend}
                title="Toggle Legend"
                aria-label="Toggle Legend"
                aria-pressed={legendOpen}
              >
                <SvgSymbol sym="info-icon" viewBox="0 0 20 20" className="control-icon" />
              </button>

              {/* Legend Panel */}
              {legendOpen && (
                <div className="legend-panel">
                  <h3 className="legend-title">Status Legend</h3>
                  <ul className="legend-list">
                    {filteredLegendItems.map((item, index) => (
                      <li key={index} className="legend-item">
                        <span
                          className="legend-color-swatch"
                          style={{ backgroundColor: item.color }}
                        ></span>
                        <span className="legend-label">{item.status}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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

            {props.showFitWorld && (
              <div className="control-item">
                <button
                  className="drawer-control-button"
                  onClick={handleFitWorld}
                  title="Fit World View"
                  aria-label="Fit World View"
                >
                  <SvgSymbol sym="globe-icon" viewBox="0 0 20 20" className="control-icon" />
                </button>
              </div>
            )}

            {props.fitbBoundsControl && (
              <div className="control-item">
                <button
                  className="drawer-control-button"
                  onClick={handleFitBounds}
                  title="Fit to Task Bounds"
                  aria-label="Fit to Task Bounds"
                >
                  <SvgSymbol sym="target-icon" viewBox="0 0 20 20" className="control-icon" />
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
              {props.onSelectAllInView && (
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
              {lasso && (
                <div className="control-item">
                  <button
                    onClick={handleLassoSelection}
                    className="drawer-control-button"
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
              {lasso && (shouldShowTaskLassoControls || shouldShowClusterLassoControls) && (
                <div className="control-item">
                  <button
                    onClick={handleLassoDeselection}
                    className="drawer-control-button"
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
              {props.onLassoClear && (
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

      {/* Add CSS for the legend panel */}
      <style jsx>{`
        .legend-panel {
          position: absolute;
          top: 100%;
          left: 0;
          z-index: 1000;
          width: 150px;
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          border-radius: 4px;
          padding: 10px;
          margin-top: 5px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
        }

        .legend-title {
          font-size: 12px;
          font-weight: bold;
          margin: 0 0 8px 0;
        }

        .legend-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .legend-item {
          display: flex;
          align-items: center;
          margin-bottom: 5px;
          font-size: 11px;
        }

        .legend-color-swatch {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 5px;
        }

        .legend-label {
          flex: 1;
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
    </div>
  );
};

export default MapControlsDrawer;
