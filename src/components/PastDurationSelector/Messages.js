import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with PastDurationSelector
 */
export default defineMessages({
  pastMonthsOption: {
    id: "PastDurationSelector.pastMonths.selectOption",
    defaultMessage: "Past {months, plural, one {Month} =12 {Year} other {# Months}}",
  },

  currentMonthOption: {
    id: "PastDurationSelector.currentMonth.selectOption",
    defaultMessage: "Current Month",
  },

  allTimeOption: {
    id: "PastDurationSelector.allTime.selectOption",
    defaultMessage: "All Time",
  },

  customRangeOption: {
    id: "PastDurationSelector.customRange.selectOption",
    defaultMessage: "Custom",
  },

  startDate: {
    id: "PastDurationSelector.customRange.startDate",
    defaultMessage: "Start Date",
  },

  endDate: {
    id: "PastDurationSelector.customRange.endDate",
    defaultMessage: "End Date",
  },
})
