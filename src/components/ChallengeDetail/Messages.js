import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with ChallengeResultItem.
 */
export default defineMessages({
  goBack: {
    id: 'ChallengeDetails.controls.goBack.label',
    defaultMessage: 'Go Back',
  },

  start: {
    id: 'ChallengeDetails.controls.start.label',
    defaultMessage: 'Start',
  },

  favorite: {
    id: 'ChallengeDetails.controls.favorite.label',
    defaultMessage: 'Favorite',
  },

  saveToFavorites: {
    id: 'ChallengeDetails.controls.favorite.tooltip',
    defaultMessage: 'Save to favorites',
  },

  unfavorite: {
    id: 'ChallengeDetails.controls.unfavorite.label',
    defaultMessage: 'Unfavorite',
  },

  removeFromFavorites: {
    id: 'ChallengeDetails.controls.unfavorite.tooltip',
    defaultMessage: 'Remove from favorites',
  },

  manageLabel: {
    id: "ChallengeDetails.management.controls.manage.label",
    defaultMessage: "Manage",
  },

  featured: {
    id: "ChallengeDetails.Task.fields.featured.label",
    defaultMessage: "Featured",
  },

  difficulty: {
    id: 'ChallengeDetails.fields.difficulty.label',
    defaultMessage: 'Difficulty',
  },

  lastTaskRefreshLabel: {
    id: "ChallengeDetails.fields.lastChallengeDetails.TaskRefresh.label",
    defaultMessage: "Task Data Sourced",
  },

  dataOriginDateLabel: {
    id: "ChallengeDetails.fields.lastChallengeDetails.DataOriginDate.label",
    defaultMessage: "Tasks built on {refreshDate} from data sourced on {sourceDate}.",
  },

  viewLeaderboard: {
    id: "ChallengeDetails.fields.viewLeaderboard.label",
    defaultMessage: "View Leaderboard",
  },

  viewReviews: {
    id: "ChallengeDetails.fields.viewReviews.label",
    defaultMessage: "Review",
  },

  viewComments: {
    id: "ChallengeDetails.fields.viewComments.label",
    defaultMessage: "Get In Touch"
  },

  viewOverview: {
    id: "ChallengeDetails.fields.viewOverview.label",
    defaultMessage: "Overview"
  },

  write: {
    id: "ChallengeDetails.controls.write.label",
    defaultMessage: "Write"
  },

  preview: {
    id: "ChallengeDetails.controls.preview.label",
    defaultMessage: "Preview"
  },

  review: {
    id: "ChallengeDetails.controls.review.label",
    defaultMessage: "I have attempted to contact the Challenge creator"
  },

  modalSubtitle: {
    id: "ChallengeDetails.controls.modal.subtitle",
    defaultMessage:  "You are about to flag a Challenge. An issue will be created here and the Challenge creator will be notified by email. Any follow-up discussion should take place there. Flagging a Challenge does not disable it immediately. Please explain in detail what your issue is with this challenge, if possible linking to specific OSM changesets."
  },

  submitFlag: {
    id: "ChallengeDetails.controls.submit.flag.label",
    defaultMessage: "Flag Challenge"
  },

  textInputError: {
    id: "ChallengeDetails.controls.text.input.error",
    defaultMessage: "Text Input should have minimum 100 characters"
  },

  checkboxError: {
    id: "ChallengeDetails.controls.checkbox.error",
    defaultMessage: "Please ensure that checkbox is checked before continue"
  }
})
