import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with TaskStatus.
 */
export default defineMessages({
  created: {
    id: "Activity.action.created",
    defaultMessage: "Created",
  },
  fixed: {
    id: "Admin.Task.fields.actions.fixed",
    defaultMessage: "Fixed",
  },
  falsePositive: {
    id: "Admin.Task.fields.actions.notAnIssue",
    defaultMessage: "Not an Issue",
  },
  skipped: {
    id: "Admin.Task.fields.actions.skipped",
    defaultMessage: "Skipped",
  },
  deleted: {
    id: "Activity.action.deleted",
    defaultMessage: "Deleted",
  },
  disabled: {
    id: "Admin.Project.fields.disabled.tooltip",
    defaultMessage: "Disabled",
  },
  alreadyFixed: {
    id: "Admin.Task.fields.actions.alreadyFixed",
    defaultMessage: "Already Fixed",
  },
  tooHard: {
    id: "Admin.Task.fields.actions.tooHard",
    defaultMessage: "Can't Complete",
  },
});
