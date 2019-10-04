import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with TaskCompletionWidget
 */
export default defineMessages({
  label: {
    id: "Widgets.TaskCompletionWidget.label",
    defaultMessage: "Completion",
  },

  title: {
    id: "Widgets.TaskCompletionWidget.title",
    defaultMessage: "Completion",
  },

  inspectTitle: {
    id: "Widgets.TaskCompletionWidget.inspectTitle",
    defaultMessage: "Inspect",
  },

  suggestedFixTitle: {
    id: "Widgets.TaskCompletionWidget.suggestedFixTitle",
    defaultMessage: "Proposed Changes",
  },

  simultaneousTasks: {
    id: "Widgets.TaskCompletionWidget.simultaneousTasks",
    defaultMessage: "Working on {taskCount, number} tasks together",
  },

  completeTogether: {
    id: "Widgets.TaskCompletionWidget.completeTogether",
    defaultMessage: "Complete Together",
  },

  cancelSelection: {
    id: "Widgets.TaskCompletionWidget.cancelSelection",
    defaultMessage: "Cancel Selection",
  },
})
