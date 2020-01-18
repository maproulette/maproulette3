import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with ConfirmAction.
 */
export default defineMessages({
  title: {
    id: "ConfirmAction.title",
    defaultMessage: "Are you sure?",
  },

  prompt: {
    id: "ConfirmAction.prompt",
    defaultMessage: "This action cannot be undone",
  },

  cancel: {
    id: "ConfirmAction.cancel",
    defaultMessage: "Cancel",
  },

  proceed: {
    id: "ConfirmAction.proceed",
    defaultMessage: "Proceed",
  },
})
