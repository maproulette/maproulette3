import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with SharedFiltersModal
 */
export default defineMessages({
  sharedFiltersModalTitle: {
    id: "SharedFiltersModal.title",
    defaultMessage: "Shared Filter Settings"
  },

  sharedFiltersModalDescription: {
    id: "SharedFiltersModal.description",
    defaultMessage: "Select a filter set from below to apply a saved Task Property filter to the current Review table tasks. The filtering rules are populated via any Challenge Admin filters you have saved that contain task property rules."
  },

  sharedFiltersModalSubDescription: {
    id: "SharedFiltersModal.subDescription",
    defaultMessage: "Only task property filters will be applied. The Task Property filters will only apply if you are viewing tasks from a single challenge in the review table."
  },

  sharedFiltersModalFilterListLabel: {
    id: "SharedFiltersModal.filterList.label",
    defaultMessage: "Current Filter Settings for this Workspace "
  },

  sharedFiltersModalFilterListSubLabel: {
    id: "SharedFiltersModal.filterList.subLabel",
    defaultMessage: "(Task Status and Priority filters listed are inclusive)"
  },

  doneLabel: {
    id: "SharedFiltersModal.controls.done.label",
    defaultMessage: "Done"
  },

  toggleLabel: {
    id: "SharedFiltersModal.controls.toggle.label",
    defaultMessage: "Toggle filter settings across workspace contexts: "
  },

  clearFiltersLabel: {
    id: "SharedFiltersModal.controls.clearFilters.label",
    defaultMessage: "Clear Current Task Property Filters"
  }
})