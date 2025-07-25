import classNames from "classnames";
import _compact from "lodash/compact";
import _isEmpty from "lodash/isEmpty";
import _map from "lodash/map";
import _sortBy from "lodash/sortBy";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import {
  AttributionControl,
  LayerGroup,
  MapContainer,
  Rectangle,
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
import PriorityBoundsLayer from "./PriorityBoundsLayer";
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
  const { workspaceContext, setWorkspaceContext } = props;
  const [currentBounds, setCurrentBounds] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentZoom, setCurrentZoom] = useState();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [showPriorityBounds, setShowPriorityBounds] = useState(false);

  // Check if we have valid priority bounds data
  const hasPriorityBounds = () => {
    if (!props.challenge) return false;

    const { highPriorityBounds, mediumPriorityBounds, lowPriorityBounds } = props.challenge;
    return (
      (Array.isArray(highPriorityBounds) && highPriorityBounds.length > 0) ||
      (Array.isArray(mediumPriorityBounds) && mediumPriorityBounds.length > 0) ||
      (Array.isArray(lowPriorityBounds) && lowPriorityBounds.length > 0)
    );
  };

  let overlayLayers = buildLayerSources(
    props.visibleOverlays,
    props.user?.settings?.customBasemaps,
    (layerId, index, layerSource) => ({
      id: layerId,
      component: <SourcedTileLayer key={layerId} source={layerSource} />,
    }),
  );

  if (props.showPriorityBounds) {
    overlayLayers.push({
      id: "priority-bounds",
      component: (
        <LayerGroup key="priority-bounds">
          {props.priorityBounds.map((bounds, index) => (
            <Rectangle
              key={index}
              bounds={toLatLngBounds(bounds.boundingBox)}
              color={TaskPriorityColors[bounds.priorityLevel]}
            />
          ))}
        </LayerGroup>
      ),
    });
  }

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
    }, [props.widgetLayout?.w, props.widgetLayout?.h]);

    useEffect(() => {
      if (workspaceContext?.taskMapBounds && workspaceContext?.taskPropertyClicked) {
        const isTaskInBundle =
          props.taskBundle?.tasks?.some((t) => t.id === workspaceContext.taskMapTask?.id) ||
          workspaceContext.taskMapTask?.id === props.task?.id;

        if (isTaskInBundle) {
          map.setView(workspaceContext.taskMapBounds.getCenter(), workspaceContext.taskMapZoom);
          // Ensure markers are refetched after changing the map view
          if (props.updateBounds) {
            props.updateBounds(workspaceContext.taskMapBounds, workspaceContext.taskMapZoom, true);
          }
          setWorkspaceContext({
            taskPropertyClicked: false,
          });
        }
      }
    }, [workspaceContext?.taskPropertyClicked]);

    return null;
  };

  const handleToggleDrawer = (isOpen) => {
    setDrawerOpen(isOpen);
  };

  const selectAllTasksInView = (taskIds) => {
    console.log("selectAllTasksInView called with", taskIds.length, "task IDs");
    if (props.onBulkTaskSelection && typeof props.onBulkTaskSelection === "function") {
      props.onBulkTaskSelection(taskIds);
    } else {
      console.warn("onBulkTaskSelection is not a function");
    }
  };

  const selectAllClustersInView = (clusters) => {
    console.log("selectAllClustersInView called with", clusters.length, "clusters");
    if (props.onBulkClusterSelection && typeof props.onBulkClusterSelection === "function") {
      props.onBulkClusterSelection(clusters);
    } else {
      console.warn("onBulkClusterSelection is not a function");
    }
  };

  const togglePriorityBounds = () => {
    setShowPriorityBounds((prev) => !prev);
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
        <MapControlsDrawer
          isOpen={drawerOpen}
          togglePriorityBounds={togglePriorityBounds}
          showPriorityBounds={showPriorityBounds}
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
          {...props}
        />
        <ResizeMap />
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
        {/* Priority bounds layer - only render if we have valid data and user wants to see them */}
        {showPriorityBounds && hasPriorityBounds() && (
          <PriorityBoundsLayer challenge={props.challenge} />
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
