import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with UserSettings
 */
export default defineMessages({
  header: {
    id: "UserProfile.settings.header",
    defaultMessage: "User Settings",
  },

  defaultEditorLabel: {
    id: "UserSettings.form.defaultEditor.label",
    defaultMessage: "Default Editor",
  },

  defaultEditorDescription: {
    id: "UserSettings.form.defaultEditor.description",
    defaultMessage: "Select the default editor that you want to use when fixing tasks. By selecting this option you will be able to skip the editor selection dialog after clicking on edit in a task.",
  },

  defaultBasemapLabel: {
    id: "UserSettings.form.defaultBasemap.label",
    defaultMessage: "Default Basemap",
  },

  defaultBasemapDescription: {
    id: "UserSettings.form.defaultBasemap.description",
    defaultMessage: "Select the default basemap to display on the map. Only a default challenge basemap will override the option selected here.",
  },

  customBasemapLabel: {
    id: "UserSettings.form.customBasemap.label",
    defaultMessage: "Custom Basemap",
  },

  customBasemapDescription: {
    id: "UserSettings.form.customBasemap.description",
    defaultMessage: "Insert a custom base map here. Eg. http://\\{s\\}.tile.openstreetmap.org/\\{z\\}/\\{x\\}/\\{y\\}.png",
  },

  localeLabel: {
    id: "UserSettings.form.locale.label",
    defaultMessage: "Locale",
  },

  localeDescription: {
    id: "UserSettings.form.locale.description",
    defaultMessage: "User locale to use for MapRoulette UI.",
  },
})
