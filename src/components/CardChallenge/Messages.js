import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with CardChallenge
 */
export default defineMessages({
  difficulty: {
    id: "Challenge.fields.difficulty.label",
    defaultMessage: "Difficulty",
  },

  lastTaskRefreshLabel: {
    id: "Challenge.fields.lastTaskRefresh.label",
    defaultMessage: "Tasks Data Sourced",
  },

  viewLeaderboard: {
    id: "Challenge.fields.viewLeaderboard.label",
    defaultMessage: "View Leaderboard",
  },

  completedChallengeLabel: {
    id: "Challenge.fields.completed.label",
    defaultMessage: "Completed",
  },

  vpListLabel: {
    id: "Challenge.fields.vpList.label",
    defaultMessage: "Also in matching virtual {count,plural, one{project} other{projects}}:",
  },
});
