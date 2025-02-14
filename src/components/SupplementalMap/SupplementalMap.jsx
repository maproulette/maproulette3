import _isEmpty from "lodash/isEmpty";
import _isObject from "lodash/isObject";
import _map from "lodash/map";
import _sortBy from "lodash/sortBy";
import _uniqueId from "lodash/uniqueId";
import { useEffect } from "react";
import { Pane, useMap } from "react-leaflet";
import {
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
} from "../../services/Challenge/ChallengeZoom/ChallengeZoom";
import { DEFAULT_OVERLAY_ORDER, buildLayerSources } from "../../services/VisibleLayer/LayerSources";
import BusySpinner from "../BusySpinner/BusySpinner";
import LayerToggle from "../EnhancedMap/LayerToggle/LayerToggle";
import SourcedTileLayer from "../EnhancedMap/SourcedTileLayer/SourcedTileLayer";
import WithMapContainer from "../HOCs/WithMapContainer/WithMapContainer";
import WithIntersectingOverlays from "../HOCs/WithIntersectingOverlays/WithIntersectingOverlays";
import WithTaskCenterPoint from "../HOCs/WithTaskCenterPoint/WithTaskCenterPoint";
import WithVisibleLayer from "../HOCs/WithVisibleLayer/WithVisibleLayer";

const SupplementalMapContent = (props) => {
  const map = useMap();
  const { task, user, trackedBounds, trackedZoom, h, w } = props;

  // Follow the tracked map, if provided
  useEffect(() => {
    if (map && trackedBounds) {
      if (trackedBounds.isValid()) {
        map.setView(trackedBounds.getCenter(), trackedZoom);
      }
    }
  }, [trackedBounds, trackedZoom]);

  // Inform Leaflet if our map size changes
  useEffect(() => {
    if (map) {
      map.invalidateSize();
    }
  }, [h, w]);

  if (!task || !_isObject(task.parent)) {
    return <BusySpinner />;
  }

  const renderId = _uniqueId();
  let overlayOrder = props.getUserAppSetting(user, "mapOverlayOrder");
  if (_isEmpty(overlayOrder)) {
    overlayOrder = DEFAULT_OVERLAY_ORDER;
  }

  let overlayLayers = buildLayerSources(
    props.visibleOverlays,
    user?.settings?.customBasemaps,
    (layerId, index, layerSource) => ({
      id: layerId,
      component: <SourcedTileLayer key={layerId} source={layerSource} mrLayerId={layerId} />,
    }),
  );

  // Sort the overlays according to the user's preferences. We then reverse
  // that order because the layer rendered on the map last will be on top
  if (overlayOrder && overlayOrder.length > 0) {
    overlayLayers = _sortBy(overlayLayers, (layer) => {
      const position = overlayOrder.indexOf(layer.id);
      return position === -1 ? Number.MAX_SAFE_INTEGER : position;
    }).reverse();
  }

  return (
    <>
      <LayerToggle {...props} overlayOrder={overlayOrder} />
      <SourcedTileLayer maxZoom={props.maxZoom} {...props} />
      {_map(overlayLayers, (layer, index) => (
        <Pane
          key={`pane-${renderId}-${index}`}
          name={`pane-${renderId}-${index}`}
          style={{ zIndex: 10 + index }}
          className="custom-pane"
        >
          {layer.component}
        </Pane>
      ))}
    </>
  );
};

const SupplementalMap = (props) => {
  const zoom = props.task?.parent?.defaultZoom ?? DEFAULT_ZOOM;
  const minZoom = props.task?.parent?.minZoom ?? MIN_ZOOM;
  const maxZoom = props.task?.parent?.maxZoom ?? MAX_ZOOM;

  return (
    <div className="task-map">
      <SupplementalMapContent {...props} />
    </div>
  );
};

// Compose the HOCs, with WithMapContainer as the outermost wrapper
export default WithTaskCenterPoint(
  WithVisibleLayer(WithIntersectingOverlays(WithMapContainer(SupplementalMap))),
);
