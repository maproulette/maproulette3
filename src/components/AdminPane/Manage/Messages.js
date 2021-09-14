import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with Admin Manage.
 */
export default defineMessages({
  manageHeader: {
    id: "Admin.manage.header",
    defaultMessage: "Create & Manage",
  },

  virtualHeader: {
    id: "Admin.manage.virtual",
    defaultMessage: "Virtual",
  },

  staleChallengeMessage1: {
    id: "Admin.Challenge.controls.stale1",
    defaultMessage: "This challenge was archived on",
  },

  staleChallengeMessage2: {
    id: "Admin.Challenge.controls.stale2",
    defaultMessage:
      "because the tasks are more than six months old. You will need to rebuild the Tasks before you can unarchive the Challenge.",
  },
});
