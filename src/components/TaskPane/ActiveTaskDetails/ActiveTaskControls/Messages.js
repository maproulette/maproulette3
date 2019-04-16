import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with ActiveTaskControls
 */
export default defineMessages({
  markedAs: {
    id: 'Task.markedAs.label',
    defaultMessage: "Task marked as",
  },

  requestReview: {
    id: 'Task.requestReview.label',
    defaultMessage: "request review?",
  },

  awaitingReview: {
    id: 'Task.awaitingReview.label',
    defaultMessage: "Task is awaiting review.",
  },
})
