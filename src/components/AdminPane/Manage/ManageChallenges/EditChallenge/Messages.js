import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with EditChallenge
 */
export default defineMessages({
  cancelLabel: {
    id: "Admin.EditChallenge.controls.cancel.label",
    defaultMessage: "Abandon Changes",
  },

  cancelNewChallengeLabel: {
    id: "Admin.EditChallenge.controls.cancelNewChallenge.label",
    defaultMessage: "Abandon Challenge",
  },

  editChallenge: {
    id: "Admin.EditChallenge.edit.header",
    defaultMessage: "Edit",
  },

  cloneChallenge: {
    id: "Admin.EditChallenge.clone.header",
    defaultMessage: "Clone",
  },

  newChallenge: {
    id: "Admin.EditChallenge.new.header",
    defaultMessage: "New Challenge",
  },

  lineNumber: {
    id: "Admin.EditChallenge.lineNumber",
    defaultMessage: "Line {line, number}: ",
  },

  addMRTagsPlaceholder: {
    id: "Admin.EditChallenge.form.addMRTags.placeholder",
    defaultMessage: "Add MR Tags",
  },

  step1Label: {
    id: "Admin.EditChallenge.form.step1.label",
    defaultMessage: "General",
  },

  visibleLabel: {
    id: "Admin.EditChallenge.form.visible.label",
    defaultMessage: "Discoverable",
  },

  visibleDescription: {
    id: "Admin.EditChallenge.form.visible.description",
    defaultMessage:
      "Allow your challenge to be easily discoverable by " +
      "other users via Find Challenges (subject to project discoverability). " +
      "Note that all challenges are considered public and, even when " +
      "Discoverable is off, users can still view your challenge if they " +
      "have a direct link to it.",
  },

  nameLabel: {
    id: "Admin.EditChallenge.form.name.label",
    defaultMessage: "Name of your Challenge",
  },

  emailLabel: {
    id: "Admin.EditChallenge.form.email.label",
    defaultMessage: "Email Address",
  },

  nameDescription: {
    id: "Admin.EditChallenge.form.name.description",
    defaultMessage:
      "Your Challenge name as it will appear in many places " +
      "throughout MapRoulette. This is also what your challenge will be " +
      "searchable by using the Search box. This field is required, must be " +
      "unique, and only supports plain text.",
  },

  emailDescription: {
    id: "Admin.EditChallenge.form.email.description",
    defaultMessage:
      "Please provide an email for mappers to contact you with feedback",
  },

  descriptionLabel: {
    id: "Admin.EditChallenge.form.description.label",
    defaultMessage: "Description of your Challenge",
  },

  descriptionDescription: {
    id: "Admin.EditChallenge.form.description.description",
    defaultMessage:
      "The description of your challenge " +
      "is shown to users when they click on the challenge to learn more about " +
      "it.\n\nYour description should provide mappers with enough detail to " +
      "decide whether or not to try working on your challenge. This field " +
      "supports Markdown.",
  },

  blurbLabel: {
    id: "Admin.EditChallenge.form.blurb.label",
    defaultMessage: "Blurb",
  },

  blurbDescription: {
    id: "Admin.EditChallenge.form.blurb.description",
    defaultMessage:
      "A very brief description of your challenge suitable for " +
      "small spaces, such as a map marker popup. This field supports Markdown.",
  },

  instructionLabel: {
    id: "Admin.EditChallenge.form.instruction.label",
    defaultMessage: "Detailed Instructions for Mappers",
  },

  instructionDescription: {
    id: "Admin.EditChallenge.form.instruction.description",
    defaultMessage:
      "The instruction tells a mapper how to resolve a Task in " +
      "your Challenge. This is what mappers see in the Instructions box every time " +
      "a task is loaded, and is the primary piece of information for the mapper " +
      "about how to solve the task, so think about this field carefully. You can " +
      "include links to the OSM wiki or any other hyperlink if you want, because " +
      "this field supports Markdown. You can also reference feature properties " +
      "from your GeoJSON with simple mustache tags: e.g. `'{{address}}'` would be " +
      "replaced with the value of the `address` property, allowing for basic " +
      "customization of instructions for each task. This field is required.",
  },

  addMustachePreviewNote: {
    id: "Form.controls.addMustachePreview.note",
    defaultMessage:
      "Note: all mustache property tags evaluate to empty in preview",
  },

  checkinCommentLabel: {
    id: "Admin.EditChallenge.form.checkinComment.label",
    defaultMessage: "Changeset Description",
  },

  checkinCommentDescription: {
    id: "Admin.EditChallenge.form.checkinComment.description",
    defaultMessage:
      "Comment to be associated with changes made by users in editor",
  },

  checkinSourceLabel: {
    id: "Admin.EditChallenge.form.checkinSource.label",
    defaultMessage: "Changeset Source",
  },

  checkinSourceDescription: {
    id: "Admin.EditChallenge.form.checkinSource.description",
    defaultMessage:
      "Source to be associated with changes made by users in editor",
  },

  includeCheckinHashtagTrueLabel: {
    id: "Admin.EditChallenge.form.includeCheckinHashtag.value.true.label",
    defaultMessage:
      "Automatically append `#maproulette` hashtag (highly recommended)",
  },

  includeCheckinHashtagFalseLabel: {
    id: "Admin.EditChallenge.form.includeCheckinHashtag.value.false.label",
    defaultMessage: "Skip hashtag",
  },

  includeCheckinHashtagDescription: {
    id: "Admin.EditChallenge.form.includeCheckinHashtag.description",
    defaultMessage:
      "Allowing the hashtag to be appended to changeset comments " +
      "is very useful for changeset analysis.",
  },

  difficultyLabel: {
    id: "Admin.EditChallenge.form.difficulty.label",
    defaultMessage: "Difficulty of your Tasks",
  },

  difficultyDescription: {
    id: "Admin.EditChallenge.form.difficulty.description",
    defaultMessage:
      "Indicate to mappers what experience level is required to " +
      "complete tasks in your Challenge.",
  },

  categoryLabel: {
    id: "Admin.EditChallenge.form.category.label",
    defaultMessage: "How should your Challenge be Categorized?",
  },

  categoryDescription: {
    id: "Admin.EditChallenge.form.category.description",
    defaultMessage:
      "Selecting an appropriate category for your " +
      "challenge can help users discover challenges that " +
      "match their interests. Choose the Other category if nothing seems " +
      "appropriate.",
  },

  additionalKeywordsLabel: {
    id: "Admin.EditChallenge.form.additionalKeywords.label",
    defaultMessage: "Additional Categorization Keywords",
  },

  additionalKeywordsDescription: {
    id: "Admin.EditChallenge.form.additionalKeywords.description",
    defaultMessage:
      "You can optionally provide additional " +
      "keywords that can be used to aid discovery of your challenge.",
  },

  preferredTagsLabel: {
    id: "Admin.EditChallenge.form.preferredTags.label",
    defaultMessage: "Preferred MR Tags",
  },

  preferredTagsDescription: {
    id: "Admin.EditChallenge.form.preferredTags.description",
    defaultMessage:
      "You can optionally provide a list of " +
      "preferred tags that you want the user to use when completing a task.",
  },

  preferredReviewTagsLabel: {
    id: "Admin.EditChallenge.form.preferredReviewTags.label",
    defaultMessage: "Preferred MR Review Tags",
  },

  preferredReviewTagsDescription: {
    id: "Admin.EditChallenge.form.preferredReviewTags.description",
    defaultMessage:
      "You can optionally provide a list of " +
      "preferred tags that you want the reviewer to use when reviewing a task.",
  },

  limitTagsDescription: {
    id: "Admin.EditChallenge.form.limitTags.description",
    defaultMessage: "Allow other tags during task completion?",
  },

  limitReviewTagsDescription: {
    id: "Admin.EditChallenge.form.limitReviewTags.description",
    defaultMessage: "Allow other tags during task review?",
  },

  featuredLabel: {
    id: "Admin.EditChallenge.form.featured.label",
    defaultMessage: "Featured",
  },

  featuredDescription: {
    id: "Admin.EditChallenge.form.featured.description",
    defaultMessage:
      "Featured challenges are shown at the top of the list " +
      "when browsing and searching challenges. Only super-users may mark a " +
      "challenge as featured.",
  },

  step2Label: {
    id: "Admin.EditChallenge.form.step2.label",
    defaultMessage: "GeoJSON Source",
  },

  dataSourceDescription: {
    id: "Admin.EditChallenge.form.step2.description",
    defaultMessage: `
Every Task in MapRoulette consists of a geometry: a point, line or polygon
indicating on the map what it is that you want the mapper to evaluate.
This screen lets you define the Tasks for your Challenge by telling MapRoulette
about the geometries.

There are three ways to feed geometries into your challenge: an Overpass
query, a GeoJSON file on your computer, or with a URL pointing to a GeoJSON
file on the internet.

#### Overpass

Overpass is a powerful querying interface for OpenStreetMap data. Using
[Overpass QL](https://wiki.openstreetmap.org/wiki/Overpass_API/Language_Guide),
the Overpass Query Language, you can retrieve matching OSM objects that you want
to represent as tasks (each result becomes a separate task).
[Learn more](https://learn.maproulette.org/documentation/using-overpass-to-create-challenges/).

#### Local GeoJSON File

A common option is to use a GeoJSON file you already have. This could be great
if you have an approved source of external data you would like to manually add
to OSM. Tools like
[QGIS](https://gis.stackexchange.com/questions/91812/convert-shapefiles-to-geojson)
and [gdal](http://www.gdal.org/drv_geojson.html) can convert things like
Shapefiles to GeoJSON. When you convert, make sure that you use unprojected
lon/lat on the WGS84 datum (EPSG:4326), because this is what MapRoulette uses
internally.

> Note: for challenges with a large number of tasks, we recommend using a
[line-by-line](https://learn.maproulette.org/documentation/line-by-line-geojson/)
format instead, which is much more efficient to process. Some advanced features
are only available when the line-by-line format is used.

#### Remote GeoJSON URL

The only difference between using a local GeoJSON file and a URL is where you
tell MapRoulette to get it from. If you use a URL, make sure you point to the
raw GeoJSON file, not a page that contains a link to the file, or MapRoulette
will not be able to make sense of it.
    `,
  },

  sourceLabel: {
    id: "Admin.EditChallenge.form.source.label",
    defaultMessage: "Location of your Task Data",
  },

  overpassQLLabel: {
    id: "Admin.EditChallenge.form.overpassQL.label",
    defaultMessage: "I want to provide an Overpass query",
  },

  overpassQLDescription: {
    id: "Admin.EditChallenge.form.overpassQL.description",
    defaultMessage:
      "Please see the " +
      "[docs](https://learn.maproulette.org/documentation/using-overpass-to-create-challenges/) " +
      "for important details and common pitfalls when creating challenges " +
      "using Overpass queries.",
  },

  overpassQLPlaceholder: {
    id: "Admin.EditChallenge.form.overpassQL.placeholder",
    defaultMessage: "Enter Overpass API query here...",
  },

  overpassQLReadOnly: {
    id: "Admin.EditChallenge.form.overpassQL.readOnly",
    defaultMessage:
      "Overpass queries cannot be edited, but you can choose Rebuild Tasks when " +
      "managing your challenge to re-execute the query and freshen up your tasks.",
  },

  overpassTargetType: {
    id: "Admin.EditChallenge.form.overpassQL.targetType",
    defaultMessage: "Overpass Target Type",
  },

  overpassTargetDescription: {
    id: "Admin.EditChallenge.form.overpassQL.targetType.description",
    defaultMessage:
      "An error will be generated if your Overpass results do not match the target type.",
  },

  targetNoneLabel: {
    id: "Admin.EditChallenge.form.overpassQL.target.none",
    defaultMessage: "Any",
  },

  targetWayLabel: {
    id: "Admin.EditChallenge.form.overpassQL.target.way",
    defaultMessage: "Ways",
  },

  targetNodeLabel: {
    id: "Admin.EditChallenge.form.overpassQL.target.node",
    defaultMessage: "Nodes",
  },

  localGeoJsonLabel: {
    id: "Admin.EditChallenge.form.localGeoJson.label",
    defaultMessage: "I want to upload a GeoJSON file",
  },

  localGeoJsonDescription: {
    id: "Admin.EditChallenge.form.localGeoJson.description",
    defaultMessage: "Please upload the local GeoJSON file from your computer",
  },

  localGeoJsonReadOnly: {
    id: "Admin.EditChallenge.form.localGeoJson.readOnly",
    defaultMessage:
      "If you need to upload fresh GeoJSON, choose Rebuild Tasks " +
      "when managing your challenge.",
  },

  remoteGeoJsonLabel: {
    id: "Admin.EditChallenge.form.remoteGeoJson.label",
    defaultMessage: "I have a URL to the GeoJSON data",
  },

  remoteGeoJsonDescription: {
    id: "Admin.EditChallenge.form.remoteGeoJson.description",
    defaultMessage: "Remote URL location from which to retrieve the GeoJSON",
  },

  remoteGeoJsonPlaceholder: {
    id: "Admin.EditChallenge.form.remoteGeoJson.placeholder",
    defaultMessage: "https://www.example.com/geojson.json",
  },

  remoteGeoJsonReadOnly: {
    id: "Admin.EditChallenge.form.remoteGeoJson.readOnly",
    defaultMessage:
      "Remote URLs cannot be edited, but you can choose Rebuild Tasks " +
      "when managing your challenge to re-download updated remote GeoJSON and freshen " +
      "up your tasks.",
  },

  dataOriginDateLabel: {
    id: "Admin.EditChallenge.form.dataOriginDate.label",
    defaultMessage: "Date that data was sourced",
  },

  dataOriginDateDescription: {
    id: "Admin.EditChallenge.form.dataOriginDate.description",
    defaultMessage:
      "Age of the data. The date the data was " +
      "downloaded, generated, etc. ",
  },

  ignoreSourceErrorsLabel: {
    id: "Admin.EditChallenge.form.ignoreSourceErrors.label",
    defaultMessage: "Ignore Errors",
  },

  ignoreSourceErrorsDescription: {
    id: "Admin.EditChallenge.form.ignoreSourceErrors.description",
    defaultMessage:
      "Proceed despite detected errors in source data. " +
      "Only expert users who fully understand the implications should " +
      "attempt this.",
  },

  step3Label: {
    id: "Admin.EditChallenge.form.step3.label",
    defaultMessage: "Priorities",
  },

  step3Description: {
    id: "Admin.EditChallenge.form.step3.description",
    defaultMessage:
      "The priority of tasks can be defined as High, Medium and Low. All " +
      "high priority tasks will be offered to users first when working " +
      "through a challenge, followed by medium and finally low priority " +
      "tasks. Each task’s priority is assigned automatically based on " +
      "the rules you specify below, each of which is evaluated against the " +
      "task’s feature properties (OSM tags if you are using an Overpass " +
      "query, otherwise whatever properties you’ve chosen to include in " +
      "your GeoJSON). Tasks that don’t pass any rules will be assigned " +
      "the default priority.",
  },

  defaultPriorityLabel: {
    id: "Admin.EditChallenge.form.defaultPriority.label",
    defaultMessage: "Default Priority",
  },

  defaultPriorityDescription: {
    id: "Admin.EditChallenge.form.defaultPriority.description",
    defaultMessage:
      "See the " +
      "[docs](https://learn.maproulette.org/documentation/task-priority-rules/) " +
      "for an explanation of how to setup priority rules.",
  },

  highPriorityRulesLabel: {
    id: "Admin.EditChallenge.form.highPriorityRules.label",
    defaultMessage: "High Priority Rules",
  },

  mediumPriorityRulesLabel: {
    id: "Admin.EditChallenge.form.mediumPriorityRules.label",
    defaultMessage: "Medium Priority Rules",
  },

  lowPriorityRulesLabel: {
    id: "Admin.EditChallenge.form.lowPriorityRules.label",
    defaultMessage: "Low Priority Rules",
  },

  step4Label: {
    id: "Admin.EditChallenge.form.step4.label",
    defaultMessage: "Extra",
  },

  step4Description: {
    id: "Admin.EditChallenge.form.step4.description",
    defaultMessage:
      "Extra information that can be optionally set to give a better " +
      "mapping experience specific to the requirements of the challenge",
  },

  updateTasksLabel: {
    id: "Admin.EditChallenge.form.updateTasks.label",
    defaultMessage: "Remove Stale Tasks",
  },

  updateTasksDescription: {
    id: "Admin.EditChallenge.form.updateTasks.description",
    defaultMessage:
      "Periodically delete old, stale (not updated in ~30 days) tasks " +
      "still in Created or Skipped state. This can be useful if you are " +
      "refreshing your challenge tasks on a regular basis and wish to have " +
      "old ones periodically removed for you. Most of the time you will " +
      "want to leave this set to No.",
  },

  defaultZoomLabel: {
    id: "Admin.EditChallenge.form.defaultZoom.label",
    defaultMessage: "Default Zoom Level",
  },

  defaultZoomDescription: {
    id: "Admin.EditChallenge.form.defaultZoom.description",
    defaultMessage:
      "When a user begins work on a task, MapRoulette will " +
      "attempt to automatically use a zoom level that fits the bounds of the " +
      "task’s feature. But if that’s not possible, then this default zoom level " +
      "will be used. It should be set to a level is generally suitable for " +
      "working on most tasks in your challenge.",
  },

  minZoomLabel: {
    id: "Admin.EditChallenge.form.minZoom.label",
    defaultMessage: "Minimum Zoom Level",
  },

  minZoomDescription: {
    id: "Admin.EditChallenge.form.minZoom.description",
    defaultMessage:
      "The minimum allowed zoom level for your challenge. " +
      "This should be set to a level that allows the user to sufficiently " +
      "zoom out to work on tasks while keeping them from zooming out to " +
      "a level that isn’t useful.",
  },

  maxZoomLabel: {
    id: "Admin.EditChallenge.form.maxZoom.label",
    defaultMessage: "Maximum Zoom Level",
  },

  maxZoomDescription: {
    id: "Admin.EditChallenge.form.maxZoom.description",
    defaultMessage:
      "The maximum allowed zoom level for your challenge. " +
      "This should be set to a level that allows the user to sufficiently " +
      "zoom in to work on the tasks while keeping them from zooming in " +
      "to a level that isn’t useful or exceeds the available resolution " +
      "of the map/imagery in the geographic region.",
  },

  defaultBasemapLabel: {
    id: "Admin.EditChallenge.form.defaultBasemap.label",
    defaultMessage: "Challenge Basemap",
  },

  defaultBasemapDescription: {
    id: "Admin.EditChallenge.form.defaultBasemap.description",
    defaultMessage:
      "The default basemap to use for the challenge, overriding any " +
      "user settings that define a default basemap",
  },

  customBasemapLabel: {
    id: "Admin.EditChallenge.form.customBasemap.label",
    defaultMessage: "Custom Basemap",
  },

  customBasemapDescription: {
    id: "Admin.EditChallenge.form.customBasemap.description",
    defaultMessage:
      "Insert a custom base map URL here. E.g. `https://'{s}'.tile.openstreetmap.org/'{z}'/'{x}'/'{y}'.png`",
  },

  exportablePropertiesLabel: {
    id: "Admin.EditChallenge.form.exportableProperties.label",
    defaultMessage: "Properties to export in CSV",
  },

  exportablePropertiesDescription: {
    id: "Admin.EditChallenge.form.exportableProperties.description",
    defaultMessage:
      "Any properties included in this comma separated list " +
      "will be exported as a column in the CSV export and populated with the " +
      "first matching feature property from each task.",
  },

  taskBundleIdPropertyLabel: {
    id: "Admin.EditChallenge.form.taskBundlePropertyId.label",
    defaultMessage: "Task Bundle Id Property",
  },

  taskBundleIdPropertyOverpassWarning: {
    id: "Admin.EditChallenge.form.taskBundlePropertyId.overpassWarning",
    defaultMessage:
      "Currently not available for Overpass queries. Please select a different data location to use this feature.",
  },

  taskBundleIdPropertyHelp: {
    id: "Admin.EditChallenge.form.taskBundlePropertyId.help",
    defaultMessage:
      "The name of the task feature property to treat as " +
      "a bundle ID for related tasks. " +
      "Tasks without this property will remain as isolated tasks. " +
      "Please note that this feature currently does not work with Overpass queries.",
  },

  osmIdPropertyLabel: {
    id: "Admin.EditChallenge.form.osmIdProperty.label",
    defaultMessage: "OSM/External Id Property",
  },

  osmIdPropertyDescription: {
    id: "Admin.EditChallenge.form.osmIdProperty.description",
    defaultMessage:
      "The name of the task feature property to treat as an " +
      "OpenStreetMap element id for tasks. If left blank, " +
      "MapRoulette will fall back to checking a series of common id properties, " +
      "including those used by Overpass. If specified, **be sure that it has a " +
      "unique value for each feature in your data**. Tasks missing the " +
      "property will be assigned a random identifier even if the task " +
      "contains other common id properties. " +
      "[Learn more]" +
      "(https://learn.maproulette.org/documentation/setting-external-task-identifiers/).",
  },

  customTaskStyleLabel: {
    id: "Admin.EditChallenge.form.customTaskStyles.label",
    defaultMessage: "Customize Task Property Styles",
  },

  customTaskStylesDescription: {
    id: "Admin.EditChallenge.form.customTaskStyles.description",
    defaultMessage:
      "Enable custom task styling based on specific task feature properties.",
  },

  customTaskStylesError: {
    id: "Admin.EditChallenge.form.customTaskStyles.error",
    defaultMessage:
      "Task property style rules are invalid. Please fix before continuing.",
  },

  customTaskStyleButton: {
    id: "Admin.EditChallenge.form.customTaskStyles.button",
    defaultMessage: "Configure",
  },

  customTaskStyleDefaultLabel: {
    id: "Admin.EditChallenge.form.customTaskStyles.controls.default.label",
    defaultMessage: "Default",
  },

  customTaskStyleCustomLabel: {
    id: "Admin.EditChallenge.form.customTaskStyles.controls.custom.label",
    defaultMessage: "Custom",
  },

  taskPropertyStylesLabel: {
    id: "Admin.EditChallenge.form.taskPropertyStyles.label",
    defaultMessage: "Task Property Style Rules",
  },

  taskPropertyStylesClose: {
    id: "Admin.EditChallenge.form.taskPropertyStyles.close",
    defaultMessage: "Done",
  },

  taskPropertyStylesClear: {
    id: "Admin.EditChallenge.form.taskPropertyStyles.clear",
    defaultMessage: "Clear",
  },

  taskPropertyStylesDescription: {
    id: "Admin.EditChallenge.form.taskPropertyStyles.description",
    defaultMessage: "Sets up task property style rules......",
  },

  requiresLocalLabel: {
    id: "Admin.EditChallenge.form.requiresLocal.label",
    defaultMessage: "Requires Local Knowledge",
  },

  requiresLocalDescription: {
    id: "Admin.EditChallenge.form.requiresLocal.description",
    defaultMessage:
      "Tasks require local or on-the-ground knowledge to complete." +
      " Note: challenge will not appear in the Find Challenges list.",
  },

  presetsLabel: {
    id: "Admin.EditChallenge.form.presets.label",
    defaultMessage: "Restrict iD Editor Presets",
  },

  presetsDescription: {
    id: "Admin.EditChallenge.form.presets.description",
    defaultMessage:
      "Restrict the types of OSM features presented to mappers " +
      "in iD by default when working on your tasks, helping to keep them focused on " +
      "mapping things relevant to your challenge. For example, if your challenge " +
      "is about mapping buildings, you could enable only presets related to buildings " +
      "and then mappers would not be presented with the option to map an area as, say, " +
      "a park or a lake.",
  },

  showLongformTooltip: {
    id: "Admin.EditChallenge.controls.showLongform.tooltip",
    defaultMessage: "Show all fields",
  },

  showStepsTooltip: {
    id: "Admin.EditChallenge.controls.showSteps.tooltip",
    defaultMessage: "Show separate steps",
  },

  contactInfoStepHeader: {
    id: "Admin.EditChallenge.form.steps.contactInfo.header",
    defaultMessage: "Contact Information",
  },

  dataSourceStepHeader: {
    id: "Admin.EditChallenge.form.steps.dataSource.header",
    defaultMessage: "Name and Data Source",
  },

  dataSourceStepDescription: {
    id: "Admin.EditChallenge.form.steps.dataSource.description",
    defaultMessage: "Change Name or Data Source",
  },

  descriptionStepHeader: {
    id: "Admin.EditChallenge.form.steps.description.header",
    defaultMessage: "Description and Category",
  },

  descriptionStepDescription: {
    id: "Admin.EditChallenge.form.steps.description.description",
    defaultMessage: "Change Description or Category",
  },

  instructionsStepHeader: {
    id: "Admin.EditChallenge.form.steps.instructions.header",
    defaultMessage: "Instructions and Difficulty",
  },

  instructionsStepDescription: {
    id: "Admin.EditChallenge.form.steps.instructions.description",
    defaultMessage: "Change Instructions or Difficulty",
  },

  discoverabilityStepHeader: {
    id: "Admin.EditChallenge.form.steps.discoverability.header",
    defaultMessage: "Discoverability",
  },

  discoverabilityStepDescription: {
    id: "Admin.EditChallenge.form.steps.discoverability.description",
    defaultMessage: "Adjust discoverability settings",
  },

  prioritiesStepHeader: {
    id: "Admin.EditChallenge.form.steps.priorities.header",
    defaultMessage: "Task Prioritization Rules",
  },

  prioritiesStepDescription: {
    id: "Admin.EditChallenge.form.steps.priorities.description",
    defaultMessage: "Setup task prioritization rules",
  },

  zoomStepHeader: {
    id: "Admin.EditChallenge.form.steps.zoom.header",
    defaultMessage: "Zoom Levels",
  },

  zoomStepDescription: {
    id: "Admin.EditChallenge.form.steps.zoom.description",
    defaultMessage: "Configure map zoom levels",
  },

  osmCommitStepHeader: {
    id: "Admin.EditChallenge.form.steps.osmCommit.header",
    defaultMessage: "OSM Changeset Info",
  },

  osmCommitStepDescription: {
    id: "Admin.EditChallenge.form.steps.osmCommit.description",
    defaultMessage: "Customize OSM changeset info",
  },

  changesetUrlTitle: {
    id: "Admin.EditChallenge.form.steps.changesetUrl.title",
    defaultMessage:
      "Add Changeset URL",
  },

  changesetUrlDescription: {
    id: "Admin.EditChallenge.form.steps.changesetUrl.description",
    defaultMessage:
      "Automatically append challenge link to the changeset comment",
  },

  basemapStepHeader: {
    id: "Admin.EditChallenge.form.steps.basemap.header",
    defaultMessage: "Basemap",
  },

  basemapStepDescription: {
    id: "Admin.EditChallenge.form.steps.basemap.description",
    defaultMessage: "Set a different basemap",
  },

  propertiesStepHeader: {
    id: "Admin.EditChallenge.form.steps.properties.header",
    defaultMessage: "Property-based Behavior",
  },

  propertiesStepDescription: {
    id: "Admin.EditChallenge.form.steps.properties.description",
    defaultMessage: "Configure property-based behavior",
  },

  tagsStepHeader: {
    id: "Admin.EditChallenge.form.steps.tags.header",
    defaultMessage: "Preferred MR tags",
  },

  tagsStepDescription: {
    id: "Admin.EditChallenge.form.steps.tags.description",
    defaultMessage: "Setup preferred MR tags",
  },

  editorStepHeader: {
    id: "Admin.EditChallenge.form.steps.editor.header",
    defaultMessage: "Editor Configuration",
  },

  editorStepDescription: {
    id: "Admin.EditChallenge.form.steps.editor.description",
    defaultMessage: "Customize Editor Settings",
  },

  advancedOptionsStepDescription: {
    id: "Admin.EditChallenge.form.steps.advancedOptions.description",
    defaultMessage: "Advanced Options",
  },

  advancedOptionsStepIntro: {
    id: "Admin.EditChallenge.form.steps.advancedOptions.intro",
    defaultMessage:
      "Most challenges work well with the default settings, " +
      "but you can optionally customize any of the following advanced options",
  },

  allOptionsStepDescription: {
    id: "Admin.EditChallenge.form.steps.allOptions.description",
    defaultMessage: "Options",
  },

  yesLabel: {
    id: "Admin.EditChallenge.form.steps.yes.label",
    defaultMessage: "Yes",
  },

  noLabel: {
    id: "Admin.EditChallenge.form.steps.no.label",
    defaultMessage: "No",
  },
});
