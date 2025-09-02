import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with BurndownChartWidget
 */
export default defineMessages({
  label: {
    id: "Widgets.BurndownChartWidget.label",
    defaultMessage: "Burndown Chart",
  },

  title: {
    id: "BurndownChart.heading",
    defaultMessage: "Tasks Remaining: {taskCount, number}",
  },

  loadStatsLabel: {
    id: "Widgets.BurndownChartWidget.controls.loadStats.label",
    defaultMessage: "Load Completion Stats",
  },
});
