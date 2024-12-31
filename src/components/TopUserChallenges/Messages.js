import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with TopUserChallenges
 */
export default defineMessages({
  header: {
    id: "UserProfile.topChallenges.header",
    defaultMessage: "Your Top Challenges",
  },

  widgetLabel: {
    id: "TopUserChallenges.widget.label",
    defaultMessage: "Your Top Challenges",
  },

  topChallengesDisabled: {
    id: "TopUserChallenges.topChallengesDisabled.label",
    defaultMessage: "Results for Top Challenges widget are currently disabled",
  },

  noChallenges: {
    id: "TopUserChallenges.widget.noChallenges",
    defaultMessage: "No Challenges",
  },
});
