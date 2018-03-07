import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with ManageProjects
 */
export default defineMessages({
  header: {
    id: "Admin.ManageProjects.header",
    defaultMessage: "Projects & Challenges",
  },

  help: {
    id: "Admin.ManageProjects.help.info",
    defaultMessage: "Projects serve as a means of grouping related " +
                    "challenges together. All challenges must belong " +
                    "to a project.",
  },

  placeholder: {
    id: "Admin.ManageProjects.search.placeholder",
    defaultMessage: "Search Project Name",
  },

  addChallengeTooltip: {
    id: "Admin.Project.controls.addChallenge.tooltip",
    defaultMessage: "New Challenge",
  },
})
