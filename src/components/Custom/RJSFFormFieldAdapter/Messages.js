import { defineMessages } from 'react-intl'

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
    id: 'Form.controls.markdownField.write.label',
    defaultMessage: "Write",
  },

  previewLabel: {
    id: 'Form.controls.markdownField.preview.label',
    defaultMessage: "Preview",
  },

  uploadErrorGeoJSON: {
    id: 'Form.controls.markdownField.uploadErrorGeoJSON.label',
    defaultMessage: "Upload Failed! File must have '.json' or .geojson' extension.",
  },

  uploadErrorJSON: {
    id: 'Form.controls.markdownField.uploadErrorJSON.label',
    defaultMessage: "Upload Failed! File must have '.json' extension.",
  }
})
