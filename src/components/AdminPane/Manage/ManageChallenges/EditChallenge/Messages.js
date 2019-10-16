import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with EditChallenge
 */
export default defineMessages({
  editChallenge: {
    id: 'Admin.EditChallenge.edit.header',
    defaultMessage: "Edit",
  },

  cloneChallenge: {
    id: 'Admin.EditChallenge.clone.header',
    defaultMessage: "Clone",
  },

  newChallenge: {
    id: 'Admin.EditChallenge.new.header',
    defaultMessage: "New Challenge",
  },

  lineNumber: {
    id: "Admin.EditChallenge.lineNumber",
    defaultMessage: "Line {line, number}: ",
  },

  step1Label: {
    id: 'Admin.EditChallenge.form.step1.label',
    defaultMessage: "General",
  },

  visibleLabel: {
    id: 'Admin.EditChallenge.form.visible.label',
    defaultMessage: "Visible",
  },

  visibleDescription: {
    id: 'Admin.EditChallenge.form.visible.description',
    defaultMessage: "Allow your challenge to be visible and discoverable to " +
      "other users (subject to project visibility). Unless you are really " +
      "confident in creating new Challenges, we would recommend leaving this set " +
      "to No at first, especially if the parent Project had been made visible. " +
      "Setting your Challenge's visibility to Yes will make it appear on the home " +
      "page, in the Challenge search, and in metrics - but only if the parent " +
      "Project is also visible.",
  },

  nameLabel: {
    id: 'Admin.EditChallenge.form.name.label',
    defaultMessage: "Name",
  },

  nameDescription: {
    id: 'Admin.EditChallenge.form.name.description',
    defaultMessage: "Your Challenge name as it will appear in many places " +
      "throughout the application. This is also what your challenge will be " +
      "searchable by using the Search box. This field is required and only " +
      "supports plain text.",
  },

  descriptionLabel: {
    id: 'Admin.EditChallenge.form.description.label',
    defaultMessage: "Description",
  },

  descriptionDescription: {
    id: 'Admin.EditChallenge.form.description.description',
    defaultMessage: "The primary, longer description of your challenge that " +
      "is shown to users when they click on the challenge to learn more about " +
      "it. This field supports Markdown.",
  },

  blurbLabel: {
    id: 'Admin.EditChallenge.form.blurb.label',
    defaultMessage: "Blurb",
  },

  blurbDescription: {
    id: 'Admin.EditChallenge.form.blurb.description',
    defaultMessage: "A very brief description of your challenge suitable for " +
      "small spaces, such as a map marker popup. This field supports Markdown.",
  },

  instructionLabel: {
    id: 'Admin.EditChallenge.form.instruction.label',
    defaultMessage: "Instructions",
  },

  // Note: dummy variable included to workaround react-intl
  // [bug 1158](https://github.com/yahoo/react-intl/issues/1158)
  // Just pass in an empty string for its value
  instructionDescription: {
    id: 'Admin.EditChallenge.form.instruction.description',
    defaultMessage: "The instruction tells a mapper how to resolve a Task in " +
      "your Challenge. This is what mappers see in the Instructions box every time " +
      "a task is loaded, and is the primary piece of information for the mapper " +
      "about how to solve the task, so think about this field carefully. You can " +
      "include links to the OSM wiki or any other hyperlink if you want, because " +
      "this field supports Markdown. You can also reference feature properties " +
      "from your GeoJSON with simple mustache tags: e.g. `\\{\\{address\\}\\}` would be " +
      "replaced with the value of the `address` property, allowing for basic " +
      "customization of instructions for each task. This field is required. {dummy}",
  },

  checkinCommentLabel: {
    id: 'Admin.EditChallenge.form.checkinComment.label',
    defaultMessage: "Changeset Description",
  },

  checkinCommentDescription: {
    id: 'Admin.EditChallenge.form.checkinComment.description',
    defaultMessage: "Comment to be associated with changes made by " +
                    "users in editor",
  },

  checkinSourceLabel: {
    id: 'Admin.EditChallenge.form.checkinSource.label',
    defaultMessage: "Changeset Source",
  },

  checkinSourceDescription: {
    id: 'Admin.EditChallenge.form.checkinSource.description',
    defaultMessage: "Source to be associated with changes made by " +
                    "users in editor",
  },

  includeCheckinHashtagTrueLabel: {
    id: 'Admin.EditChallenge.form.includeCheckinHashtag.value.true.label',
    defaultMessage: "Automatically append #maproulette hashtag (highly recommended)",
  },

  includeCheckinHashtagFalseLabel: {
    id: 'Admin.EditChallenge.form.includeCheckinHashtag.value.false.label',
    defaultMessage: "Skip hashtag",
  },

  includeCheckinHashtagDescription: {
    id: 'Admin.EditChallenge.form.includeCheckinHashtag.description',
    defaultMessage: "Allowing the hashtag to be appended to changeset comments " +
      "is very useful for changeset analysis.",
  },

  difficultyLabel: {
    id: 'Admin.EditChallenge.form.difficulty.label',
    defaultMessage: "Difficulty",
  },

  difficultyDescription: {
    id: 'Admin.EditChallenge.form.difficulty.description',
    defaultMessage: "Choose between Easy, Normal and Expert to give an " +
      "indication to mappers what skill level is required to resolve the " +
      "Tasks in your Challenge. Easy challenges should be suitable for " +
      "beginners with little or experience.",
  },

  categoryLabel: {
    id: 'Admin.EditChallenge.form.category.label',
    defaultMessage: "Category",
  },

  categoryDescription: {
    id: 'Admin.EditChallenge.form.category.description',
    defaultMessage: "Selecting an appropriate high-level category for your " +
      "challenge can aid users in quickly discovering challenges that " +
      "match their interests. Choose the Other category if nothing seems " +
      "appropriate.",
  },

  additionalKeywordsLabel: {
    id: 'Admin.EditChallenge.form.additionalKeywords.label',
    defaultMessage: "Keywords",
  },

  additionalKeywordsDescription: {
    id: 'Admin.EditChallenge.form.additionalKeywords.description',
    defaultMessage: "You can optionally provide additional " +
    "keywords that can be used to aid discovery of your challenge. Users " +
    "can search by keyword from the Other option of the Category dropdown " +
    "filter, or in the Search box by prepending with a hash sign (e.g. " +
    "#tourism).",
  },

  featuredLabel: {
    id: 'Admin.EditChallenge.form.featured.label',
    defaultMessage: "Featured",
  },

  featuredDescription: {
    id: 'Admin.EditChallenge.form.featured.description',
    defaultMessage: "Featured challenges are shown at the top of the list " +
      "when browsing and searching challenges. Only super-users may mark a " +
      "a challenge as featured.",
  },

  step2Label: {
    id: 'Admin.EditChallenge.form.step2.label',
    defaultMessage: "GeoJSON Source",
  },

  step2Description: {
    id: 'Admin.EditChallenge.form.step2.description',
    defaultMessage: `
Every Task in MapRoulette basically consists of a geometry: a point, line or
polygon indicating on the map what it is that you want the mapper to evaluate.
This screen lets you define the Tasks for your Challenge by telling MapRoulette
about the geometries.

There are three ways to feed geometries into your challenge: via an Overpass
query, via a GeoJSON file on your computer, or via a URL pointing to a GeoJSON
file on the internet.

#### Via Overpass

The Overpass API is a powerful querying interface for OpenStreetMap data. It
does not work on the live OSM database, but the data you get from Overpass is
usually just a few minutes old. Using
[Overpass QL](https://wiki.openstreetmap.org/wiki/Overpass_API/Language_Guide),
the Overpass Query Language, you can define exactly which OSM objects you want
to load into your Challenge as Tasks.
[Learn more](https://github.com/maproulette/maproulette2/wiki/Introducing-New-MapRoulette---Part-1.-Creating-and-Maintaining-Challenges#via-overpass).

#### Via Local GeoJSON File

The other option is to use a GeoJSON file you already have. This could be great
if you have an approved source of external data you would like to manually add
to OSM. Tools like
[QGIS](https://gis.stackexchange.com/questions/91812/convert-shapefiles-to-geojson)
and [gdal](http://www.gdal.org/drv_geojson.html) can convert things like
Shapefiles to GeoJSON.  When you convert, make sure that you use unprojected
lon/lat on the WGS84 datum (EPSG:4326), because this is what MapRoulette uses
internally.

> Note: for challenges with a large number of tasks, we recommend using a
[line-by-line](https://github.com/osmlab/maproulette3/wiki/Line-by-Line-GeoJSON-Format)
format instead, which is much less memory-intensive to process.

#### Via Remote GeoJSON URL

The only difference between using a local GeoJSON file and a URL is where you
tell MapRoulette to get it from. If you use a URL, make sure you point to the
raw GeoJSON file, not a page that contains a link to the file, or MapRoulette
will not be able to make sense of it.
    `,
  },

  sourceLabel: {
    id: 'Admin.EditChallenge.form.source.label',
    defaultMessage: "GeoJSON Source",
  },

  overpassQLLabel: {
    id: 'Admin.EditChallenge.form.overpassQL.label',
    defaultMessage: "Overpass API Query",
  },

  overpassQLDescription: {
    id: 'Admin.EditChallenge.form.overpassQL.description',
    defaultMessage: "Please provide a suitable bounding box when inserting " +
      "an overpass query, as this can potentially generate large amounts " +
      "of data and bog the system down."
  },

  overpassQLPlaceholder: {
    id: 'Admin.EditChallenge.form.overpassQL.placeholder',
    defaultMessage: "Enter Overpass API query here...",
  },

  localGeoJsonLabel: {
    id: 'Admin.EditChallenge.form.localGeoJson.label',
    defaultMessage: "Upload File",
  },

  localGeoJsonDescription: {
    id: 'Admin.EditChallenge.form.localGeoJson.description',
    defaultMessage: "Please upload the local GeoJSON file from your computer",
  },

  remoteGeoJsonLabel: {
    id: 'Admin.EditChallenge.form.remoteGeoJson.label',
    defaultMessage: "Remote URL",
  },

  remoteGeoJsonDescription: {
    id: 'Admin.EditChallenge.form.remoteGeoJson.description',
    defaultMessage: "Remote URL location from which to retrieve the GeoJSON",
  },

  remoteGeoJsonPlaceholder: {
    id: 'Admin.EditChallenge.form.remoteGeoJson.placeholder',
    defaultMessage: "https://www.example.com/geojson.json",
  },

  dataOriginDateLabel: {
    id: 'Admin.EditChallenge.form.dataOriginDate.label',
    defaultMessage: "Date data was sourced",
  },

  dataOriginDateDescription: {
    id: 'Admin.EditChallenge.form.dataOriginDate.description',
    defaultMessage: "Age of the data. The date the data was " +
                    "downloaded, generated, etc. "
  },

  ignoreSourceErrorsLabel: {
    id: 'Admin.EditChallenge.form.ignoreSourceErrors.label',
    defaultMessage: "Ignore Errors",
  },

  ignoreSourceErrorsDescription: {
    id: 'Admin.EditChallenge.form.ignoreSourceErrors.description',
    defaultMessage: "Proceed despite detected errors in source data. " +
      "Only expert users who fully understand the implications should " +
      "attempt this.",
  },

  step3Label: {
    id: 'Admin.EditChallenge.form.step3.label',
    defaultMessage: "Priorities",
  },

  step3Description: {
    id: 'Admin.EditChallenge.form.step3.description',
    defaultMessage:
      "The priority of tasks can be defined as High, Medium and Low. All " +
      "high priority tasks will be offered to users first when working " +
      "through a challenge, followed by medium and finally low priority " +
      "tasks. Each task's priority is assigned automatically based on " +
      "the rules you specify below, each of which is evaluated against the " +
      "task's feature properties (OSM tags if you are using an Overpass " +
      "query, otherwise whatever properties you've chosen to include in " +
      "your GeoJSON). Tasks that don't pass any rules will be assigned " +
      "the default priority.",
  },

  defaultPriorityLabel: {
    id: 'Admin.EditChallenge.form.defaultPriority.label',
    defaultMessage: "Default Priority",
  },

  defaultPriorityDescription: {
    id: 'Admin.EditChallenge.form.defaultPriority.description',
    defaultMessage: "Default priority level for tasks in this challenge",
  },

  step4Label: {
    id: 'Admin.EditChallenge.form.step4.label',
    defaultMessage: "Extra",
  },

  step4Description: {
    id: 'Admin.EditChallenge.form.step4.description',
    defaultMessage:
      "Extra information that can be optionally set to give a better " +
      "mapping experience specific to the requirements of the challenge",
  },

  updateTasksLabel: {
    id: 'Admin.EditChallenge.form.updateTasks.label',
    defaultMessage: "Remove Stale Tasks",
  },

  updateTasksDescription: {
    id: 'Admin.EditChallenge.form.updateTasks.description',
    defaultMessage:
      "Periodically delete old, stale (not updated in ~30 days) tasks " +
      "still in Created or Skipped state. This can be useful if you are " +
      "refreshing your challenge tasks on a regular basis and wish to have " +
      "old ones periodically removed for you. Most of the time you will " +
      "want to leave this set to No."
  },

  defaultZoomLabel: {
    id: 'Admin.EditChallenge.form.defaultZoom.label',
    defaultMessage: "Default Zoom Level",
  },

  defaultZoomDescription: {
    id: 'Admin.EditChallenge.form.defaultZoom.description',
    defaultMessage: "When a user begins work on a task, MapRoulette will " +
      "attempt to automatically use a zoom level that fits the bounds of the " +
      "task's feature. But if that's not possible, then this default zoom level " +
      "will be used. It should be set to a level is generally suitable for " +
      "working on most tasks in your challenge.",
  },

  minZoomLabel: {
    id: 'Admin.EditChallenge.form.minZoom.label',
    defaultMessage: "Minimum Zoom Level",
  },

  minZoomDescription: {
    id: 'Admin.EditChallenge.form.minZoom.description',
    defaultMessage: "The minimum allowed zoom level for your challenge. " +
      "This should be set to a level that allows the user to sufficiently " +
      "zoom out to work on tasks while keeping them from zooming out to " +
      "a level that isn't useful.",
  },

  maxZoomLabel: {
    id: 'Admin.EditChallenge.form.maxZoom.label',
    defaultMessage: "Maximum Zoom Level",
  },

  maxZoomDescription: {
    id: 'Admin.EditChallenge.form.maxZoom.description',
    defaultMessage: "The maximum allowed zoom level for your challenge. " +
      "This should be set to a level that allows the user to sufficiently " +
      "zoom in to work on the tasks while keeping them from zooming in " +
      "to a level that isn't useful or exceeds the available resolution " +
      "of the map/imagery in the geographic region.",
  },

  defaultBasemapLabel: {
    id: 'Admin.EditChallenge.form.defaultBasemap.label',
    defaultMessage: "Challenge Basemap",
  },

  defaultBasemapDescription: {
    id: 'Admin.EditChallenge.form.defaultBasemap.description',
    defaultMessage:
      "The default basemap to use for the challenge, overriding any " +
      "user settings that define a default basemap",
  },

  customBasemapLabel: {
    id: "Admin.EditChallenge.form.customBasemap.label",
    defaultMessage: "Custom Basemap",
  },

  // Note: dummy variable included to workaround react-intl
  // [bug 1158](https://github.com/yahoo/react-intl/issues/1158)
  // Just pass in an empty string for its value
  customBasemapDescription: {
    id: "Admin.EditChallenge.form.customBasemap.description",
    defaultMessage: "Insert a custom base map URL here. E.g. `https://\\{s\\}.tile.openstreetmap.org/\\{z\\}/\\{x\\}/\\{y\\}.png` {dummy}",
  },

  exportablePropertiesLabel: {
    id: 'Admin.EditChallenge.form.exportableProperties.label',
    defaultMessage: "Properties to export in CSV",
  },

  exportablePropertiesDescription: {
    id: 'Admin.EditChallenge.form.exportableProperties.description',
    defaultMessage: "Any properties included in this comma separated list " +
      "will be exported as a column in the CSV export and populated with the " +
      "first matching feature property from each task.",
  },
})
