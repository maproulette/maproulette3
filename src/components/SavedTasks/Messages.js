import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with SavedTasks.
 */
export default defineMessages({
  header: {
    id: "UserProfile.savedTasks.header",
    defaultMessage: "Tracked Tasks",
  },

  unsave: {
    id: "Task.unsave.control.tooltip",
    defaultMessage: "Stop Tracking",
  },

  noTasks: {
    id: "SavedTasks.widget.noTasks",
    defaultMessage: "No Tasks",
  },

  viewTask: {
    id: "SavedTasks.widget.viewTask",
    defaultMessage: "View Task",
  },

  viewComments: {
    id: "SavedTasks.widget.viewComments",
    defaultMessage: "View Comments",
  },
})
