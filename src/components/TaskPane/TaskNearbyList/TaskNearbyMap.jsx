import L from "leaflet";
import PropTypes from "prop-types";
import { Component, useEffect, useRef } from "react";
import { FormattedMessage, injectIntl } from "react-intl";
import "leaflet-vectoricon";
import MarkerClusterGroup from "@changey/react-leaflet-markercluster/src/react-leaflet-markercluster";
import _cloneDeep from "lodash/cloneDeep";
import _map from "lodash/map";
import { AttributionControl, MapContainer, Marker, Tooltip, useMap } from "react-leaflet";
import resolveConfig from "tailwindcss/resolveConfig";
import AsMappableTask from "../../../interactions/Task/AsMappableTask";
import { messagesByPriority } from "../../../services/Task/TaskPriority/TaskPriority";
import { TaskStatusColors, messagesByStatus } from "../../../services/Task/TaskStatus/TaskStatus";
import { buildLayerSources } from "../../../services/VisibleLayer/LayerSources";
import tailwindConfig from "../../../tailwind.config.js";
import BusySpinner from "../../BusySpinner/BusySpinner";
import SourcedTileLayer from "../../EnhancedMap/SourcedTileLayer/SourcedTileLayer";
import WithIntersectingOverlays from "../../HOCs/WithIntersectingOverlays/WithIntersectingOverlays";
import WithTaskMarkers from "../../HOCs/WithTaskMarkers/WithTaskMarkers";
import WithVisibleLayer from "../../HOCs/WithVisibleLayer/WithVisibleLayer";
import messages from "./Messages";
import MapControlsDrawer from "../../TaskClusterMap/MapControlsDrawer.jsx";

const colors = resolveConfig(tailwindConfig).theme.colors;

// Setup child components with necessary HOCs
const VisibleTileLayer = WithVisibleLayer(SourcedTileLayer);

const starIconSvg = L.vectorIcon({
  className: "star-marker-icon",
  viewBox: "0 0 20 20",
  svgHeight: 30,
  svgWidth: 30,
  type: "path",
  shape: {
    d: "M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z",
  },
  style: {
    fill: colors["blue-leaflet"],
    stroke: colors["grey-leaflet"],
    strokeWidth: 0.5,
  },
});

const markerIconSvg = (priority, styleOptions = {}) => {
  const prioritizedWidth = 40 - priority * 10;
  const prioritizedHeight = 45 - priority * 10;
  return L.vectorIcon({
    viewBox: "0 0 20 20",
    svgWidth: prioritizedWidth,
    svgHeight: prioritizedHeight,
    type: "path",
    shape: {
      // zondicons "location" icon
      d: "M10 20S3 10.87 3 7a7 7 0 1 1 14 0c0 3.87-7 13-7 13zm0-11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
    },
    style: Object.assign(
      {
        fill: colors["blue-leaflet"],
        stroke: colors["grey-leaflet"],
        strokeWidth: 0.5,
        marginTop: "0px",
        marginLeft: "0px",
      },
      styleOptions,
    ),
    iconSize: [prioritizedWidth, prioritizedHeight],
    iconAnchor: [prioritizedWidth / 2, prioritizedHeight], // tip of marker
  });
};

const MapBounds = ({ taskMarkers, setMapBounds, loadByNearbyTasks, setLoadByNearbyTasks }) => {
  const map = useMap();
  const prevMarkersLength = useRef(taskMarkers?.length || 0);
  const initialBoundsSet = useRef(false);

  // Only track map bounds changes
  useEffect(() => {
    const handleMoveEnd = () => {
      const bounds = map.getBounds();
      setMapBounds(bounds);
    };

    map.on("moveend", handleMoveEnd);

    // Set initial bounds tracking
    if (!initialBoundsSet.current) {
      handleMoveEnd();
      initialBoundsSet.current = true;
    }

    return () => {
      map.off("moveend", handleMoveEnd);
    };
  }, [map, setMapBounds]);

  // Separate effect for handling bounds fitting
  useEffect(() => {
    const currentLength = taskMarkers?.length || 0;

    // Only fit bounds if explicitly loading by nearby tasks AND markers count changed
    if (loadByNearbyTasks && currentLength > 0 && taskMarkers !== prevMarkersLength.current) {
      const bounds = L.latLngBounds(taskMarkers.map((marker) => marker.position));
      map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: 18,
      });
      prevMarkersLength.current = currentLength;
      setLoadByNearbyTasks(false);
    }
  }, [map, taskMarkers, loadByNearbyTasks]);

  return null;
};

/**
 * TaskNearbyMap allows the user to select a task that is geographically nearby
 * a current task. Nearby tasks are clustered when needed
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class TaskNearbyMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMapControlsDrawer: true,
      showTaskFeatures: true,
    };
  }

  /**
   * Invoked when an individual task marker is clicked by the user
   */
  markerClicked = (marker) => {
    if (this.props.requestedNextTask === marker.options.taskId) {
      this.props.clearNextTask();
    } else if (this.props.onTaskClick) {
      this.props.onTaskClick(
        marker.options.challengeId,
        marker.options.isVirtualChallenge,
        marker.options.taskId,
      );
    }
  };

  /**
   * Invoked when user clicks the map instead of a marker
   */
  mapClicked = () => {
    if (this.props.onMapClick) {
      this.props.onMapClick();
    }
  };

  toggleTaskFeatureVisibility = () => {
    this.setState({ showTaskFeatures: !this.state.showTaskFeatures });
  };

  render() {
    if (!this.props.task) {
      return null;
    }

    const currentCenterpoint = AsMappableTask(this.props.task).calculateCenterPoint();
    const hasTaskMarkers = (this.props.taskMarkers?.length ?? 0) > 0;
    let coloredMarkers = null;
    if (hasTaskMarkers) {
      coloredMarkers = _map(this.props.taskMarkers, (marker) => {
        const isRequestedMarker = marker.options.taskId === this.props.requestedNextTask;
        const markerData = _cloneDeep(marker);
        markerData.options.title = `Task ${marker.options.taskId}`;
        const markerStyle = {
          fill: TaskStatusColors[marker.options?.status ?? 0],
          stroke: isRequestedMarker ? colors.yellow : colors["grey-leaflet"],
          strokeWidth: isRequestedMarker ? 2 : 0.5,
        };

        return (
          <Marker
            key={marker.options.taskId}
            {...markerData}
            icon={markerIconSvg(marker.options?.priority ?? 0, markerStyle)}
            zIndexOffset={isRequestedMarker ? 1000 : undefined}
            eventHandlers={{
              click: () => {
                this.markerClicked(markerData);
              },
            }}
          >
            <Tooltip>
              <div>
                <FormattedMessage {...messages.priorityLabel} />{" "}
                {this.props.intl.formatMessage(messagesByPriority[marker.options?.priority ?? 0])}
              </div>
              <div>
                <FormattedMessage {...messages.statusLabel} />{" "}
                {this.props.intl.formatMessage(messagesByStatus[marker.options?.status ?? 0])}
              </div>
            </Tooltip>
          </Marker>
        );
      });
    }

    const overlayLayers = buildLayerSources(
      this.props.visibleOverlays,
      this.props.user?.settings?.customBasemaps,
      (layerId, index, layerSource) => (
        <SourcedTileLayer key={layerId} source={layerSource} zIndex={index + 2} />
      ),
    );

    const ResizeMap = () => {
      const map = useMap();
      useEffect(() => {
        map.invalidateSize();
      }, [map]);
      return null;
    };

    if (!coloredMarkers) {
      return (
        <div className="mr-h-full">
          <FormattedMessage {...messages.noTasksAvailableLabel} />
        </div>
      );
    }

    return (
      <div className="mr-h-full">
        <MapContainer
          center={currentCenterpoint}
          zoom={12}
          zoomControl={false}
          animate
          worldCopyJump
          intl={this.props.intl}
          attributionControl={false}
          minZoom={2}
          maxZoom={18}
          maxBounds={[
            [-90, -180],
            [90, 180],
          ]}
        >
          <MapControlsDrawer
            isOpen={this.state.showMapControlsDrawer}
            handleToggleDrawer={(isOpen) => this.setState({ showMapControlsDrawer: isOpen })}
            showSearchControl={false}
            centerPoint={currentCenterpoint}
            centerBounds={this.props.task.boundingBox}
            taskCenter={currentCenterpoint}
            fitBoundsControl
            showFitWorld
            {...this.props}
          />
          <MapBounds
            taskMarkers={this.props.taskMarkers}
            setMapBounds={this.props.setMapBounds}
            loadByNearbyTasks={this.props.loadByNearbyTasks}
            setLoadByNearbyTasks={this.props.setLoadByNearbyTasks}
          />
          <ResizeMap />
          <AttributionControl position="bottomleft" prefix={false} />

          <VisibleTileLayer {...this.props} zIndex={1} />
          {overlayLayers}
          <Marker
            position={currentCenterpoint}
            icon={starIconSvg}
            title={this.props.intl.formatMessage(messages.currentTaskTooltip)}
            eventHandlers={{
              click: () => {
                this.props.clearNextTask();
              },
            }}
          />
          {coloredMarkers.length > 0 && (
            <MarkerClusterGroup key={Date.now()} maxClusterRadius={5}>
              {coloredMarkers}
            </MarkerClusterGroup>
          )}

          {hasTaskMarkers && (
            <div className="mr-absolute mr-top-0 mr-mt-3 mr-z-5 mr-w-full mr-flex mr-justify-center mr-pointer-events-none">
              <div className="mr-flex-col mr-items-center mr-bg-black-40 mr-text-white mr-rounded">
                <div className="mr-py-2 mr-px-3 mr-text-center">
                  <FormattedMessage
                    {...messages.taskCountLabel}
                    values={{ count: this.props.taskMarkers.length }}
                  />
                </div>
              </div>
            </div>
          )}
        </MapContainer>

        <div className="mr-absolute mr-bottom-0 mr-mb-8 mr-w-full mr-text-center">
          <button
            className="mr-button mr-button--small mr-button--blue-fill"
            onClick={() => this.props.updateNearbyTasks()}
          >
            <FormattedMessage {...messages.loadMoreTasks} />
          </button>
          <button
            className="mr-button mr-button--small mr-button--blue-fill mr-ml-2"
            onClick={() => this.props.loadTasksInView()}
          >
            <FormattedMessage {...messages.loadTasksInView} />
          </button>
        </div>

        {!!this.props.tasksLoading && <BusySpinner mapMode big />}
      </div>
    );
  }
}

TaskNearbyMap.propTypes = {
  /** Primary task for which nearby task markers are shown */
  task: PropTypes.object,
  /** markers (from WithTaskMarkers) for nearby tasks to display */
  taskMarkers: PropTypes.array.isRequired,
  /** Set to true if tasks are still loading */
  tasksLoading: PropTypes.bool,
  /** Invoked when the user clicks on an individual task marker */
  onTaskClick: PropTypes.func,
  /** Invoked when the user clicks on the map instead of a maker */
  onMapClick: PropTypes.func,
  setMapBounds: PropTypes.func,
  mapBounds: PropTypes.object,
  updateNearbyTasks: PropTypes.func,
  loadTasksInView: PropTypes.func,
  clearNextTask: PropTypes.func,
  requestedNextTask: PropTypes.number,
  loadByNearbyTasks: PropTypes.bool,
  setLoadByNearbyTasks: PropTypes.func,
  user: PropTypes.object,
  visibleOverlays: PropTypes.array,
};

export default WithTaskMarkers(
  WithVisibleLayer(WithIntersectingOverlays(injectIntl(TaskNearbyMap), "taskNearby")),
  "nearbyTasks",
);
