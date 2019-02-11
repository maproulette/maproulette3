import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with Leaderboard
 */
export default defineMessages({
  leaderboardTitle: {
    id: "Leaderboard.title",
    defaultMessage: "Leaderboard",
  },

  leaderboardGlobal: {
    id: "Leaderboard.global",
    defaultMessage: "Global",
  },

  scoringMethodLabel: {
    id: "Leaderboard.scoringMethod.label",
    defaultMessage: "Scoring method",
  },

  scoringExplanation: {
    id: "Leaderboard.scoringMethod.explanation",
    defaultMessage: `
##### Points are awarded per completed task as follows:

| Status        | Points |
| :------------ | -----: |
| Fixed         | 5      |
| Not an Issue  | 3      |
| Already Fixed | 3      |
| Too Hard      | 1      |
| Skipped       | 0      |
`
  },

  userPoints: {
    id: "Leaderboard.user.points",
    defaultMessage: "Points",
  },

  userTopChallenges: {
    id: "Leaderboard.user.topChallenges",
    defaultMessage: "Top Challenges",
  },

  noLeaders: {
    id: "Leaderboard.users.none",
    defaultMessage: "No users for time period",
  },

  loadMoreLabel: {
    id: "Leaderboard.controls.loadMore.label",
    defaultMessage: "Show More",
  },

  updatedFrequently: {
    id: "Leaderboard.updatedFrequently",
    defaultMessage: "Updated every 15 minutes",
  },

  updatedDaily: {
    id: "Leaderboard.updatedDaily",
    defaultMessage: "Updated every 24 hours",
  },
})
