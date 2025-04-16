import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with ProjectDetail
 */
export default defineMessages({
  goBack: {
    id: "ChallengeDetails.controls.goBack.label",
    defaultMessage: "Go Back",
  },

  unsave: {
    id: "Challenge.controls.unsave.label",
    defaultMessage: "Unsave",
  },

  save: {
    id: "Admin.EditProject.controls.save.label",
    defaultMessage: "Save",
  },

  manageLabel: {
    id: "Challenge.management.controls.manage.label",
    defaultMessage: "Manage",
  },

  showAll: {
    id: "ProjectDetails.management.controls.showAll.label",
    defaultMessage: "Display All Challenges",
  },

  startLabel: {
    id: "Admin.TaskAnalysisTable.controls.startTask.label",
    defaultMessage: "Start",
  },

  challengeCount: {
    id: "ProjectDetails.fields.challengeCount.label",
    defaultMessage:
      "{count,plural,=0{No challenges} one{# challenge} other{# challenges}} " +
      "remaining in {isVirtual,select, true{virtual } other{}}project",
  },

  featured: {
    id: "Admin.EditChallenge.form.featured.label",
    defaultMessage: "Featured",
  },

  ownerLabel: {
    id: "Admin.ProjectManagers.projectOwner",
    defaultMessage: "Owner",
  },

  createdOnLabel: {
    id: "Activity.action.created",
    defaultMessage: "Created",
  },

  modifiedOnLabel: {
    id: "ProjectDetails.fields.modified.label",
    defaultMessage: "Modified",
  },

  viewLeaderboard: {
    id: "Challenge.fields.viewLeaderboard.label",
    defaultMessage: "View Leaderboard",
  },

  viewReviews: {
    id: "Admin.TaskAnalysisTable.controls.reviewTask.label",
    defaultMessage: "Review",
  },

  showMore: {
    id: "ProjectDetails.controls.showMore.label",
    defaultMessage: "show more",
  },

  showLess: {
    id: "ProjectDetails.controls.showLess.label",
    defaultMessage: "show less",
  },
});
