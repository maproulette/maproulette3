import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with ChallengeResultItem.
 */
export default defineMessages({
  goBack: {
    id: "ChallengeDetails.controls.goBack.label",
    defaultMessage: "Go Back",
  },

  start: {
    id: "Admin.TaskAnalysisTable.controls.startTask.label",
    defaultMessage: "Start",
  },

  favorite: {
    id: "ChallengeDetails.controls.favorite.label",
    defaultMessage: "Favorite",
  },

  saveToFavorites: {
    id: "ChallengeDetails.controls.favorite.tooltip",
    defaultMessage: "Save to favorites",
  },

  unfavorite: {
    id: "ChallengeDetails.controls.unfavorite.label",
    defaultMessage: "Unfavorite",
  },

  removeFromFavorites: {
    id: "ChallengeDetails.controls.unfavorite.tooltip",
    defaultMessage: "Remove from favorites",
  },

  manageLabel: {
    id: "Challenge.management.controls.manage.label",
    defaultMessage: "Manage",
  },

  featured: {
    id: "Admin.EditChallenge.form.featured.label",
    defaultMessage: "Featured",
  },

  difficulty: {
    id: "Challenge.fields.difficulty.label",
    defaultMessage: "Difficulty",
  },

  lastTaskRefreshLabel: {
    id: "ChallengeDetails.fields.lastChallengeDetails.TaskRefresh.label",
    defaultMessage: "Task Data Sourced",
  },

  ownerLabel: {
    id: "Admin.ProjectManagers.projectOwner",
    defaultMessage: "Owner",
  },

  dataOriginDateLabel: {
    id: "ChallengeDetails.fields.lastChallengeDetails.DataOriginDate.label",
    defaultMessage: "Tasks built on {refreshDate} from data sourced on {sourceDate}.",
  },

  viewLeaderboard: {
    id: "Challenge.fields.viewLeaderboard.label",
    defaultMessage: "View Leaderboard",
  },

  viewReviews: {
    id: "Admin.TaskAnalysisTable.controls.reviewTask.label",
    defaultMessage: "Review",
  },

  viewComments: {
    id: "ChallengeDetails.fields.viewComments.label",
    defaultMessage: "Get In Touch",
  },

  viewOverview: {
    id: "ChallengeDetails.fields.viewOverview.label",
    defaultMessage: "Overview",
  },

  overpassQL: {
    id: "ChallengeDetails.fields.overpassQL.label",
    defaultMessage: "Overpass Query",
  },

  write: {
    id: "ChallengeDetails.controls.write.label",
    defaultMessage: "Write",
  },

  preview: {
    id: "ChallengeDetails.controls.preview.label",
    defaultMessage: "Preview",
  },

  review: {
    id: "ChallengeDetails.controls.review.label",
    defaultMessage: "I have attempted to contact the Challenge creator",
  },

  modalSubtitle: {
    id: "ChallengeDetails.controls.modal.subtitle",
    defaultMessage:
      "You are about to report a Challenge. An issue will be created in this [public github repository](https://github.com/maproulette/challenge-reports/issues) and the Challenge creator will be notified by email. Any follow-up discussion should take place there. Reporting a Challenge does not disable it immediately. Please explain in detail what your issue is with this challenge, if possible linking to specific OSM changesets.",
  },

  submitReport: {
    id: "ChallengeDetails.controls.submit.report.label",
    defaultMessage: "Report Challenge",
  },

  textInputError: {
    id: "ChallengeDetails.controls.text.input.error",
    defaultMessage: "Text Input should have minimum 100 characters",
  },

  checkboxError: {
    id: "ChallengeDetails.controls.checkbox.error",
    defaultMessage: "Please ensure that checkbox is checked before continue",
  },

  reportedText: {
    id: "ChallengeDetails.controls.reported_text",
    defaultMessage: "This challenge has been reported",
  },

  email: {
    id: "ChallengeDetails.controls.email",
    defaultMessage: "Email",
  },

  cloneChallenge: {
    id: "Admin.Challenge.controls.clone.label",
    defaultMessage: "Clone Challenge",
  },
});
