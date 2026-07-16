import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with TaskPane
 */
export default defineMessages({
  title: {
    id: "Task.pane.title",
    defaultMessage: "Public Task",
  },

  taskCompletionLabel: {
    id: "Task.pane.label",
    defaultMessage: "Task Completion",
  },

  taskCompletionLabelStaticMap: {
    id: "Task.pane.label.staticMap",
    defaultMessage: "Task Completion - Static Map",
  },

  inspectLabel: {
    id: "Admin.ChallengeTaskMap.controls.inspectTask.label",
    defaultMessage: "Inspect Task",
  },

  favoriteLabel: {
    id: "Task.pane.controls.favorite.label",
    defaultMessage: "Favorite Challenge",
  },

  taskReadOnlyLabel: {
    id: "Task.pane.indicators.readOnly.label",
    defaultMessage: "Read-only Preview",
  },

  taskUnlockLabel: {
    id: "ReviewTaskPane.controls.unlock.label",
    defaultMessage: "Unlock",
  },

  taskTryLockLabel: {
    id: "Task.pane.controls.tryLock.label",
    defaultMessage: "Try locking",
  },

  taskLockCountdownTitle: {
    id: "Task.pane.indicators.lockCountdown.title",
    defaultMessage: "Time remaining until this task's lock expires",
  },

  taskLockCountdownAriaLabel: {
    id: "Task.pane.indicators.lockCountdown.ariaLabel",
    defaultMessage: "Task is locked; {time} remaining. Activate to extend or release.",
  },

  taskLockExpiredAriaLabel: {
    id: "Task.pane.indicators.lockCountdown.expiredAriaLabel",
    defaultMessage: "Task lock has expired. Activate to extend or release.",
  },

  taskLockExpiredLabel: {
    id: "Task.pane.indicators.lockCountdown.expiredLabel",
    defaultMessage: "Expired",
  },

  lockOptionsTitle: {
    id: "Task.pane.lockOptionsDialog.title",
    defaultMessage: "Task Lock",
  },

  lockOptionsPrompt: {
    id: "Task.pane.lockOptionsDialog.prompt",
    defaultMessage:
      "You have this task locked, which prevents other mappers from working on it at the " +
      "same time. Extending the lock will refresh it back to a full hour. Unlocking will " +
      "release the task so others can work on it.",
  },

  extendLockLabel: {
    id: "Task.pane.controls.extendLock.label",
    defaultMessage: "Extend Lock",
  },

  cancelLabel: {
    id: "Admin.EditProject.controls.cancel.label",
    defaultMessage: "Cancel",
  },

  previewTaskLabel: {
    id: "Task.pane.controls.preview.label",
    defaultMessage: "Preview Task",
  },

  browseChallengeLabel: {
    id: "Task.pane.controls.browseChallenge.label",
    defaultMessage: "Browse Challenge",
  },

  retryLockLabel: {
    id: "Task.pane.controls.retryLock.label",
    defaultMessage: "Retry Lock",
  },

  lockFailedTitle: {
    id: "Task.pane.lockFailedDialog.title",
    defaultMessage: "Unable to Lock Task",
  },

  genericLockFailure: {
    id: "Task.pane.lockFailedDialog.genericLockFailure",
    defaultMessage: "Task lock could not be acquired",
  },

  previewAvailable: {
    id: "Task.pane.lockFailedDialog.previewAvailable",
    defaultMessage: ". A read-only preview is available.",
  },

  requestUnlock: {
    id: "Task.pane.lockFailedDialog.requestUnlockLabel",
    defaultMessage: "Request Unlock",
  },

  saveChangesLabel: {
    id: "Task.pane.controls.saveChanges.label",
    defaultMessage: "Save Changes",
  },

  copyShareLinkLabel: {
    id: "Task.pane.controls.copyShareLink.label",
    defaultMessage: "Copy Challenge Share Link",
  },

  copyVirtualShareLinkLabel: {
    id: "Task.pane.controls.copyVirtualShareLink.label",
    defaultMessage: "Copy Virtual Challenge Share Link",
  },
});
