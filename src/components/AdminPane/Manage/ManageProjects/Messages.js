import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with ManageProjects
 */
export default defineMessages({
  header: {
    id: "Admin.ManageProjects.header",
    defaultMessage: "Projects",
  },

  help: {
    id: "Admin.ManageProjects.help.info",
    defaultMessage: "Projects serve as a means of grouping related " +
                    "challenges together. All challenges must belong " +
                    "to a project.",
  },

  placeholder: {
    id: "Admin.ManageProjects.search.placeholder",
    defaultMessage: "Name",
  },

  enabledTooltip: {
    id: "Admin.Project.fields.enabled.tooltip",
    defaultMessage: "Enabled",
  },

  disabledTooltip: {
    id: "Admin.Project.fields.disabled.tooltip",
    defaultMessage: "Disabled",
  },

  viewProjectTooltip: {
    id: "Admin.Project.controls.viewProject.tooltip",
    defaultMessage: "View Project",
  },

  viewProjectLabel: {
    id: "Admin.Project.controls.viewProject.label",
    defaultMessage: "View",
  },

  editProjectTooltip: {
    id: "Admin.Project.controls.editProject.tooltip",
    defaultMessage: "Edit Project",
  },

  editProjectLabel: {
    id: "Admin.Project.controls.editProject.label",
    defaultMessage: "Edit",
  },

  addChallengeTooltip: {
    id: "Admin.Project.controls.addChallenge.tooltip",
    defaultMessage: "New Challenge",
  },
})
