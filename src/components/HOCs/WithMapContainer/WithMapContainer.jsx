import React from "react";
import { MapContainer, AttributionControl, ZoomControl, useMap } from "react-leaflet";
import { useEffect } from "react";

const ResizeMap = () => {
  const map = useMap();
  useEffect(() => {
    const handleResize = () => {
      map.invalidateSize();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    const mapContainer = map.getContainer();
    resizeObserver.observe(mapContainer);

    return () => {
      resizeObserver.disconnect();
    };
  }, [map]);
  return null;
};

const WithMapContainer = (WrappedComponent) => {
  return function WithMapContainerComponent(props) {
    const { center, zoom = 12, minZoom = 2, maxZoom = 18, intl, children, ...otherProps } = props;

    return (
      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        animate={true}
        worldCopyJump={true}
        attributionControl={false}
        minZoom={minZoom}
        maxZoom={maxZoom}
        maxBounds={[
          [-90, -180],
          [90, 180],
        ]}
      >
        <ResizeMap />
        <AttributionControl position="bottomleft" prefix={false} />
        <ZoomControl position="topright" />
        <WrappedComponent intl={intl} {...otherProps}>
          {children}
        </WrappedComponent>
      </MapContainer>
    );
  };
};

export default WithMapContainer;
