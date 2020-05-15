import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with Dashboard
 */
export default defineMessages({
  header: {
    id: "Dashboard.header",
    defaultMessage: "Dashboard",
  },

  welcome: {
    id: "Dashboard.header.welcomeBack",
    defaultMessage: "Welcome Back, {username}!"
  },

  completionPrompt: {
    id: "Dashboard.header.completionPrompt",
    defaultMessage: "You've finished",
  },

  completedTasks: {
    id: "Dashboard.header.completedTasks",
    defaultMessage: "{completedTasks, number} tasks",
  },

  pointsPrompt: {
    id: "Dashboard.header.pointsPrompt",
    defaultMessage: ", earned",
  },

  points: {
    id: "Dashboard.header.userScore",
    defaultMessage: "{points, number} points",
  },

  rankPrompt: {
    id: "Dashboard.header.rankPrompt",
    defaultMessage: ", and are",
  },

  rank: {
    id: "Dashboard.header.globalRank",
    defaultMessage: "ranked #{rank, number}",
  },

  globally: {
    id: "Dashboard.header.globally",
    defaultMessage: "globally.",
  },

  encouragement: {
    id: "Dashboard.header.encouragement",
    defaultMessage: "Keep it going!",
  },

  getStarted: {
    id: "Dashboard.header.getStarted",
    defaultMessage: "Earn points by completing challenge tasks!",
  },

  jumpBackIn: {
    id: "Dashboard.header.jumpBackIn",
    defaultMessage: "Jump back in!",
  },

  resume: {
    id: "Dashboard.header.resume",
    defaultMessage: "Resume your last challenge",
  },

  latestChallengeLabel: {
    id: "Dashboard.header.controls.latestChallenge.label",
    defaultMessage: "Take me to Challenge",
  },

  find: {
    id: "Dashboard.header.find",
    defaultMessage: "Or find",
  },

  somethingNew: {
    id: "Dashboard.header.somethingNew",
    defaultMessage: "something new",
  },

  findChallengeLabel: {
    id: "Dashboard.header.controls.findChallenge.label",
    defaultMessage: "Discover new Challenges",
  },
})
