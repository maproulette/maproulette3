import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with ChallengeStatus.
 */
export default defineMessages({
  none: {
    id: "Challenge.status.none",
    defaultMessage: "Not Applicable",
  },
  building: {
    id: "Challenge.status.building",
    defaultMessage: "Building",
  },
  failed: {
    id: "Challenge.status.failed",
    defaultMessage: "Failed",
  },
  ready: {
    id: "Challenge.status.ready",
    defaultMessage: "Ready",
  },
  partiallyLoaded: {
    id: "Challenge.status.partiallyLoaded",
    defaultMessage: "Partially Loaded",
  },
  finished: {
    id: "Challenge.status.finished",
    defaultMessage: "Finished",
  },
  deletingTasks: {
    id: "Admin.TaskDeletingProgress.deletingTasks.header",
    defaultMessage: "Deleting Tasks",
  },
});
