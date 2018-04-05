import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with ManageChallenges.
 */
export default defineMessages({
  header: {
    id: "Admin.ManageChallenges.header",
    defaultMessage: "Challenges",
  },

  intro: {
    id: "Admin.ManageChallenges.help.info",
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
    id: "Admin.ManageChallenges.search.placeholder",
    defaultMessage: "Name",
  },

  allProjectChallenge: {
    id: "Admin.ManageChallenges.allProjectChallenge",
    defaultMessage: "All",
  },

  creationDate: {
    id: "Admin.Challenge.fields.creationDate.label",
    defaultMessage: "Created:",
  },

  lastModifiedDate: {
    id: "Admin.Challenge.fields.lastModifiedDate.label",
    defaultMessage: "Modified:",
  },

  status: {
    id: "Admin.Challenge.fields.status.label",
    defaultMessage: "Status:",
  },

  visibleLabel: {
    id: "Admin.Challenge.fields.enabled.label",
    defaultMessage: "Visible:",
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
