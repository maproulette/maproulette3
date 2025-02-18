import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with TaskPane
 */
export default defineMessages({
  inspectLabel: {
    id: "Task.pane.controls.inspect.label",
    defaultMessage: "Inspect Task",
  },

  favoriteLabel: {
    id: "Task.pane.controls.favorite.label",
    defaultMessage: "Favorite Challenge",
  },

  taskLockedLabel: {
    id: "Task.pane.indicators.locked.label",
    defaultMessage: "Task locked",
  },

  taskReadOnlyLabel: {
    id: "Task.pane.indicators.readOnly.label",
    defaultMessage: "Read-only Preview",
  },

  taskUnlockLabel: {
    id: "Task.pane.controls.unlock.label",
    defaultMessage: "Unlock",
  },

  taskTryLockLabel: {
    id: "Task.pane.controls.tryLock.label",
    defaultMessage: "Try locking",
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
