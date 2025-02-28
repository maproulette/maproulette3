import { defineMessages } from "react-intl";

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
    id: "Admin.ChallengeList.noChallenges",
    defaultMessage: "No Challenges",
  },

  startChallenge: {
    id: "Admin.Challenge.controls.start.label",
    defaultMessage: "Start Challenge",
  },
});
