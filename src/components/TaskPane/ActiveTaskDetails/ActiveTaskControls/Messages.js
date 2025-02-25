import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with ActiveTaskControls
 */
export default defineMessages({
  markedAs: {
    id: "Task.markedAs.label",
    defaultMessage: "Task marked as",
  },

  requestReview: {
    id: "Task.requestReview.label",
    defaultMessage: "request review?",
  },

  awaitingReview: {
    id: "Task.awaitingReview.label",
    defaultMessage: "Task is awaiting review.",
  },

  readOnly: {
    id: "Admin.TaskInspect.readonly.message",
    defaultMessage: "Previewing task in read-only mode",
  },

  browseChallenge: {
    id: "Task.browseChallenge.message",
    defaultMessage: "View Challenge",
  },

  viewChangesetLabel: {
    id: "ActiveTask.controls.viewChangset.label",
    defaultMessage: "View Changeset",
  },

  rapidDiscardUnsavedChanges: {
    id: "Widgets.TaskMapWidget.rapidDiscardUnsavedChanges",
    defaultMessage:
      "You have unsaved changes in Rapid which will be discarded. Are you sure you want to proceed?",
  },
});
