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
                    "with Open Street Map data. Tasks are typically " +
                    "generated automatically from an overpassQL query " +
                    "you provide when creating a new challenge, but " +
                    "can also be loaded from a local file or remote " +
                    "URL containing GeoJSON features. You can create " +
                    "as many challenges as you'd like, and can group " +
                    "them into projects to help keep them organized.",
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
    id: "Challenge.creationDate.label",
    defaultMessage: "Created:",
  },

  status: {
    id: "Challenge.status.label",
    defaultMessage: "Status:",
  },

  activity: {
    id: "Challenge.activity.label",
    defaultMessage: "Recent Activity",
  }
})
