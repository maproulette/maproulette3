import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with EditChallenge
 */
export default defineMessages({
  editChallenge: {
    id: 'EditChallenge.header',
    defaultMessage: "Edit",
  },

  newChallenge: {
    id: 'NewChallenge.header',
    defaultMessage: "New Challenge",
  },

  formTitle: {
    id: 'EditChallenge.form.formTitle',
    defaultMessage: "General",
  },

  formDescription: {
    id: 'EditChallenge.form.formDescription',
    defaultMessage: "Standard challenge information",
  },

  visibleLabel: {
    id: 'EditChallenge.form.visible.label',
    defaultMessage: "Visible",
  },

  visibleDescription: {
    id: 'EditChallenge.form.visible.description',
    defaultMessage: "Allow users to see the challenge (subject to Project " +
                    "visibility)",
  },

  nameLabel: {
    id: 'EditChallenge.form.name.label',
    defaultMessage: "Name",
  },

  nameDescription: {
    id: 'EditChallenge.form.name.description',
    defaultMessage: "Name of the challenge",
  },

  descriptionLabel: {
    id: 'EditChallenge.form.description.label',
    defaultMessage: "Description",
  },

  descriptionDescription: {
    id: 'EditChallenge.form.description.description',
    defaultMessage: "Description of the challenge",
  },

  blurbLabel: {
    id: 'EditChallenge.form.blurb.label',
    defaultMessage: "Blurb",
  },

  blurbDescription: {
    id: 'EditChallenge.form.blurb.description',
    defaultMessage: "Blurb for the challenge",
  },

  instructionLabel: {
    id: 'EditChallenge.form.instruction.label',
    defaultMessage: "Instructions",
  },

  instructionDescription: {
    id: 'EditChallenge.form.instruction.description',
    defaultMessage: "Detailed instructions for users doing the challenge",
  },

  checkinCommentLabel: {
    id: 'EditChallenge.form.checkinComment.label',
    defaultMessage: "Checkin Comment",
  },

  checkinCommentDescription: {
    id: 'EditChallenge.form.checkinComment.description',
    defaultMessage: "Checkin comment to be associated with changes made by " +
                    "users in editor",
  },

  difficultyLabel: {
    id: 'EditChallenge.form.difficult.label',
    defaultMessage: "Difficulty",
  },

  categoryLabel: {
    id: 'EditChallenge.form.category.label',
    defaultMessage: "Category",
  },

  categoryDescription: {
    id: 'EditChallenge.form.category.description',
    defaultMessage: "Categorization keyword to help users quickly discover " +
                    "the challenge",
  },

  additionalKeywordsLabel: {
    id: 'EditChallenge.form.additionalKeywords.label',
    defaultMessage: "Keywords",
  },

  additionalKeywordsDescription: {
    id: 'EditChallenge.form.additionalKeywords.description',
    defaultMessage: "Additional comma-separated keywords to aid challenge " +
                    "discovery",
  },

  featuredLabel: {
    id: 'EditChallenge.form.featured.label',
    defaultMessage: "Featured",
  },

  featuredDescription: {
    id: 'EditChallenge.form.featured.description',
    defaultMessage: "Featured challenges show up front and center",
  },

  step2Label: {
    id: 'EditChallenge.form.step2.label',
    defaultMessage: "GeoJSON Source",
  },

  step2Description: {
    id: 'EditChallenge.form.step2.description',
    defaultMessage:
      "You can optionally select how to create tasks for your challenge " +
      "using either an overpass query, a local GeoJSON file or a remote " +
      "GeoJSON file",
  },

  sourceLabel: {
    id: 'EditChallenge.form.source.label',
    defaultMessage: "GeoJSON Source",
  },

  overpassQLLabel: {
    id: 'EditChallenge.form.overpassQL.label',
    defaultMessage: "Overpass API Query",
  },

  overpassQLDescription: {
    id: 'EditChallenge.form.overpassQL.description',
    defaultMessage:
      "Go to " +
      "https://wiki.openstreetmap.org/wiki/Overpass_API/Language_Guide. " +
      "By entering information here it will generate the tasks in the " +
      "background. Please provide a suitable bounding box when inserting " +
      "an overpass query, as this can potentially generate large amounts " +
      "of data and bog the system down.",
  },

  localGeoJsonLabel: {
    id: 'EditChallenge.form.localGeoJson.label',
    defaultMessage: "Upload File",
  },

  localGeoJsonDescription: {
    id: 'EditChallenge.form.localGeoJson.description',
    defaultMessage: "Please upload the local GeoJSON file from your computer",
  },

  remoteGeoJsonLabel: {
    id: 'EditChallenge.form.remoteGeoJson.label',
    defaultMessage: "Remote URL",
  },

  remoteGeoJsonDescription: {
    id: 'EditChallenge.form.remoteGeoJsonn.description',
    defaultMessage: "Remote URL location from which to retrieve the GeoJSON",
  },

  step3Label: {
    id: 'EditChallenge.form.step3.label',
    defaultMessage: "Priorities",
  },

  step3Description: {
    id: 'EditChallenge.form.step3.description',
    defaultMessage:
      "The priority of tasks can be defined by High, Medium and Low. All " +
      "high priority tasks will be shown first, then medium and finally " +
      "low. This can be useful if you have a large number of tasks and wish " +
      "to have certain sets of tasks fixed first.",
  },

  defaultPriorityLabel: {
    id: 'EditChallenge.form.defaultPriority.label',
    defaultMessage: "Default Priority",
  },

  defaultPriorityDescription: {
    id: 'EditChallenge.form.defaultPriority.description',
    defaultMessage: "Default priority level for tasks in this challenge",
  },

  step4Label: {
    id: 'EditChallenge.form.step4.label',
    defaultMessage: "Extra",
  },

  step4Description: {
    id: 'EditChallenge.form.step4.description',
    defaultMessage:
      "Extra information that can be optionally set to give a better " +
      "mapping experience specific to the requirements of the challenge",
  },

  updateTasksLabel: {
    id: 'EditChallenge.form.updateTasks.label',
    defaultMessage: "Update Tasks",
  },

  updateTasksDescription: {
    id: 'EditChallenge.form.updateTasks.description',
    defaultMessage:
      "Periodically delete old, stale (not updated in 7 days) tasks " +
      "still in Created or Skipped state",
  },

  defaultZoomLabel: {
    id: 'EditChallenge.form.defaultZoom.label',
    defaultMessage: "Default Zoom Level",
  },

  defaultZoomDescription: {
    id: 'EditChallenge.form.defaultZoom.description',
    defaultMessage:
      "The default zoom level used when a task is displayed on the map",
  },

  minZoomLabel: {
    id: 'EditChallenge.form.minZoom.label',
    defaultMessage: "Minimum Zoom Level",
  },

  minZoomDescription: {
    id: 'EditChallenge.form.minZoom.description',
    defaultMessage:
      "The minimum allowed zoom level for a task displayed on the map",
  },

  maxZoomLabel: {
    id: 'EditChallenge.form.maxZoom.label',
    defaultMessage: "Maximum Zoom Level",
  },

  maxZoomDescription: {
    id: 'EditChallenge.form.maxZoom.description',
    defaultMessage:
      "The maximum allowed zoom level for a task displayed on the map",
  },

  defaultBasemapLabel: {
    id: 'EditChallenge.form.defaultBasemap.label',
    defaultMessage: "Challenge Basemap",
  },

  defaultBasemapDescription: {
    id: 'EditChallenge.form.defaultBasemap.description',
    defaultMessage:
      "The default basemap to use for the challenge, overriding any " +
      "user settings that define a default basemap",
  },
})
