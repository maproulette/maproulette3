import * as turf from "@turf/turf";
import { leafletToTurf, turfToLeaflet } from "./turfUtils";
import { globalFeatureGroups } from "../context/PriorityBoundsContext";

// Generate a unique ID for polygons
const generatePolygonId = () => `polygon-${Date.now()}-${Math.round(Math.random() * 1000)}`;

// Check if polygon is closed (first and last points match)
export const isPolygonClosed = (coordinates) => {
  if (coordinates.length < 2) return false;
  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];
  return first[0] === last[0] && first[1] === last[1];
};

// Close a ring if needed by adding the first point to the end
const closeRing = (ring) => {
  if (ring.length === 0) return ring;

  const first = ring[0];
  const last = ring[ring.length - 1];

  if (first[0] !== last[0] || first[1] !== last[1]) {
    return [...ring, [first[0], first[1]]];
  }

  return ring;
};
// Convert Leaflet polygon to GeoJSON
export const polygonToGeoJSON = (polygon) => {
  try {
    // Use native toGeoJSON if available (Leaflet 1.0+)
    if (polygon.toGeoJSON) {
      return polygon.toGeoJSON();
    }

    // Fallback for older Leaflet versions
    const latLngs = polygon.getLatLngs();
    let coordinates = [];

    // Handle simple polygon (one ring)
    if (latLngs.length > 0 && !Array.isArray(latLngs[0])) {
      const ring = latLngs.map((ll) => [ll.lng, ll.lat]);
      coordinates.push(closeRing(ring));
    }
    // Handle multi-polygon or polygon with holes
    else {
      coordinates = latLngs.map((ring) => {
        const processedRing = ring.map((ll) => [ll.lng, ll.lat]);
        return closeRing(processedRing);
      });
    }

    return {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: coordinates,
      },
    };
  } catch (error) {
    console.error("Error converting polygon to GeoJSON:", error);
    return null;
  }
};

// Process a new polygon and add metadata
export const processNewPolygon = (polygon) => {
  if (!polygon?.getLatLngs) {
    console.error("Invalid polygon object");
    return null;
  }

  try {
    const feature = polygonToGeoJSON(polygon);

    if (feature) {
      feature.properties = {
        ...feature.properties,
        id: generatePolygonId(),
        created: new Date().toISOString(),
      };
    }

    return feature;
  } catch (error) {
    console.error("Error processing polygon:", error);
    return null;
  }
};

// Convert all polygons in a feature group to GeoJSON features
export const convertLeafletPolygonsToGeoJSON = (featureGroup) => {
  if (!featureGroup) return [];

  const features = [];

  featureGroup.eachLayer((layer) => {
    if (layer instanceof L.Polygon) {
      const feature = polygonToGeoJSON(layer);
      if (feature) {
        // Add ID if missing
        if (!feature.properties?.id) {
          feature.properties = {
            ...feature.properties,
            id: generatePolygonId(),
          };
        }
        features.push(feature);
      }
    }
  });

  return features;
};
