import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with TaskAnalysisTable
 */
export default defineMessages({
  taskCountShownStatus: {
    id: "Admin.TaskAnalysisTable.taskCountStatus",
    defaultMessage: "Shown: {countShown} Tasks",
  },

  taskPercentShownStatus: {
    id: "Admin.TaskAnalysisTable.taskPercentStatus",
    defaultMessage: "Shown: {percentShown}% ({countShown}) of {countTotal} Tasks",
  },

  actionsColumnHeader: {
    id: "Admin.TaskAnalysisTable.columnHeaders.actions",
    defaultMessage: "Actions",
  },

  idLabel: {
    id: "Task.fields.id.label",
    defaultMessage: "Task Id",
  },

  nameLabel: {
    id: "Task.fields.name.label",
    defaultMessage: "Name",
  },

  statusLabel: {
    id: "Task.fields.status.label",
    defaultMessage: "Status",
  },

  reviewTaskLabel: {
    id: "Admin.TaskAnalysisTable.controls.reviewTask.label",
    defaultMessage: "Review",
  },

  editTaskLabel: {
    id: "Admin.TaskAnalysisTable.controls.editTask.label",
    defaultMessage: "Edit",
  },
})
