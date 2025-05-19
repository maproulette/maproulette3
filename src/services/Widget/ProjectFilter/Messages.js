import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with ProjectFilter
 */
export default defineMessages({
  visible: {
    id: "Admin.EditChallenge.form.visible.label",
    defaultMessage: "Discoverable",
  },

  owner: {
    id: "Dashboard.ProjectFilter.owner.label",
    defaultMessage: "Owned",
  },

  pinned: {
    id: "Dashboard.ChallengeFilter.pinned.label",
    defaultMessage: "Pinned",
  },

  archived: {
    id: "Dashboard.ChallengeFilter.archived.label",
    defaultMessage: "Archived",
  },
});
