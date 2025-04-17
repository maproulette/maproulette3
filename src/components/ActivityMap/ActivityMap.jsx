import centroid from "@turf/centroid";
import { getCoord } from "@turf/invariant";
import { differenceInHours, parseISO } from "date-fns";
import { latLng } from "leaflet";
import _isString from "lodash/isString";
import _map from "lodash/map";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { FormattedMessage, injectIntl } from "react-intl";
import { AttributionControl, CircleMarker, MapContainer, Popup, useMap } from "react-leaflet";
import { GLOBAL_MAPBOUNDS, toLatLngBounds } from "../../services/MapBounds/MapBounds";
import { TaskStatusColors } from "../../services/Task/TaskStatus/TaskStatus";
import { buildLayerSources } from "../../services/VisibleLayer/LayerSources";
import ActivityDescription from "../ActivityListing/ActivityDescription";
import SourcedTileLayer from "../EnhancedMap/SourcedTileLayer/SourcedTileLayer";
import WithVisibleLayer from "../HOCs/WithVisibleLayer/WithVisibleLayer";
import MapControlsDrawer from "../TaskClusterMap/MapControlsDrawer";
import messages from "./Messages";

// Setup child components with necessary HOCs
const VisibleTileLayer = WithVisibleLayer(SourcedTileLayer);

const ResizeMap = () => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
};

/**
 * ActivityMap displays MapRoulette task activity on a map
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const ActivityMap = (props) => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const hasTaskMarkers = (props.activity?.length ?? 0) > 0;
  let coloredMarkers = null;

  const handleToggleDrawer = (isOpen) => {
    setDrawerOpen(isOpen);
  };

  if (hasTaskMarkers) {
    coloredMarkers = _map(props.activity, (entry) => {
      if (!entry?.task?.location) {
        return null;
      }

      const geojson = _isString(entry.task.location)
        ? JSON.parse(entry.task.location)
        : entry.task.location;
      const center = getCoord(centroid(geojson));
      const hoursOld = differenceInHours(Date.now(), parseISO(entry.created));

      return (
        <CircleMarker
          key={entry.id}
          center={[center[1], center[0]]}
          radius={8}
          fill={true}
          fillColor={TaskStatusColors[entry.status]}
          fillOpacity={Math.max(0.2, 0.8 - 0.1 * hoursOld) /* fade with age */}
          stroke={false}
          options={{ title: `Task ${entry.task.id}` }}
        >
          <Popup offset={[0.5, -5]}>
            <div className="mr-p-4 mr-pt-6 mr-lightmode">
              <ActivityDescription {...props} entry={entry} simplified />
            </div>
          </Popup>
        </CircleMarker>
      );
    });
  }

  const overlayLayers = buildLayerSources(
    props.visibleOverlays,
    props.user?.settings?.customBasemaps,
    (layerId, index, layerSource) => (
      <SourcedTileLayer key={layerId} source={layerSource} zIndex={index + 2} />
    ),
  );

  if (!coloredMarkers) {
    return (
      <div className="mr-h-full">
        <FormattedMessage {...messages.noTasksAvailableLabel} />
      </div>
    );
  }

  return (
    <div className="mr-w-full mr-h-full">
      <MapContainer
        center={latLng(5, 0)}
        zoom={2}
        attributionControl={false}
        minZoom={1}
        maxZoom={18}
        maxBounds={[
          [-90, -180],
          [90, 180],
        ]}
        setInitialBounds={false}
        zoomControl={false}
        animate={true}
        worldCopyJump={true}
        justFitFeatures
        noAttributionPrefix={props.noAttributionPrefix}
        intl={props.intl}
      >
        <MapControlsDrawer
          isOpen={drawerOpen}
          handleToggleDrawer={handleToggleDrawer}
          showSearchControl={false}
          showFitWorld
          {...props}
        />
        <ResizeMap />
        <AttributionControl position="bottomleft" prefix={false} />
        <VisibleTileLayer {...props} zIndex={1} noWrap bounds={toLatLngBounds(GLOBAL_MAPBOUNDS)} />
        {overlayLayers}
        {coloredMarkers}
      </MapContainer>
    </div>
  );
};

ActivityMap.propTypes = {
  /** Primary task for which nearby task markers are shown */
  activity: PropTypes.array,
};

export default WithVisibleLayer(injectIntl(ActivityMap));
