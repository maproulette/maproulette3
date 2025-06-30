/**
 * Converts a Leaflet polygon to GeoJSON format
 */
export const polygonToGeoJSON = (polygon) => {
  try {
    if (polygon.toGeoJSON) {
      return polygon.toGeoJSON();
    }

    const latLngs = polygon.getLatLngs();
    const coordinates = Array.isArray(latLngs[0])
      ? latLngs.map((ring) => ring.map((ll) => [ll.lng, ll.lat]))
      : [latLngs.map((ll) => [ll.lng, ll.lat])];

    // Ensure rings are closed
    coordinates.forEach((ring) => {
      if (ring.length > 0) {
        const first = ring[0];
        const last = ring[ring.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
          ring.push([first[0], first[1]]);
        }
      }
    });

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

/**
 * Validates and filters an array of GeoJSON polygon features
 */
export const validatePriorityBounds = (bounds) => {
  if (!Array.isArray(bounds)) return [];

  return bounds.filter((feature) => {
    const coords = feature?.geometry?.coordinates?.[0];
    return feature?.geometry?.type === "Polygon" && Array.isArray(coords) && coords.length >= 4;
  });
};
