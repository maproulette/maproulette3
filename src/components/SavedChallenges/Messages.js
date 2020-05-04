import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with SavedChallenges.
 */
export default defineMessages({
  header: {
    id: "UserProfile.favoriteChallenges.header",
    defaultMessage: "Favorite Challenges",
  },

  unsave: {
    id: "Challenge.controls.unsave.tooltip",
    defaultMessage: "Unfavorite Challenge",
  },

  noChallenges: {
    id: "SavedChallenges.widget.noChallenges",
    defaultMessage: "No Challenges",
  },
})
