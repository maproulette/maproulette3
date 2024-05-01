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
    defaultMessage: "Apply Task Property filtering rules from your saved Challenge Admin filter profiles to the current Review Task workspace."
  },

  sharedFiltersModalSubDescription: {
    id: "SharedFiltersModal.subDescription",
    defaultMessage: "Only task property filters will be applied."
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
  }
})