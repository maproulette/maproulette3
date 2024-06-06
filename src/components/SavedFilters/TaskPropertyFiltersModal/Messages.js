import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with SharedFiltersModal
 */
export default defineMessages({
  taskPropertyFiltersModalTitle: {
    id: "TaskPropertyFiltersModal.title",
    defaultMessage: "Saved Task Property Filter Settings"
  },

  taskPropertyFiltersModalDescription: {
    id: "TaskPropertyFiltersModal.description",
    defaultMessage: "Select a filter set from below to apply a saved Task Property filter to the current Review table tasks."
  },

  taskPropertyFiltersModalSubDescription: {
    id: "TaskPropertyFiltersModal.subDescription",
    defaultMessage: "The Task Property filters will only apply if you are viewing tasks from a single challenge in the review table."
  },

  taskPropertyFiltersModalFilterListLabel: {
    id: "TaskPropertyFiltersModal.filterList.label",
    defaultMessage: "Current Filter Settings for this Workspace "
  },

  taskPropertyFiltersModalFilterListSubLabel: {
    id: "TaskPropertyFiltersModal.filterList.subLabel",
    defaultMessage: "(Task Status and Priority filters listed are inclusive)"
  },

  doneLabel: {
    id: "TaskPropertyFiltersModal.controls.done.label",
    defaultMessage: "Done"
  },

  toggleLabel: {
    id: "TaskPropertyFiltersModal.controls.toggle.label",
    defaultMessage: "Toggle filter settings across workspace contexts: "
  },

  clearFiltersLabel: {
    id: "TaskPropertyFiltersModal.controls.clearFilters.label",
    defaultMessage: "Clear Current Task Property Filters"
  }
})