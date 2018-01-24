import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with ManageProjects
 */
export default defineMessages({
  header: {
    id: 'Projects.header',
    defaultMessage: "Projects",
  },

  help: {
    id: 'Projects.help.info',
    defaultMessage: "Projects serve as a means of grouping " +
                    "related challenges together. All challenges need to " +
                    "belong to a project. You can create as few or as " +
                    "many different projects as makes sense for your needs.",
  },

  placeholder: {
    id: "Projects.search.placeholder",
    defaultMessage: "Name",
  },

  enabledTooltip: {
    id: "Project.status.enabled.tooltip",
    defaultMessage: "Enabled",
  },

  disabledTooltip: {
    id: "Project.status.disabled.tooltip",
    defaultMessage: "Disabled",
  },

  editProjectTooltip: {
    id: "Project.controls.editProject.tooltip",
    defaultMessage: "Edit Project",
  },

  editProjectLabel: {
    id: "Project.controls.editProject.label",
    defaultMessage: "Edit",
  },

  addChallengeTooltip: {
    id: "Project.controls.addChallenge.tooltip",
    defaultMessage: "New Challenge",
  },
})
