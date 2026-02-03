import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with RJSFFormFieldAdapter.
 */
export default defineMessages({
  uploadFilePromptGeoJSON: {
    id: "Form.textUpload.promptGeoJSON",
    defaultMessage: "Drop GeoJSON file here or click to select file",
  },

  uploadFilePromptJSON: {
    id: "Form.textUpload.promptJSON",
    defaultMessage: "Drop JSON file here or click to select file",
  },

  readOnlyFile: {
    id: "Form.textUpload.readonly",
    defaultMessage: "Existing file will be used",
  },

  addPriorityRuleLabel: {
    id: "Form.controls.addPriorityRule.label",
    defaultMessage: "Add a Rule",
  },

  writeLabel: {
    id: "ChallengeDetails.controls.write.label",
    defaultMessage: "Write",
  },

  previewLabel: {
    id: "ChallengeDetails.controls.preview.label",
    defaultMessage: "Preview",
  },

  uploadErrorGeoJSON: {
    id: "Form.controls.markdownField.uploadErrorGeoJSON.label",
    defaultMessage: "Upload Failed! File must have '.json' or .geojson' extension.",
  },

  uploadErrorJSON: {
    id: "Form.controls.markdownField.uploadErrorJSON.label",
    defaultMessage: "Upload Failed! File must have '.json' extension.",
  },

  formatErrorJSON: {
    id: "Form.controls.markdownField.formatErrorJSON.label",
    defaultMessage: "Upload Failed! Layout must be exported from the task completion flow.",
  },

  highPriority: {
    id: "CustomPriorityBoundsField.highPriority",
    defaultMessage: "High Priority",
  },
  mediumPriority: {
    id: "CustomPriorityBoundsField.mediumPriority",
    defaultMessage: "Medium Priority",
  },
  lowPriority: {
    id: "CustomPriorityBoundsField.lowPriority",
    defaultMessage: "Low Priority",
  },
  drawPolygon: {
    id: "CustomPriorityBoundsField.drawPolygon",
    defaultMessage: "Draw Polygon",
  },
  clearPolygons: {
    id: "CustomPriorityBoundsField.clearPolygons",
    defaultMessage: "Clear All",
  },
  showMap: {
    id: "CustomPriorityBoundsField.showMap",
    defaultMessage: "Show Map",
  },
  hideMap: {
    id: "CustomPriorityBoundsField.hideMap",
    defaultMessage: "Hide Map",
  },
  polygonsDefined: {
    id: "CustomPriorityBoundsField.polygonsDefined",
    defaultMessage: "{count} polygon{count, plural, one {  } other {s}} set",
  },
  deletePolygon: {
    id: "CustomPriorityBoundsField.deletePolygon",
    defaultMessage: "Delete Polygon",
  },
  uploadGeoJSON: {
    id: "CustomPriorityBoundsField.uploadGeoJSON",
    defaultMessage: "Upload GeoJSON",
  },
  uploadSuccess: {
    id: "CustomPriorityBoundsField.uploadSuccess",
    defaultMessage: "Successfully uploaded {count} polygon{count, plural, one {} other {s}}",
  },
  uploadError: {
    id: "CustomPriorityBoundsField.uploadError",
    defaultMessage: "Upload failed: {error}",
  },
  invalidGeoJSON: {
    id: "CustomPriorityBoundsField.invalidGeoJSON",
    defaultMessage:
      "Invalid GeoJSON format. File must be a FeatureCollection with Polygon features.",
  },
  geoJSONFormatInfo: {
    id: "CustomPriorityBoundsField.geoJSONFormatInfo",
    defaultMessage:
      "Expects a GeoJSON Feature or FeatureCollection containing Polygon geometry(s).",
  },
  showGeoJSONFormatInfo: {
    id: "CustomPriorityBoundsField.showGeoJSONFormatInfo",
    defaultMessage: "Show GeoJSON format info",
  },
  fileTypeError: {
    id: "CustomPriorityBoundsField.fileTypeError",
    defaultMessage: "Please select a .json or .geojson file",
  },
});
