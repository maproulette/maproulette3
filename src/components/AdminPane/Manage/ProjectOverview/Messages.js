import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with ProjectOverview
 */
export default defineMessages({
  creationDate: {
    id: "Admin.Project.fields.creationDate.label",
    defaultMessage: "Created:",
  },

  lastModifiedDate: {
    id: "Admin.Project.fields.lastModifiedDate.label",
    defaultMessage: "Modified:",
  },

  deleteProject: {
    id: "Admin.Project.controls.delete.label",
    defaultMessage: "Delete Project",
  },

  visibleLabel: {
    id: "Admin.Project.controls.visible.label",
    defaultMessage: "Visible:",
  },

  confirmDisablePrompt: {
    id: "Admin.Project.controls.visible.confirmation",
    defaultMessage: "Are you sure? No challenges in this project will be discoverable by mappers.",
  },

  challengesUndiscoverable: {
    id: "Admin.Project.challengesUndiscoverable",
    defaultMessage: "challenges not discoverable",
  },
})

