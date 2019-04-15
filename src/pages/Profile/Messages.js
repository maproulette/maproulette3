import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with Profile
 */
export default defineMessages({
  header: {
    id: "Profile.settings.header",
    defaultMessage: "User Settings",
  },

  userNotFound: {
    id: "Profile.noUser",
    defaultMessage: "User not found or you are unauthorized to view this user.",
  },

  userSince: {
    id: "Profile.userSince",
    defaultMessage: "User since:",
  },

  defaultEditorLabel: {
    id: "Profile.form.defaultEditor.label",
    defaultMessage: "Default Editor",
  },

  defaultEditorDescription: {
    id: "Profile.form.defaultEditor.description",
    defaultMessage: "Select the default editor that you want to use when fixing tasks. By selecting this option you will be able to skip the editor selection dialog after clicking on edit in a task.",
  },

  defaultBasemapLabel: {
    id: "Profile.form.defaultBasemap.label",
    defaultMessage: "Default Basemap",
  },

  defaultBasemapDescription: {
    id: "Profile.form.defaultBasemap.description",
    defaultMessage: "Select the default basemap to display on the map. Only a default challenge basemap will override the option selected here.",
  },

  customBasemapLabel: {
    id: "Profile.form.customBasemap.label",
    defaultMessage: "Custom Basemap",
  },

  // Note: dummy variable included to workaround react-intl
  // [bug 1158](https://github.com/yahoo/react-intl/issues/1158)
  // Just pass in an empty string for its value
  customBasemapDescription: {
    id: "Profile.form.customBasemap.description",
    defaultMessage: "Insert a custom base map here. E.g. `https://\\{s\\}.tile.openstreetmap.org/\\{z\\}/\\{x\\}/\\{y\\}.png` {dummy}",
  },

  localeLabel: {
    id: "Profile.form.locale.label",
    defaultMessage: "Locale",
  },

  localeDescription: {
    id: "Profile.form.locale.description",
    defaultMessage: "User locale to use for MapRoulette UI.",
  },

  leaderboardOptOutLabel: {
    id: "Profile.form.leaderboardOptOut.label",
    defaultMessage: "Opt out of Leaderboard",
  },

  leaderboardOptOutDescription: {
    id: "Profile.form.leaderboardOptOut.description",
    defaultMessage: "If yes, you will **not** appear on the public leaderboard.",
  },

  apiKey: {
    id: "Profile.apiKey.header",
    defaultMessage: "API Key",
  },

  apiKeyCopyLabel: {
    id: "Profile.apiKey.controls.copy.label",
    defaultMessage: "Copy",
  },

  apiKeyResetLabel: {
    id: "Profile.apiKey.controls.reset.label",
    defaultMessage: "Reset",
  },

  needsReviewLabel: {
    id: "Profile.form.needsReview.label",
    defaultMessage: "Request Review of all Work",
  },

  needsReviewDescription: {
    id: "Profile.form.needsReview.description",
    defaultMessage: "Automatically request a human review of each task you complete",
  },

  isReviewerLabel: {
    id: "Profile.form.isReviewer.label",
    defaultMessage: "Volunteer as a Reviewer",
  },

  isReviewerDescription: {
    id: "Profile.form.isReviewer.description",
    defaultMessage: "Volunteer to review tasks for which a review has been requested",
  },

  emailLabel: {
    id: "Profile.form.email.label",
    defaultMessage: "Email address",
  },

  emailDescription: {
    id: "Profile.form.email.description",
    defaultMessage: "If you request emails in your Notification Subscriptions, they " +
                    "will be sent here"
  },

  notificationLabel: {
    id: "Profile.form.notification.label",
    defaultMessage: "Notification",
  },

  notificationSubscriptionsLabel: {
    id: "Profile.form.notificationSubscriptions.label",
    defaultMessage: "Notification Subscriptions",
  },

  notificationSubscriptionsDescription: {
    id: "Profile.form.notificationSubscriptions.description",
    defaultMessage: "Decide which MapRoulette notifications you would like to " +
                    "receive, along with whether you would like to be sent " +
                    "an email informing you of the notification (either immediately " +
                    "or as a daily digest)"
  },

  yesLabel: {
    id: "Profile.form.yes.label",
    defaultMessage: "Yes",
  },

  noLabel: {
    id: "Profile.form.no.label",
    defaultMessage: "No",
  },

  mandatoryLabel: {
    id: "Profile.form.mandatory.label",
    defaultMessage: "Mandatory",
  },
})
