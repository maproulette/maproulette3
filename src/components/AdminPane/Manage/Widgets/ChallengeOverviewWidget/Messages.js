import { defineMessages } from "react-intl";

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
    defaultMessage: "Challenge Created:",
  },

  lastModifiedDate: {
    id: "Widgets.ChallengeOverviewWidget.fields.lastModifiedDate.label",
    defaultMessage: "Tasks Last Updated:",
  },

  tasksRefreshDate: {
    id: "Widgets.ChallengeOverviewWidget.fields.tasksRefreshDate.label",
    defaultMessage: "Tasks Refreshed:",
  },

  tasksFromDate: {
    id: "Widgets.ChallengeOverviewWidget.fields.tasksFromDate.label",
    defaultMessage: "Task Data Sourced:",
  },

  lastTaskRefresh: {
    id: "Widgets.ChallengeOverviewWidget.fields.lastTaskRefresh.label",
    defaultMessage: "Last time tasks were built or added to the challenge",
  },

  dataOriginDate: {
    id: "Widgets.ChallengeOverviewWidget.fields.dataOriginDate.label",
    defaultMessage: "Tasks built/added on {refreshDate} from data sourced on {sourceDate}.",
  },

  status: {
    id: "Widgets.ChallengeOverviewWidget.fields.status.label",
    defaultMessage: "Status:",
  },

  visibleLabel: {
    id: "Widgets.ChallengeOverviewWidget.fields.enabled.label",
    defaultMessage: "Discoverable:",
  },

  keywordsLabel: {
    id: "Widgets.ChallengeOverviewWidget.fields.keywords.label",
    defaultMessage: "Keywords:",
  },

  projectDisabledWarning: {
    id: "Widgets.ChallengeOverviewWidget.projectDisabledWarning",
    defaultMessage: "project not discoverable",
  },
});
