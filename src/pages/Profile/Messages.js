import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with Profile
 */
export default defineMessages({
  pageTitle: {
    id: "Profile.page.title",
    defaultMessage: "User Settings",
  },

  header: {
    id: "Profile.settings.header",
    defaultMessage: "General",
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

  customBasemapsLabel: {
    id: "Profile.form.customBasemaps.label",
    defaultMessage: "Custom Basemaps",
  },

  customBasemapDescription: {
    id: "Profile.form.customBasemap.description",
    defaultMessage: "Insert a custom base map here. E.g. `https://'{s}'.tile.openstreetmap.org/'{z}'/'{x}'/'{y}'.png`",
  },

  addCustomBasemapLabel: {
    id: "Profile.form.addCustomBasemap.label",
    defaultMessage: "Add Custom Basemap",
  },

  deleteCustomBasemapLabel: {
    id: "Profile.form.deleteCustomBasemap.label",
    defaultMessage: "Delete",
  },

  customBasemapNameLabel: {
    id: "Profile.form.customBasemap.name.label",
    defaultMessage: "Name",
  },

  customBasemapURLLabel: {
    id: "Profile.form.customBasemap.url.label",
    defaultMessage: "URL",
  },

  customBasemapOverlayLabel: {
    id: "Profile.form.customBasemap.overlay.label",
    defaultMessage: "is overlay?",
  },

  uniqueCustomBasemapError: {
    id: "Profile.form.uniqueCustomBasemap.error",
    defaultMessage: "Custom Basemap names must be unique",
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

  allowFollowingLabel: {
    id: "Profile.form.allowFollowing.label",
    defaultMessage: "Allow Following",
  },

  allowFollowingDescription: {
    id: "Profile.form.allowFollowing.description",
    defaultMessage:
    "If no, users will not be able to follow your MapRoulette activity."
  },

  seeTagFixSuggestionsDescription: {
    id: "Profile.form.seeTagFixSuggestions.description",
    defaultMessage:
    "User will see tag fix suggestions if they are provided."
  },

  seeTagFixSuggestionsLabel: {
    id: "Profile.form.seeTagFixSuggestions.label",
    defaultMessage:
    "See Tag Fix Suggestions"
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
    "will be sent here.\n\nDecide which MapRoulette notifications you would like to " +
    "receive, along with whether you would like to be sent " +
    "an email informing you of the notification (either immediately " +
    "or as a daily digest)"
  },

  notificationLabel: {
    id: "Profile.form.notification.label",
    defaultMessage: "Notification",
  },

  errorFormatMessage: {
    id: "Profile.form.format.error",
    defaultMessage: "should match format",
  },

  errorFormatEmail: {
    id: "Profile.form.email.format",
    defaultMessage: "email",
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
