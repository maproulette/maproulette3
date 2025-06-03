import classNames from "classnames";
import _isEmpty from "lodash/isEmpty";
import _sortBy from "lodash/sortBy";
import { useEffect, useState } from "react";
import { MapContainer } from "react-leaflet";
import { toLatLngBounds } from "../../services/MapBounds/MapBounds";
import { DEFAULT_OVERLAY_ORDER, buildLayerSources } from "../../services/VisibleLayer/LayerSources";
import WithIntersectingOverlays from "../HOCs/WithIntersectingOverlays/WithIntersectingOverlays";
import WithVisibleLayer from "../HOCs/WithVisibleLayer/WithVisibleLayer";
import SourcedTileLayer from "../EnhancedMap/SourcedTileLayer/SourcedTileLayer";
import "./TaskClusterMap.scss";

// Import components from index file
import {
  MapBaseLayers,
  MapControls,
  MapMarkerManager,
  PriorityBoundsLayer,
  SearchLayer,
  TaskCountDisplay,
  MapEventHandlers,
} from "./components";

// Constants
export const MAX_ZOOM = 18;
export const MIN_ZOOM = 2;
export const UNCLUSTER_THRESHOLD = 1000;
export const CLUSTER_POINTS = 25;
export const CLUSTER_ICON_PIXELS = 40;

const VisibleTileLayer = WithVisibleLayer(SourcedTileLayer);

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

  // Prepare overlay layers
  let overlayLayers = buildLayerSources(
    props.visibleOverlays,
    props.user?.settings?.customBasemaps,
    (layerId, index, layerSource) => ({
      id: layerId,
      component: <SourcedTileLayer key={layerId} source={layerSource} />,
    }),
  );

  // Sort overlays according to user preferences
  let overlayOrder = props.getUserAppSetting(props.user, "mapOverlayOrder") || [];
  if (_isEmpty(overlayOrder)) {
    overlayOrder = DEFAULT_OVERLAY_ORDER;
  }

  if (overlayOrder && overlayOrder.length > 0) {
    overlayLayers = _sortBy(overlayLayers, (layer) => {
      const position = overlayOrder.indexOf(layer.id);
      return position === -1 ? Number.MAX_SAFE_INTEGER : position;
    }).reverse();
  }

  const handleToggleDrawer = (isOpen) => {
    setDrawerOpen(isOpen);
  };

  return (
    <div className="taskcluster-map-container">
      <MapContainer
        attributionControl={false}
        center={props.center}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
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
        {/* Event handlers and map functionality */}
        <MapEventHandlers widgetLayout={props.widgetLayout} />

        {/* Map controls panel */}
        <MapControls
          isOpen={drawerOpen}
          openSearch={() => setSearchOpen(true)}
          handleToggleDrawer={handleToggleDrawer}
          showPriorityBounds={showPriorityBounds}
          togglePriorityBounds={togglePriorityBounds}
          challenge={props.challenge}
          showAsClusters={props.showAsClusters}
          toggleShowAsClusters={props.toggleShowAsClusters}
          resetSelectedClusters={props.resetSelectedClusters}
          resetSelectedTasks={props.resetSelectedTasks}
          onBulkTaskSelection={props.onBulkTaskSelection}
          onBulkTaskDeselection={props.onBulkTaskDeselection}
          onBulkClusterSelection={props.onBulkClusterSelection}
          onBulkClusterDeselection={props.onBulkClusterDeselection}
          {...props}
        />

        {/* Priority bounds layer */}
        {showPriorityBounds && <PriorityBoundsLayer challenge={props.challenge} />}

        {/* Base map layers */}
        <MapBaseLayers
          loading={props.loading}
          loadingChallenge={props.loadingChallenge}
          {...props}
        />

        {/* Task count display */}
        <TaskCountDisplay
          mapZoomedOut={props.mapZoomedOut}
          totalTaskCount={props.totalTaskCount}
          delayMapLoad={props.delayMapLoad}
          forceMapLoad={props.forceMapLoad}
          onClickFetchClusters={props.onClickFetchClusters}
        />

        {/* Map tile layer */}
        <VisibleTileLayer {...props} zIndex={1} />

        {/* Search or external overlay */}
        {!searchOpen && props.externalOverlay}
        {searchOpen && (
          <SearchLayer
            {...props}
            onResultSelected={(bounds) => {
              setCurrentBounds(toLatLngBounds(bounds));
              props.updateBounds(bounds);
            }}
            closeSearch={() => setSearchOpen(false)}
          />
        )}

        {/* Map markers */}
        <MapMarkerManager
          {...props}
          allowSpidering
          currentBounds={currentBounds}
          setCurrentBounds={setCurrentBounds}
          currentZoom={currentZoom}
          setCurrentZoom={setCurrentZoom}
        />
      </MapContainer>
    </div>
  );
};

export default (searchName) => WithIntersectingOverlays(TaskClusterMap, searchName);
