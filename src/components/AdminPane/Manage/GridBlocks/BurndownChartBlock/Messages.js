import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with BurndownChartBlock 
 */
export default defineMessages({
  label: {
    id: "GridBlocks.BurndownChartBlock.label",
    defaultMessage: "Burndown Chart",
  },
  title: {
    id: "GridBlocks.BurndownChartBlock.title",
    defaultMessage: "Tasks Remaining: {taskCount, number}",
  },
})
