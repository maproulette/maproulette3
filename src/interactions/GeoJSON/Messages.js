import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with GeoJSON interactions
 */
export default defineMessages({
  noZCoordinates: {
    id: "Admin.EditChallenge.geojson.errors.noZCoordinates",
    defaultMessage: "MapRoulette does not support Z coordinates in Points. Please remove any Z coordinates.",
  },

  noNullGeometry: {
    id: "Admin.EditChallenge.geojson.errors.noNullGeometry",
    defaultMessage: "MapRoulette does not support null geometries. Please remove any features with null geometries.",
  },
})
