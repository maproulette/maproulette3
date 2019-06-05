import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with CongratulateModal.
 */
export default defineMessages({
  header: {
    id: "ChallengeEndModal.header",
    defaultMessage: "Challenge End"
  },

  primaryMessage: {
    id: "ChallengeEndModal.primaryMessage",
    defaultMessage: "You have marked all remaining tasks in this challenge " + 
                    "as either skipped or too hard."
  },

  dismiss: {
    id: "ChallengeEndModal.control.dismiss.label",
    defaultMessage: "Continue"
  },
})
