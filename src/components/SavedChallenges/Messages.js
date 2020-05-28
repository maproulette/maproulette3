import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with SavedChallenges.
 */
export default defineMessages({
  header: {
    id: "UserProfile.favoriteChallenges.header",
    defaultMessage: "Your Favorite Challenges",
  },

  unsave: {
    id: "Challenge.controls.unsave.tooltip",
    defaultMessage: "Unfavorite Challenge",
  },

  noChallenges: {
    id: "SavedChallenges.widget.noChallenges",
    defaultMessage: "No Challenges",
  },

  startChallenge: {
    id: "SavedChallenges.widget.startChallenge",
    defaultMessage: "Start Challenge",
  },
})
