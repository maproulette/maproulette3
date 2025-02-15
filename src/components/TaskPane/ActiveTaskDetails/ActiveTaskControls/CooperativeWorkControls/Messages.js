import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with CooperativeWorkControls
 */
export default defineMessages({
  prompt: {
    id: "CooperativeWorkControls.prompt",
    defaultMessage: "Are the proposed OSM tag changes correct?",
  },

  confirmLabel: {
    id: "Admin.EditChallenge.form.steps.yes.label",
    defaultMessage: "Yes",
  },

  rejectLabel: {
    id: "Admin.EditChallenge.form.steps.no.label",
    defaultMessage: "No",
  },

  moreOptionsLabel: {
    id: "Challenge.keywords.other",
    defaultMessage: "Other",
  },
});
