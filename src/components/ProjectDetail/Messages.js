import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with ProjectDetail
 */
export default defineMessages({
  goBack: {
    id: 'ProjectDetails.controls.goBack.label',
    defaultMessage: 'Go Back',
  },

  unsave: {
    id: 'ProjectDetails.controls.unsave.label',
    defaultMessage: 'Unsave',
  },

  save: {
    id: 'ProjectDetails.controls.save.label',
    defaultMessage: 'Save',
  },

  manageLabel: {
    id: "ProjectDetails.management.controls.manage.label",
    defaultMessage: "Manage",
  },

  startLabel: {
    id: "ProjectDetails.management.controls.start.label",
    defaultMessage: "Start",
  },

  challengeCount: {
    id: "ProjectDetails.fields.challengeCount.label",
    defaultMessage:
    "{count,plural,=0{No challenges} one{# challenge} other{# challenges}} " +
    "remaining in {isVirtual,select, true{virtual } other{}}project"
  },

  featured: {
    id: "ProjectDetails.fields.featured.label",
    defaultMessage: "Featured",
  },

  createdOnLabel: {
    id: "ProjectDetails.fields.created.label",
    defaultMessage: "Created",
  },

  modifiedOnLabel: {
    id: "ProjectDetails.fields.modified.label",
    defaultMessage: "Modified",
  },

  viewLeaderboard: {
    id: "ProjectDetails.fields.viewLeaderboard.label",
    defaultMessage: "View Leaderboard",
  },
})
