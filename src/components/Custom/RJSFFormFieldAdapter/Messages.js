import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with RJSFFormFieldAdapter.
 */
export default defineMessages({
  uploadFilePrompt: {
    id: "Form.textUpload.prompt",
    defaultMessage: "Drop GeoJSON file here or click to select file",
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

  uploadErrorText: {
    id: 'Form.controls.markdownField.uploadErrorText.label',
    defaultMessage: "Upload Failed!",
  }
})
