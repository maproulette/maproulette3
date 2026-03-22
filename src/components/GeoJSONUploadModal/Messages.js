import { defineMessages } from "react-intl";

export default defineMessages({
  header: {
    id: "GeoJSONUploadModal.header",
    defaultMessage: "Create Virtual Challenge from GeoJSON",
  },

  dropzoneLabel: {
    id: "GeoJSONUploadModal.dropzone.label",
    defaultMessage: "Drop a GeoJSON file here or click to upload",
  },

  nameLabel: {
    id: "VirtualChallenge.fields.name.label",
    defaultMessage: 'Name your "virtual" challenge',
  },

  startLabel: {
    id: "Admin.TaskAnalysisTable.controls.startTask.label",
    defaultMessage: "Start",
  },

  cancelLabel: {
    id: "Admin.EditProject.controls.cancel.label",
    defaultMessage: "Cancel",
  },

  invalidGeoJSON: {
    id: "GeoJSONUploadModal.error.invalid",
    defaultMessage: "Invalid GeoJSON: {error}",
  },

  noPolygonsFound: {
    id: "GeoJSONUploadModal.error.noPolygons",
    defaultMessage: "No Polygon features found in file",
  },

  polygonsLoaded: {
    id: "GeoJSONUploadModal.success.polygonsLoaded",
    defaultMessage: "{count, plural, one {# polygon} other {# polygons}} loaded",
  },

  taskCount: {
    id: "GeoJSONUploadModal.taskCount",
    defaultMessage: "{count, plural, one {# task} other {# tasks}} found in area",
  },

  countingTasks: {
    id: "GeoJSONUploadModal.countingTasks",
    defaultMessage: "Counting tasks\u2026",
  },

  tooManyTasks: {
    id: "GeoJSONUploadModal.error.tooManyTasks",
    defaultMessage: "Too many tasks ({count}). Maximum allowed is {max}.",
  },
});
