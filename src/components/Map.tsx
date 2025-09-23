import { useRef, useEffect } from 'react';
import type React from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapProps {
  center?: [number, number];
  zoom?: number;
  style?: string | maplibregl.StyleSpecification;
  className?: string;
  children?: React.ReactNode;
}

export const MapPane: React.FC<MapProps> = ({
  center = [-74.006, 40.7128], // Default to New York City
  zoom = 10,
  style = 'https://demotiles.maplibre.org/style.json', // Default MapLibre style
  className = 'w-full h-96',
  children,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    // Initialize the map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: style,
      center: center,
      zoom: zoom,
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Add scale control
    map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div className={className}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      {children}
    </div>
  );
};

export default MapPane;
