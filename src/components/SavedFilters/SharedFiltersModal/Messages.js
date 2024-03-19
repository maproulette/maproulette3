import { defineMessages } from 'react-intl'

export default defineMessages({
  sharedFiltersModalTitle: {
    id: "SharedFiltersModal.title",
    defaultMessage: "Shared Filter Settings"
  },

  sharedFiltersModalDescription: {
    id: "SharedFiltersModal.description",
    defaultMessage: "When this setting is toggled the current filters will also be applied in" +
                    "other contexts (currently the Challenge Management and Task Review workspaces)*"
  },

  sharedFiltersModalSubDescription: {
    id: "SharedFiltersModal.subDescription",
    defaultMessage: "*Context-specific filters (currently task properties, certain table column sorting filters and specific task statuses)" + 
                    "will only be applied to their relevant context. Changing this setting to \"off\" or applying a saved filter" + 
                    "profile from the list will return filtering to its default behavior."
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