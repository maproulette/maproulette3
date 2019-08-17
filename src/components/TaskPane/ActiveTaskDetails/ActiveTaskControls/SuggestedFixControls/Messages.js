import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with SuggestedFixControls
 */
export default defineMessages({
  tagsHeader: {
    id: "SuggestedFixControls.tagHeader",
    defaultMessage: "Proposed OSM Tags",
  },

  prompt: {
    id: "SuggestedFixControls.prompt",
    defaultMessage: "Are all of these changes correct?",
  },

  confirmLabel: {
    id: "SuggestedFixControls.controls.confirm.label",
    defaultMessage: "Yes",
  },

  rejectLabel: {
    id: "SuggestedFixControls.controls.reject.label",
    defaultMessage: "No",
  },

  moreOptionsLabel: {
    id: "SuggestedFixControls.controls.moreOptions.label",
    defaultMessage: "Other",
  },
})
