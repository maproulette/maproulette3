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
    defaultMessage: "Allow your challenge to be visible and discoverable to " +
      "other users (subject to project visibility). Unless you are really " +
      "confident in creating new Challenges, we would recommend leaving this set " +
      "to No at first, especially if the parent Project had been made visible. " +
      "Setting your Challenge's visibility to Yes will make it appear on the home " +
      "page, in the Challenge search, and in metrics - but only if the parent " +
      "Project is also visible.",
  },

  nameLabel: {
    id: 'EditChallenge.form.name.label',
    defaultMessage: "Name",
  },

  nameDescription: {
    id: 'EditChallenge.form.name.description',
    defaultMessage: "Your Challenge name as it will appear in many places " +
      "throughout the application. This is also what your challenge will be " +
      "searchable by using the Search box. This field is required and only " +
      "supports plain text.",
  },

  descriptionLabel: {
    id: 'EditChallenge.form.description.label',
    defaultMessage: "Description",
  },

  descriptionDescription: {
    id: 'EditChallenge.form.description.description',
    defaultMessage: "The primary, longer description of your challenge that " +
      "is shown to users when they click on the challenge to learn more about " +
      "it. This field supports Markdown.",
  },

  blurbLabel: {
    id: 'EditChallenge.form.blurb.label',
    defaultMessage: "Blurb",
  },

  blurbDescription: {
    id: 'EditChallenge.form.blurb.description',
    defaultMessage: "A very brief description of your challenge suitable for " +
      "small spaces, such as a map marker popup. This field supports Markdown.",
  },

  instructionLabel: {
    id: 'EditChallenge.form.instruction.label',
    defaultMessage: "Instructions",
  },

  instructionDescription: {
    id: 'EditChallenge.form.instruction.description',
    defaultMessage: "The instruction tells a mapper how to resolve a Task in " +
      "your Challenge. This is what mappers see in the Instructions box every time " +
      "a task is loaded, and is the primary piece of information for the mapper " +
      "about how to solve the task, so think about this field carefully. You can " +
      "include links to the OSM wiki or any other hyperlink if you want, because " +
      "this field supports Markdown. This field is required.",
  },

  checkinCommentLabel: {
    id: 'EditChallenge.form.checkinComment.label',
    defaultMessage: "Changeset Description",
  },

  checkinCommentDescription: {
    id: 'EditChallenge.form.checkinComment.description',
    defaultMessage: "Comment to be associated with changes made by " +
                    "users in editor",
  },

  difficultyLabel: {
    id: 'EditChallenge.form.difficulty.label',
    defaultMessage: "Difficulty",
  },

  difficultyDescription: {
    id: 'EditChallenge.form.difficulty.description',
    defaultMessage: "Choose between Easy, Normal and Expert to give an " +
      "indication to mappers what skill level is required to resolve the " +
      "Tasks in your Challenge. Easy challenges should be suitable for " +
      "beginners with little or experience.",
  },

  categoryLabel: {
    id: 'EditChallenge.form.category.label',
    defaultMessage: "Category",
  },

  categoryDescription: {
    id: 'EditChallenge.form.category.description',
    defaultMessage: "Selecting an appropriate high-level category for your " +
      "challenge can aid users in quickly discovering challenges that " + 
      "match their interests. Choose the Other category if nothing seems " +
      "appropriate.",
  },

  additionalKeywordsLabel: {
    id: 'EditChallenge.form.additionalKeywords.label',
    defaultMessage: "Keywords",
  },

  additionalKeywordsDescription: {
    id: 'EditChallenge.form.additionalKeywords.description',
    defaultMessage: "You can optionally provide additional, comma-separated " +
    "keywords that can be used to aid discovery of your challenge. Users " +
    "can search by keyword from the Other option of the Category dropdown " +
    "filter, or in the Search box by prepending with a hash sign (e.g. " +
    "#tourism).",
  },

  featuredLabel: {
    id: 'EditChallenge.form.featured.label',
    defaultMessage: "Featured",
  },

  featuredDescription: {
    id: 'EditChallenge.form.featured.description',
    defaultMessage: "Featured challenges are shown at the top of the list " +
      "when browsing and searching challenges. Only super-users may mark a " +
      "a challenge as featured.",
  },

  step2Label: {
    id: 'EditChallenge.form.step2.label',
    defaultMessage: "GeoJSON Source",
  },

  step2Description: {
    id: 'EditChallenge.form.step2.description',
    defaultMessage: `
Every Task in MapRoulette basically consists of a geometry: a point, line or
polygon indicating on the map what it is that you want the mapper to evaluate.
This screen lets you define the Tasks for your Challenge by telling MapRoulette
about the geometries.

There are three ways to feed geometries into your challenge: via an Overpass
query, via a GeoJSON file on your computer, or via a URL pointing to a GeoJSON
file on the internet.

### Via Overpass

The Overpass API is a powerful querying interface for OpenStreetMap data. It
does not work on the live OSM database, but the data you get from Overpass is
usually just a few minutes old. Using
[Overpass QL](https://wiki.openstreetmap.org/wiki/Overpass_API/Language_Guided),
the Overpass Query Language, you can define exactly which OSM objects you want
to load into your Challenge as Tasks.
[Learn more](https://github.com/maproulette/maproulette2/wiki/Introducing-New-MapRoulette---Part-1.-Creating-and-Maintaining-Challenges#via-overpass).

### Via Local GeoJSON File

The other option is to use a GeoJSON file you already have. This could be great
if you have an approved source of external data you would like to manually add
to OSM. Tools like
[QGIS](https://gis.stackexchange.com/questions/91812/convert-shapefiles-to-geojson)
and [gdal](http://www.gdal.org/drv_geojson.html) can convert things like
Shapefiles to GeoJSON.  When you convert, make sure that you use unprojected
lon/lat on the WGS84 datum (EPSG:4326), because this is what MapRoulette uses
internally.

### Via Remote GeoJSON URL

The only difference between using a local GeoJSON file and a URL is where you
tell MapRoulette to get it from. If you use a URL, make sure you point to the
raw GeoJSON file, not a page that contains a link to the file, or MapRoulette
will not be able to make sense of it.
    `,
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
    defaultMessage: "Please provide a suitable bounding box when inserting " +
      "an overpass query, as this can potentially generate large amounts " +
      "of data and bog the system down."
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
      "The priority of tasks can be defined as High, Medium and Low. All " +
      "high priority tasks will be shown first, then medium and finally " +
      "low.",
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
    defaultMessage: "Remove Stale Tasks",
  },

  updateTasksDescription: {
    id: 'EditChallenge.form.updateTasks.description',
    defaultMessage:
      "Periodically delete old, stale (not updated in ~30 days) tasks " +
      "still in Created or Skipped state. This can be useful if you are " +
      "refreshing your challenge tasks on a regular basis and wish to have " +
      "old ones periodically removed for you. Most of the time you will " +
      "want to leave this set to No."
  },

  defaultZoomLabel: {
    id: 'EditChallenge.form.defaultZoom.label',
    defaultMessage: "Default Zoom Level",
  },

  defaultZoomDescription: {
    id: 'EditChallenge.form.defaultZoom.description',
    defaultMessage: "When a user begins work on a task, MapRoulette will " +
      "attempt to automatically use a zoom level that fits the bounds of the " +
      "task's feature. But if that's not possible, then this default zoom level " +
      "will be used. It should be set to a level is generally suitable for " +
      "working on most tasks in your challenge.",
  },

  minZoomLabel: {
    id: 'EditChallenge.form.minZoom.label',
    defaultMessage: "Minimum Zoom Level",
  },

  minZoomDescription: {
    id: 'EditChallenge.form.minZoom.description',
    defaultMessage: "The minimum allowed zoom level for your challenge. " +
      "This should be set to a level that allows the user to sufficiently " +
      "zoom out to work on tasks while keeping them from zooming out to " +
      "a level that isn't useful.",
  },

  maxZoomLabel: {
    id: 'EditChallenge.form.maxZoom.label',
    defaultMessage: "Maximum Zoom Level",
  },

  maxZoomDescription: {
    id: 'EditChallenge.form.maxZoom.description',
    defaultMessage: "The maximum allowed zoom level for your challenge. " +
      "This should be set to a level that allows the user to sufficiently " +
      "zoom in to work on the tasks while keeping them from zooming in " +
      "to a level that isn't useful or exceeds the available resolution " +
      "of the map/imagery in the geographic region.",
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
