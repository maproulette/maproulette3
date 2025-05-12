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
      coordinates = [closeRing(latLngs.map((ll) => [ll.lng, ll.lat]))];
    }
    // Handle multi-polygon or polygon with holes
    else {
      coordinates = latLngs.map((ring) => {
        return closeRing(ring.map((ll) => [ll.lng, ll.lat]));
      });
    }

    return {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates,
      },
    };
  } catch (error) {
    console.error("Error converting polygon to GeoJSON:", error);
    return null;
  }
};
