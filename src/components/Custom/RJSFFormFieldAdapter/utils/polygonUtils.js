const closeRing = (ring) => {
  if (ring.length === 0) return ring;

  const first = ring[0];
  const last = ring[ring.length - 1];

  if (first[0] !== last[0] || first[1] !== last[1]) {
    return [...ring, [first[0], first[1]]];
  }

  return ring;
};

export const polygonToGeoJSON = (polygon) => {
  try {
    if (polygon.toGeoJSON) {
      return polygon.toGeoJSON();
    }

    const latLngs = polygon.getLatLngs();
    let coordinates = [];

    if (latLngs.length > 0 && !Array.isArray(latLngs[0])) {
      coordinates = [closeRing(latLngs.map((ll) => [ll.lng, ll.lat]))];
    } else {
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

/**
 * Validates an array of GeoJSON features representing priority bounds
 * Ensures each feature is a proper GeoJSON polygon with closed rings
 *
 * @param {Array} bounds - Array of GeoJSON features
 * @returns {Array} - Filtered array of valid GeoJSON features
 */
export const validatePriorityBounds = (bounds) => {
  if (!Array.isArray(bounds)) {
    return [];
  }

  return bounds.filter((feature) => {
    try {
      if (!feature || !feature.geometry || !feature.geometry.coordinates) {
        return false;
      }

      if (feature.geometry.type !== "Polygon") {
        return false;
      }

      if (
        !Array.isArray(feature.geometry.coordinates) ||
        !Array.isArray(feature.geometry.coordinates[0]) ||
        feature.geometry.coordinates[0].length < 4
      ) {
        return false;
      }

      const rings = feature.geometry.coordinates;

      for (let i = 0; i < rings.length; i++) {
        const ring = rings[i];
        const firstPoint = ring[0];
        const lastPoint = ring[ring.length - 1];

        if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
          ring.push([...firstPoint]);
        }
      }

      return true;
    } catch (error) {
      console.error("Error validating polygon:", error);
      return false;
    }
  });
};
