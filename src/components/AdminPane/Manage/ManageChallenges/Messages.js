import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with ManageChallenges.
 */
export default defineMessages({
  header: {
    id: 'Admin.challenges.header',
    defaultMessage: "Challenges",
  },

  intro: {
    id: 'Admin.challengesIntro',
    defaultMessage: "Challenges consist of many tasks that all " +
                    "help address a specific problem or shortcoming " +
                    "with OpenStreetMap data. Tasks are typically " +
                    "generated automatically from an overpassQL query " +
                    "you provide when creating a new challenge, but " +
                    "can also be loaded from a local file or remote " +
                    "URL containing GeoJSON features. You can create " +
                    "as many challenges as you'd like.",
  },

  placeholder: {
    id: "Admin.challenges.search.placeholder",
    defaultMessage: "Name",
  },

  allProjectChallenge: {
    id: 'Admin.challenges.allProjectChallenge',
    defaultMessage: "All",
  },

  creationDate: {
    id: "Admin.Challenge.creationDate.label",
    defaultMessage: "Created:",
  },

  status: {
    id: "Admin.Challenge.status.label",
    defaultMessage: "Status:",
  },

  startChallengeLabel: {
    id: "Admin.Challenge.controls.startChallenge.label",
    defaultMessage: "Start Challenge",
  },

  activity: {
    id: "Admin.Challenge.activity.label",
    defaultMessage: "Recent Activity",
  }
})
