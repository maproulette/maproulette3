import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with RJSFFormFieldAdapter
 * and CustomPriorityBoundsField components.
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

  addBoundsLabel: {
    id: "Form.controls.addBounds.label",
    defaultMessage: "Add a Bounds",
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

  usePriorityBoundsHelper: {
    id: "Form.controls.priorityBounds.helper",
    defaultMessage: "Priority bounds can be configured in the editor.",
  },

  fieldLabel: {
    id: "CustomPriorityBoundsField.label",
    defaultMessage: "Priority Bounds",
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
    defaultMessage: "{count} polygon{count, plural, one {  } other {s}} defined",
  },
  deletePolygon: {
    id: "CustomPriorityBoundsField.deletePolygon",
    defaultMessage: "Delete Polygon",
  },
});
