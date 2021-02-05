import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with ChallengeDashboard
 */
export default defineMessages({
  startChallengeLabel: {
    id: "Admin.Challenge.controls.start.label",
    defaultMessage: "Start Challenge",
  },

  editChallengeLabel: {
    id: "Admin.Challenge.controls.edit.label",
    defaultMessage: "Edit Challenge",
  },

  moveChallengeLabel: {
    id: "Admin.Challenge.controls.move.label",
    defaultMessage: "Move Challenge",
  },

  noProjects: {
    id: "Admin.Challenge.controls.move.none",
    defaultMessage: "No permitted projects",
  },

  cloneChallengeLabel: {
    id: "Admin.Challenge.controls.clone.label",
    defaultMessage: "Clone Challenge",
  },

  copyChallengeURLLabel: {
    id: "Admin.ChallengeAnalysisTable.controls.copyChallengeURL.label",
    defaultMessage: "Copy URL",
  },

  deleteChallengeLabel: {
    id: "Admin.Challenge.controls.delete.label",
    defaultMessage: "Delete Challenge",
  },

  deleteChallengeConfirm: {
    id: "Admin.Challenge.controls.delete.confirm",
    defaultMessage: "Are you sure you wish to delete this challenge?"
  },

  deleteChallengeWarn: {
    id: "Admin.Challenge.controls.delete.warn",
    defaultMessage: "This action cannot be undone."
  }
})
