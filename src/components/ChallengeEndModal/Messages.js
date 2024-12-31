import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with CongratulateModal.
 */
export default defineMessages({
  header: {
    id: "ChallengeEndModal.header",
    defaultMessage: "Challenge End",
  },

  primaryMessage: {
    id: "ChallengeEndModal.primaryMessage",
    defaultMessage:
      "You have marked all remaining tasks in this challenge " +
      "as either skipped or can't complete.",
  },

  dismiss: {
    id: "ChallengeEndModal.control.dismiss.label",
    defaultMessage: "Continue",
  },
});
