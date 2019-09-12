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

  addMustachePreviewNote: {
    id: "Form.controls.addMustachePreview.note",
    defaultMessage: "Note: all mustache property tags evaluate to empty in preview."
  }
})
