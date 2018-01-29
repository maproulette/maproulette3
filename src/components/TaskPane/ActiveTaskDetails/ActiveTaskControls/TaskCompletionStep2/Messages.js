import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with TaskCompletionStep2
 */
export default defineMessages({
  fixed: {
    id: 'ActiveTask.controls.fixed.label',
    defaultMessage: "I fixed it!",
  },

  notFixed: {
    id: 'ActiveTask.controls.notFixed.label',
    defaultMessage: "Too difficult / Couldn't see",
  },

  alreadyFixed: {
    id: 'ActiveTask.controls.aleadyFixed.label',
    defaultMessage: "Already fixed",
  },

  cancelEditing: {
    id: 'ActiveTask.controls.cancelEditing.label',
    defaultMessage: "Go Back",
  }
})
