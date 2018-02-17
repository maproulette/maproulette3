import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with TaskAnalysisTable
 */
export default defineMessages({
  taskCountShownStatus: {
    id: 'TaskAnalysisTable.taskCountStatus',
    defaultMessage: "Shown: {countShown} Tasks",
  },

  taskPercentShownStatus: {
    id: 'TaskAnalysisTable.taskPercentStatus',
    defaultMessage: "Shown: {percentShown}% ({countShown}) of {countTotal} Tasks",
  },

  actionsColumnHeader: {
    id: 'TaskAnalysisTable.columnHeaders.actions',
    defaultMessage: "Actions",
  },

  idLabel: {
    id: 'Task.fields.id.label',
    defaultMessage: "Task Id",
  },

  nameLabel: {
    id: 'Task.fields.name.label',
    defaultMessage: "Name",
  },

  statusLabel: {
    id: 'Task.fields.status.label',
    defaultMessage: "Status",
  },
})

