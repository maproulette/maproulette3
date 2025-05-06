import classNames from "classnames";
import { DomEvent } from "leaflet";
import _compact from "lodash/compact";
import _isEmpty from "lodash/isEmpty";
import _map from "lodash/map";
import _sortBy from "lodash/sortBy";
import { useEffect, useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";
import {
  AttributionControl,
  LayerGroup,
  MapContainer,
  Rectangle,
  Polygon,
  ScaleControl,
  useMap,
} from "react-leaflet";
import { toLatLngBounds } from "../../services/MapBounds/MapBounds";
import { TaskPriorityColors } from "../../services/Task/TaskPriority/TaskPriority";
import { DEFAULT_OVERLAY_ORDER, buildLayerSources } from "../../services/VisibleLayer/LayerSources";
import BusySpinner from "../BusySpinner/BusySpinner";
import SearchContent from "../EnhancedMap/SearchControl/SearchContent";
import SourcedTileLayer from "../EnhancedMap/SourcedTileLayer/SourcedTileLayer";
import WithIntersectingOverlays from "../HOCs/WithIntersectingOverlays/WithIntersectingOverlays";
import WithVisibleLayer from "../HOCs/WithVisibleLayer/WithVisibleLayer";
import { LegendToggleControl } from "./LegendToggleControl";
import MapControlsDrawer from "./MapControlsDrawer";
import MapMarkers from "./MapMarkers";
import messages from "./Messages";
import ZoomInMessage from "./ZoomInMessage";
import "./TaskClusterMap.scss";

const VisibleTileLayer = WithVisibleLayer(SourcedTileLayer);

export const MAX_ZOOM = 18;
export const MIN_ZOOM = 2;

/**
 * An uncluster option will be offered if no more than number of tasks
 * will be shown.
 */
export const UNCLUSTER_THRESHOLD = 1000; // max number of tasks

/**
 * The number of clusters to show.
 */
export const CLUSTER_POINTS = 25;

/**
 * The size of cluster marker icons in pixels
 */
export const CLUSTER_ICON_PIXELS = 40;

/**
 * TaskClusterMap allows a user to browse tasks and task clusters
 * geographically, optionally calling back when map bounds are modified
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export const TaskClusterMap = (props) => {
  const [currentBounds, setCurrentBounds] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentZoom, setCurrentZoom] = useState();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [showPriorityBounds, setShowPriorityBounds] = useState(true);

  // Ensure priority bounds is in visible overlays
  useEffect(() => {
    if (showPriorityBounds && props.addVisibleOverlay) {
      props.addVisibleOverlay("priority-bounds");
    }
  }, [showPriorityBounds, props.addVisibleOverlay]);

  // Function to toggle priority bounds layer
  const togglePriorityBounds = () => {
    setShowPriorityBounds(!showPriorityBounds);

    // Also add/remove from visible overlays as needed
    if (!showPriorityBounds) {
      props.addVisibleOverlay && props.addVisibleOverlay("priority-bounds");
    } else {
      props.removeVisibleOverlay && props.removeVisibleOverlay("priority-bounds");
    }
  };

  const priorityBoundsCount = useMemo(() => {
    if (!props.challenge) return 0;

    let count = 0;
    count += props.challenge.highPriorityBounds?.length || 0;
    count += props.challenge.mediumPriorityBounds?.length || 0;
    count += props.challenge.lowPriorityBounds?.length || 0;

    return count;
  }, [props.challenge]);

  // Function to prepare priority bounds from challenge data
  const priorityBounds = useMemo(() => {
    // Add default test bounds if challenge has no bounds data
    const bounds = [];

    // Helper function to process bounds for a priority level
    const processBounds = (boundsData, priorityLevel) => {
      // Safely check if bounds data exists
      if (!boundsData || !Array.isArray(boundsData)) {
        return;
      }

      boundsData.forEach((boundFeature) => {
        // Check if we have a polygon with coordinates
        if (
          boundFeature.geometry?.type === "Polygon" &&
          Array.isArray(boundFeature.geometry.coordinates) &&
          boundFeature.geometry.coordinates.length > 0
        ) {
          // Extract the polygon coordinates (outer ring)
          const coords = boundFeature.geometry.coordinates[0];
          if (!coords || !Array.isArray(coords) || coords.length < 3) return;

          // Store the polygon coordinates as an array of [lat, lng] pairs for Leaflet
          const polygonCoords = coords.map((coord) => [coord[1], coord[0]]);

          // Add to bounds collection with priority level and polygon coordinates
          bounds.push({
            coordinates: polygonCoords,
            priorityLevel,
          });
        }
      });
    };

    // Process bounds for each priority level
    if (props.challenge) {
      processBounds(props.challenge.highPriorityBounds, 0);
      processBounds(props.challenge.mediumPriorityBounds, 1);
      processBounds(props.challenge.lowPriorityBounds, 2);
    }
    return bounds;
  }, [props.challenge]);

  let overlayLayers = buildLayerSources(
    props.visibleOverlays,
    props.user?.settings?.customBasemaps,
    (layerId, index, layerSource) => ({
      id: layerId,
      component: <SourcedTileLayer key={layerId} source={layerSource} />,
    }),
  );

  let overlayOrder = props.getUserAppSetting(props.user, "mapOverlayOrder") || [];
  if (_isEmpty(overlayOrder)) {
    overlayOrder = DEFAULT_OVERLAY_ORDER;
  }

  // Sort the overlays according to the user's preferences. We then reverse
  // that order because the layer rendered on the map last will be on top
  if (overlayOrder && overlayOrder.length > 0) {
    overlayLayers = _sortBy(overlayLayers, (layer) => {
      const position = overlayOrder.indexOf(layer.id);
      return position === -1 ? Number.MAX_SAFE_INTEGER : position;
    }).reverse();
  }

  const selectTasksInLayers = (layers) => {
    if (props.onBulkTaskSelection && typeof props.onBulkTaskSelection === "function") {
      const taskIds = _compact(
        _map(layers, (layer) => layer?.options?.icon?.options?.taskData?.taskId),
      );
      const overlappingIds = _compact(_map(layers, (layer) => layer?.options?.taskId));
      const allIds = taskIds.concat(overlappingIds);
      props.onBulkTaskSelection(allIds);
    }
  };

  const deselectTasksInLayers = (layers) => {
    if (props.onBulkTaskDeselection && typeof props.onBulkTaskDeselection === "function") {
      const taskIds = _compact(
        _map(layers, (layer) => layer?.options?.icon?.options?.taskData?.taskId),
      );
      const overlappingIds = _compact(_map(layers, (layer) => layer?.options?.taskId));
      const allIds = taskIds.concat(overlappingIds);
      props.onBulkTaskDeselection(allIds);
    }
  };

  const selectClustersInLayers = (layers) => {
    if (props.onBulkClusterSelection) {
      const clusters = _compact(_map(layers, (layer) => clusterDataFromLayer(layer)));
      props.onBulkClusterSelection(clusters);
    }
  };

  const deselectClustersInLayers = (layers) => {
    if (props.onBulkClusterDeselection) {
      const clusters = _compact(_map(layers, (layer) => clusterDataFromLayer(layer)));
      props.onBulkClusterDeselection(clusters);
    }
  };

  const clusterDataFromLayer = (layer) => {
    let clusterData = layer?.options?.icon?.options?.clusterData;
    if (!clusterData) {
      // Single-task markers will use `taskData` instead of `clusterData`, but
      // have fields compatible with clusterData
      clusterData = layer?.options?.icon?.options?.taskData;
      if (!clusterData) {
        return;
      }

      // True tasks (versus clusters representing 1 task) won't have a
      // numberOfPoints field set, so add that for compatibility and mark that
      // it's actually a task
      if (!clusterData.numberOfPoints) {
        clusterData.numberOfPoints = 1;
        clusterData.isTask = true;
      }
    }

    return clusterData;
  };

  const ResizeMap = () => {
    const map = useMap();
    useEffect(() => {
      map.invalidateSize();
    }, [props.widgetLayout?.w, props.widgetLayout?.h, map]);
    return null;
  };

  // Component to handle removing focus from map elements
  const RemoveFocusHandler = () => {
    const map = useMap();
    useEffect(() => {
      // Add event listener to clear focus on map click
      const clearFocus = () => {
        if (document.activeElement) {
          document.activeElement.blur();
        }
      };

      map.getContainer().addEventListener("click", clearFocus);
      map.getContainer().addEventListener("mousedown", clearFocus);

      return () => {
        map.getContainer().removeEventListener("click", clearFocus);
        map.getContainer().removeEventListener("mousedown", clearFocus);
      };
    }, [map]);

    return null;
  };

  const handleToggleDrawer = (isOpen) => {
    setDrawerOpen(isOpen);
  };

  const selectAllTasksInView = (taskIds) => {
    if (props.onBulkTaskSelection && typeof props.onBulkTaskSelection === "function") {
      props.onBulkTaskSelection(taskIds);
    } else {
      console.warn("onBulkTaskSelection is not a function");
    }
  };

  const selectAllClustersInView = (clusters) => {
    if (props.onBulkClusterSelection && typeof props.onBulkClusterSelection === "function") {
      props.onBulkClusterSelection(clusters);
    } else {
      console.warn("onBulkClusterSelection is not a function");
    }
  };

  return (
    <div className="taskcluster-map-container">
      <MapContainer
        attributionControl={false}
        center={props.center}
        minZoom={2}
        maxZoom={18}
        maxBounds={[
          [-90, -180],
          [90, 180],
        ]}
        bounds={
          props.initialBounds || [
            [-70, -120],
            [80, 120],
          ]
        }
        className={classNames(
          "taskcluster-map",
          { "full-screen-map": props.isMobile },
          { "drawer-open": drawerOpen },
          props.className,
        )}
        zoomControl={false}
      >
        <RemoveFocusHandler />
        <MapControlsDrawer
          isOpen={drawerOpen}
          openSearch={() => setSearchOpen(true)}
          handleToggleDrawer={handleToggleDrawer}
          deselectTasksInLayers={deselectTasksInLayers}
          selectTasksInLayers={selectTasksInLayers}
          selectClustersInLayers={selectClustersInLayers}
          deselectClustersInLayers={deselectClustersInLayers}
          onLassoClear={props.resetSelectedClusters || props.resetSelectedTasks}
          onLassoSelection={props.showAsClusters ? selectClustersInLayers : selectTasksInLayers}
          onLassoDeselection={
            props.showAsClusters ? deselectClustersInLayers : deselectTasksInLayers
          }
          onSelectAllInView={
            props.showAsClusters
              ? selectAllClustersInView
              : selectAllTasksInView || props.onBulkTaskSelection
          }
          onBulkClusterSelection={props.onBulkClusterSelection}
          priorityBounds={priorityBounds}
          showPriorityBounds={showPriorityBounds}
          togglePriorityBounds={togglePriorityBounds}
          priorityBoundsCount={priorityBoundsCount}
          {...props}
        />
        <ResizeMap />

        {/* Direct priority bounds rendering */}
        {showPriorityBounds &&
          priorityBounds
            .slice() // Create a copy to avoid mutating the original array
            .sort((a, b) => b.priorityLevel - a.priorityLevel) // Sort by descending priority level (so highest number/lowest priority is last)
            .map((boundsItem, index) => {
              if (!boundsItem.coordinates || boundsItem.coordinates.length < 3) {
                return null;
              }
              try {
                // Get priority label
                const priorityLabel =
                  boundsItem.priorityLevel === 0
                    ? "High Priority"
                    : boundsItem.priorityLevel === 1
                    ? "Medium Priority"
                    : "Low Priority";

                // Get task count (if available)
                let taskCount = null;
                if (boundsItem.priorityLevel === 0 && props.challenge?.highPriorityCount) {
                  taskCount = props.challenge.highPriorityCount;
                } else if (boundsItem.priorityLevel === 1 && props.challenge?.mediumPriorityCount) {
                  taskCount = props.challenge.mediumPriorityCount;
                } else if (boundsItem.priorityLevel === 2 && props.challenge?.lowPriorityCount) {
                  taskCount = props.challenge.lowPriorityCount;
                }

                // Construct tooltip text
                const tooltipText =
                  taskCount !== null ? `${priorityLabel} (${taskCount} tasks)` : priorityLabel;

                return (
                  <Polygon
                    key={`direct-priority-${index}`}
                    title={`Priority ${boundsItem.priorityLevel}`}
                    positions={boundsItem.coordinates}
                    pathOptions={{
                      color: TaskPriorityColors[boundsItem.priorityLevel] || "#ff0000",
                      weight: 0.5,
                      fillOpacity: 0.2,
                      className: "priority-polygon",
                    }}
                  />
                );
              } catch (error) {
                console.error("Error rendering direct priority polygon:", error);
                return null;
              }
            })}

        <AttributionControl position="bottomleft" prefix={false} />
        {(Boolean(props.loading) || Boolean(props.loadingChallenge)) && (
          <BusySpinner mapMode xlarge />
        )}
        {props.totalTaskCount &&
          props.totalTaskCount <= UNCLUSTER_THRESHOLD &&
          !searchOpen &&
          !props.loading &&
          !props.createTaskBundle && (
            <label
              htmlFor="show-clusters-input"
              className="mr-absolute mr-z-10 mr-top-0 mr-left-0 mr-mt-2 mr-ml-2 mr-shadow mr-rounded-sm mr-bg-black-50 mr-px-2 mr-py-1 mr-text-white mr-text-xs mr-flex mr-items-center"
            >
              <input
                id="show-clusters-input"
                type="checkbox"
                className="mr-mr-2"
                checked={props.showAsClusters}
                onChange={() => {
                  // Clear any existing selections when switching between tasks and clusters
                  props.toggleShowAsClusters();
                  props.resetSelectedClusters && props.resetSelectedClusters();
                }}
              />
              <FormattedMessage {...messages.clusterTasksLabel} />
            </label>
          )}
        {!props.externalOverlay && !searchOpen && !!props.mapZoomedOut && (
          <ZoomInMessage {...props} zoom={currentZoom} />
        )}
        {props.delayMapLoad && !searchOpen && !window.env.REACT_APP_DISABLE_TASK_CLUSTERS && (
          <div
            className="mr-absolute mr-top-0 mr-mt-3 mr-w-full mr-flex mr-justify-center"
            onClick={() => props.forceMapLoad()}
          >
            <div className="mr-z-5 mr-flex-col mr-items-center mr-bg-blue-dark-50 mr-text-white mr-rounded">
              <div className="mr-py-2 mr-px-3 mr-text-center mr-cursor-pointer">
                <FormattedMessage {...messages.moveMapToRefresh} />
              </div>
            </div>
          </div>
        )}
        {window.env.REACT_APP_DISABLE_TASK_CLUSTERS &&
          props.onClickFetchClusters &&
          !props.mapZoomedOut && (
            <div
              className="mr-absolute mr-bottom-0 mr-mb-3 mr-w-full mr-flex mr-justify-center"
              onClick={() => {
                props.onClickFetchClusters();
              }}
            >
              <div className="mr-z-5 mr-flex-col mr-items-center mr-bg-blue-dark-50 mr-text-white mr-rounded">
                <div className="mr-py-2 mr-px-3 mr-text-center mr-cursor-pointer">
                  <FormattedMessage {...messages.refreshTasks} />
                </div>
              </div>
            </div>
          )}
        {!props.mapZoomedOut && (
          <div className="mr-absolute mr-top-0 mr-mt-3 mr-z-5 mr-w-full mr-flex mr-justify-center mr-pointer-events-none">
            <div className="mr-flex-col mr-items-center mr-bg-black-40 mr-text-white mr-rounded">
              <div className="mr-py-2 mr-px-3 mr-text-center">
                <FormattedMessage
                  {...messages.taskCountLabel}
                  values={{ count: props.totalTaskCount }}
                />
              </div>
            </div>
          </div>
        )}

        <ScaleControl className="mr-z-10" position="bottomleft" />
        <VisibleTileLayer {...props} zIndex={1} />
        {!searchOpen && props.externalOverlay}
        {searchOpen && (
          <SearchContent
            {...props}
            onResultSelected={(bounds) => {
              setCurrentBounds(toLatLngBounds(bounds));
              props.updateBounds(bounds);
            }}
            closeSearch={() => setSearchOpen(false)}
          />
        )}
        <MapMarkers
          {...props}
          allowSpidering
          currentBounds={currentBounds}
          setCurrentBounds={setCurrentBounds}
          currentZoom={currentZoom}
          setCurrentZoom={setCurrentZoom}
        />
        <LegendToggleControl />
      </MapContainer>
    </div>
  );
};

export default (searchName) => WithIntersectingOverlays(TaskClusterMap, searchName);
