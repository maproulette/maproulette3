import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with BurndownChartWidget 
 */
export default defineMessages({
  label: {
    id: "Widgets.BurndownChartWidget.label",
    defaultMessage: "Burndown Chart",
  },
  title: {
    id: "Widgets.BurndownChartWidget.title",
    defaultMessage: "Tasks Remaining: {taskCount, number}",
  },
})
