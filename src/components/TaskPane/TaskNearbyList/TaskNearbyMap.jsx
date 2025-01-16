import L from "leaflet";
import PropTypes from "prop-types";
import { Component, useEffect } from "react";
import { FormattedMessage, injectIntl } from "react-intl";
import "leaflet-vectoricon";
import MarkerClusterGroup from "@changey/react-leaflet-markercluster/src/react-leaflet-markercluster";
import _cloneDeep from "lodash/cloneDeep";
import _map from "lodash/map";
import {
  AttributionControl,
  MapContainer,
  Marker,
  Tooltip,
  ZoomControl,
  useMap,
} from "react-leaflet";
import resolveConfig from "tailwindcss/resolveConfig";
import AsMappableTask from "../../../interactions/Task/AsMappableTask";
import { messagesByPriority } from "../../../services/Task/TaskPriority/TaskPriority";
import { TaskStatusColors, messagesByStatus } from "../../../services/Task/TaskStatus/TaskStatus";
import { buildLayerSources } from "../../../services/VisibleLayer/LayerSources";
import tailwindConfig from "../../../tailwind.config.js";
import BusySpinner from "../../BusySpinner/BusySpinner";
import LayerToggle from "../../EnhancedMap/LayerToggle/LayerToggle";
import SourcedTileLayer from "../../EnhancedMap/SourcedTileLayer/SourcedTileLayer";
import WithIntersectingOverlays from "../../HOCs/WithIntersectingOverlays/WithIntersectingOverlays";
import WithTaskMarkers from "../../HOCs/WithTaskMarkers/WithTaskMarkers";
import WithVisibleLayer from "../../HOCs/WithVisibleLayer/WithVisibleLayer";
import messages from "./Messages";

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

/**
 * TaskNearbyMap allows the user to select a task that is geographically nearby
 * a current task. Nearby tasks are clustered when needed
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class TaskNearbyMap extends Component {
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
        <LayerToggle {...this.props} />
        <MapContainer
          center={currentCenterpoint}
          zoom={12}
          zoomControl={false}
          animate={true}
          worldCopyJump={true}
          intl={this.props.intl}
          attributionControl={false}
          minZoom={2}
          maxZoom={18}
          maxBounds={[
            [-90, -180],
            [90, 180],
          ]}
        >
          <ResizeMap />
          <AttributionControl position="bottomleft" prefix={false} />
          <ZoomControl position="topright" />
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
        </MapContainer>
        {this.props.hasMoreToLoad && (
          <div className="mr-absolute mr-bottom-0 mr-mb-8 mr-w-full mr-text-center">
            <button
              className="mr-button mr-button--small mr-button--blue-fill"
              onClick={() => this.props.increaseTaskLimit()}
            >
              <FormattedMessage {...messages.loadMoreTasks} />
            </button>
          </div>
        )}

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
};

export default WithTaskMarkers(
  WithVisibleLayer(WithIntersectingOverlays(injectIntl(TaskNearbyMap), "taskNearby")),
  "nearbyTasks",
);
