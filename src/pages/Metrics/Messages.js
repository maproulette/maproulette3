import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with User Metrics
 */
export default defineMessages({
  userOptedOut: {
    id: "Metrics.userOptedOut",
    defaultMessage: "This user has opted out of public display of their stats.",
  },

  userNotFound: {
    id: "Metrics.userNotFound",
    defaultMessage: "User not found or you are unauthorized to view this user.",
  },

  userNotFoundDescription: {
    id: "Metrics.userNotFoundDescription",
    defaultMessage:
      "The user you're looking for either doesn't exist or you don't have permission to view their metrics.",
  },

  userSince: {
    id: "Metrics.userSince",
    defaultMessage: "User since:",
  },

  osmProfileLabel: {
    id: "Metrics.links.osmProfile.label",
    defaultMessage: "OSM Profile",
  },

  osmChaLabel: {
    id: "Metrics.links.osmCha.label",
    defaultMessage: "OSMCha",
  },

  totalCompletedTasksTitle: {
    id: "Metrics.totalCompletedTasksTitle",
    defaultMessage: "Total Completed Tasks",
  },

  completedTasksTitle: {
    id: "Metrics.completedTasksTitle",
    defaultMessage: "Completed Tasks",
  },

  reviewedTasksTitle: {
    id: "ChallengeProgress.reviewStatus.label",
    defaultMessage: "Review Status",
  },

  leaderboardTitle: {
    id: "Leaderboard.title",
    defaultMessage: "Leaderboard",
  },

  globalRank: {
    id: "Metrics.leaderboard.globalRank.label",
    defaultMessage: "Global Rank",
  },

  totalPoints: {
    id: "Metrics.leaderboard.totalPoints.label",
    defaultMessage: "Total Points",
  },

  topChallenges: {
    id: "Leaderboard.user.topChallenges",
    defaultMessage: "Top Challenges",
  },

  approvedReview: {
    id: "Metrics.reviewStats.approved.label",
    defaultMessage: "Reviewed tasks that passed",
  },

  rejectedReview: {
    id: "Metrics.reviewStats.rejected.label",
    defaultMessage: "Tasks that failed",
  },

  assistedReview: {
    id: "Metrics.reviewStats.assisted.label",
    defaultMessage: "Reviewed tasks that passed with changes",
  },

  disputedReview: {
    id: "Metrics.reviewStats.disputed.label",
    defaultMessage: "Reviewed tasks that are being disputed",
  },

  awaitingReview: {
    id: "Metrics.reviewStats.awaiting.label",
    defaultMessage: "Tasks that are awaiting review",
  },

  avgReviewTime: {
    id: "Metrics.reviewStats.averageReviewTime.label",
    defaultMessage: "Average time to review:",
  },
});
