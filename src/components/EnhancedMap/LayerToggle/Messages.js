import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with LayerToggle
 */
export default defineMessages({
  showTaskFeaturesLabel: {
    id: "LayerToggle.controls.showTaskFeatures.label",
    defaultMessage: "Task Features"
  },

  showPriorityBoundsLabel: {
    id: "LayerToggle.controls.showPriorityBounds.label",
    defaultMessage: "Priority Bounds"
  },

  showOSMDataLabel: {
    id: "LayerToggle.controls.showOSMData.label",
    defaultMessage: "OSM Data",
  },

  showMapillaryLabel: {
    id: "LayerToggle.controls.showMapillary.label",
    defaultMessage: "Mapillary"
  },

  moreLabel: {
    id: "LayerToggle.controls.more.label",
    defaultMessage: "More"
  },

  showOpenStreetCamLabel: {
    id: "LayerToggle.controls.showOpenStreetCam.label",
    defaultMessage: "OpenStreetCam"
  },

  imageCount: {
    id: "LayerToggle.imageCount",
    defaultMessage: "({count, plural, =0 {no images} other {# images}})"
  },

  loading: {
    id: "LayerToggle.loading",
    defaultMessage: "(loading...)"
  },
})
