import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with User Metrics
 */
export default defineMessages({
  userOptedOut: {
    id: 'Metrics.userOptedOut',
    defaultMessage: 'This user has opted out of public display of their stats.',
  },

  userSince: {
    id: 'Metrics.userSince',
    defaultMessage: 'User since:',
  },

  totalCompletedTasksTitle: {
    id: 'Metrics.totalCompletedTasksTitle',
    defaultMessage: 'Total Completed Tasks',
  },

  completedTasksTitle: {
    id: 'Metrics.completedTasksTitle',
    defaultMessage: 'Completed Tasks',
  },

  reviewedTasksTitle: {
    id: 'Metrics.reviewedTasksTitle',
    defaultMessage: 'Review Status',
  },

  leaderboardTitle: {
    id: 'Metrics.leaderboardTitle',
    defaultMessage: 'Leaderboard',
  },

  globalRank: {
    id: 'Metrics.leaderboard.globalRank.label',
    defaultMessage: 'Global Rank',
  },

  totalPoints: {
    id: 'Metrics.leaderboard.totalPoints.label',
    defaultMessage: 'Total Points',
  },

  topChallenges: {
    id: 'Metrics.leaderboard.topChallenges.label',
    defaultMessage: 'Top Challenges',
  },

  approvedReview: {
    id: 'Metrics.reviewStats.approved.label',
    defaultMessage: "Reviewed tasks that passed",
  },

  rejectedReview: {
    id: 'Metrics.reviewStats.rejected.label',
    defaultMessage: "Tasks that failed",
  },

  assistedReview: {
    id: 'Metrics.reviewStats.assisted.label',
    defaultMessage: "Reviewed tasks that passed with changes",
  },

  disputedReview: {
    id: 'Metrics.reviewStats.disputed.label',
    defaultMessage: "Reviewed tasks that are being disputed",
  },

  awaitingReview: {
    id: 'Metrics.reviewStats.awaiting.label',
    defaultMessage: "Tasks that are awaiting review",
  },
})
