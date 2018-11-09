import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with LayerToggle
 */
export default defineMessages({
  showTaskFeaturesLabel: {
    id: "LayerToggle.controls.showTaskFeatures.label",
    defaultMessage: "Task Features"
  },

  showMapillaryLabel: {
    id: "LayerToggle.controls.showMapillary.label",
    defaultMessage: "Mapillary"
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
