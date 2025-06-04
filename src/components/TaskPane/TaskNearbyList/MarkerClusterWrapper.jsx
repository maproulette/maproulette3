import L from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import "leaflet.markercluster";

/**
 * A wrapper for leaflet.markercluster that works with react-leaflet v3 and React 17
 * This avoids the hooks compatibility issues with react-leaflet-markercluster v4.x
 */
const MarkerClusterGroupWrapper = ({ children, maxClusterRadius = 80, chunkedLoading = true }) => {
  const map = useMap();

  useEffect(() => {
    const markerClusterGroup = L.markerClusterGroup({
      maxClusterRadius,
      chunkedLoading,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
    });

    const markers = [];
    const childrenArray = Array.isArray(children) ? children : [children];

    childrenArray.forEach((child) => {
      if (child?.props?.position) {
        const marker = L.marker(child.props.position, {
          icon: child.props.icon,
          zIndexOffset: child.props.zIndexOffset,
        });

        // Add event handlers
        if (child.props.eventHandlers) {
          Object.entries(child.props.eventHandlers).forEach(([event, handler]) => {
            marker.on(event, handler);
          });
        }

        // Handle tooltip
        if (child.props.title) {
          marker.bindTooltip(child.props.title);
        }

        markers.push(marker);
      }
    });

    markerClusterGroup.addLayers(markers);
    map.addLayer(markerClusterGroup);

    return () => map.removeLayer(markerClusterGroup);
  }, [map, children, maxClusterRadius, chunkedLoading]);

  // This component doesn't render anything directly - it just adds markers to the map
  return null;
};

export default MarkerClusterGroupWrapper;
