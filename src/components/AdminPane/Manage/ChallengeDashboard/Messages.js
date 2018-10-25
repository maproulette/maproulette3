import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with ChallengeDashboard
 */
export default defineMessages({
  startChallengeLabel: {
    id: "Admin.Challenge.controls.start.label",
    defaultMessage: "Start",
  },

  editChallengeLabel: {
    id: "Admin.Challenge.controls.edit.label",
    defaultMessage: "Edit",
  },

  moveChallengeLabel: {
    id: "Admin.Challenge.controls.move.label",
    defaultMessage: "Move",
  },

  noProjects: {
    id: "Admin.Challenge.controls.move.none",
    defaultMessage: "No permitted projects",
  },

  rebuildChallengeLabel: {
    id: "Admin.Challenge.controls.rebuild.label",
    defaultMessage: "Rebuild",
  },

  rebuildChallengePrompt: {
    id: "Admin.Challenge.controls.rebuild.prompt",
    defaultMessage: "Rebuilding will re-run the Overpass query and refresh your challenge with the latest data. Tasks marked as fixed will be removed from your challenge (affecting your metrics), while tasks for new data will be added. In some situations tasks may be duplicated if matching up old data with new data is unsuccessful. Do you wish to proceed?",
  },

  cloneChallengeLabel: {
    id: "Admin.Challenge.controls.clone.label",
    defaultMessage: "Clone",
  },
})
