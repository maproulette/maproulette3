import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with ProjectsDashboard
 */
export default defineMessages({
  newProject: {
    id: 'Admin.ProjectsDashboard.newProject',
    defaultMessage: "Add Project",
  },

  help: {
    id: "Admin.ProjectsDashboard.help.info",
    defaultMessage: "Projects serve as a means of grouping related " +
                    "challenges together. All challenges must belong " +
                    "to a project.",
  },

  placeholder: {
    id: "Admin.ProjectsDashboard.search.placeholder",
    defaultMessage: "Project or Challenge Name",
  },

  addChallengeTooltip: {
    id: "Admin.Project.controls.addChallenge.tooltip",
    defaultMessage: "New Challenge",
  },

  regenerateHomeProject: {
    id: "Admin.ProjectsDashboard.regenerateHomeProject",
    defaultMessage: "Please sign out and sign back in to regenerate a " +
                    "fresh home project.",
  },
})
