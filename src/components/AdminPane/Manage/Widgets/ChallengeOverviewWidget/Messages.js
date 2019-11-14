import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with ChallengeOverviewWidget
 */
export default defineMessages({
  label: {
    id: "Widgets.ChallengeOverviewWidget.label",
    defaultMessage: "Challenge Overview",
  },

  title: {
    id: "Widgets.ChallengeOverviewWidget.title",
    defaultMessage: "Overview",
  },

  creationDate: {
    id: "Widgets.ChallengeOverviewWidget.fields.creationDate.label",
    defaultMessage: "Created:",
  },

  lastModifiedDate: {
    id: "Widgets.ChallengeOverviewWidget.fields.lastModifiedDate.label",
    defaultMessage: "Modified:",
  },

  tasksRefreshDate: {
    id: "Widgets.ChallengeOverviewWidget.fields.tasksRefreshDate.label",
    defaultMessage: "Tasks Refreshed:",
  },

  tasksFromDate: {
    id: "Widgets.ChallengeOverviewWidget.fields.tasksFromDate.label",
    defaultMessage: "Tasks From:",
  },

  dataOriginDate: {
    id: "Widgets.ChallengeOverviewWidget.fields.dataOriginDate.label",
    defaultMessage: "Tasks built on {refreshDate} from data sourced on {sourceDate}.",
  },


  status: {
    id: "Widgets.ChallengeOverviewWidget.fields.status.label",
    defaultMessage: "Status:",
  },

  visibleLabel: {
    id: "Widgets.ChallengeOverviewWidget.fields.enabled.label",
    defaultMessage: "Visible:",
  },

  projectDisabledWarning: {
    id: "Widgets.ChallengeOverviewWidget.projectDisabledWarning",
    defaultMessage: "project not visible",
  },
})
