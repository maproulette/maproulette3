import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with SavedChallenges.
 */
export default defineMessages({
  header: {
    id: "UserProfile.lockedTasks.header",
    defaultMessage: "Your Locked Tasks",
  },

  noLockedTasks: {
    id: "SavedChallenges.widget.noTasks",
    defaultMessage: "You have no locked tasks",
  },

  taskLabel: {
    id: "Admin.Task.fields.name.label",
    defaultMessage: "Task:",
  },

  challengeLabel: {
    id: "TaskConfirmationModal.challenge.label",
    defaultMessage: "Challenge:",
  },

  description: {
    id: "SavedChallenges.widget.description",
    defaultMessage:
      "Tasks locked for more than an hour will be automatically unlocked within the next hour or might already be unlocked. ",
  },

  checkList: {
    id: "SavedChallenges.widget.checkList.label",
    defaultMessage: "Refresh list to check.",
  },

  unlockLabel: {
    id: "Task.pane.controls.unlock.label",
    defaultMessage: "You have no locked tasks",
  },

  taskLockedLabel: {
    id: "ReviewTaskPane.indicators.locked.label",
    defaultMessage: "Task locked",
  },
});
