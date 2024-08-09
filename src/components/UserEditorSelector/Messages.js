import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with UserEditorSelector
 */
export default defineMessages({
  currentlyUsing: {
    id: 'UserEditorSelector.currentEditor.label',
    defaultMessage: "Current Editor:",
  },

  editLabel: {
    id: 'UserEditorSelector.openEditor.label',
    defaultMessage: "Open Editor",
  },

  defaultEditor: {
    id: 'UserEditorSelector.defaultEditor.label',
    defaultMessage: "Set Default Editor:",
  },

  unsupportedEditor: {
    id: 'UserEditorSelector.unsupportedEditor.label',
    defaultMessage: "Open Unsupported Editor:",
  },
})
