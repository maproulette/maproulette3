import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with TaskFilters
 */
export default defineMessages({
  searchButton: {
    id: "TaskPropertyFilter.controls.search",
    defaultMessage: "Search",
  },

  clearButton: {
    id: "TaskPropertyFilter.controls.clear",
    defaultMessage: "Clear",
  },

  noneOption: {
    id: "TaskPropertyFilter.options.none.label",
    defaultMessage: "None",
  },

  filterByPropertyLabel: {
    id: "TaskPropertyFilter.label",
    defaultMessage: "Filter By Property",
  },

  filterByPriorityLabel: {
    id: "TaskPriorityFilter.label",
    defaultMessage: "Filter by Priority",
  },

  filterByStatusLabel: {
    id: "TaskStatusFilter.label",
    defaultMessage: "Filter by Status",
  },

  filterByReviewStatusLabel: {
    id: "TaskReviewStatusFilter.label",
    defaultMessage: "Filter by Review Status",
  },

  missingRightRule: {
    id: "TaskPropertyFilter.error.missingRightRule",
    defaultMessage: "When using a compound rule both parts must be specified.",
  },

  missingLeftRule: {
    id: "TaskPropertyFilter.error.missingLeftRule",
    defaultMessage: "When using a compound rule both parts must be specified.",
  },

  missingKey: {
    id: "TaskPropertyFilter.error.missingKey",
    defaultMessage: "Please select a property name.",
  },

  missingValue: {
    id: "TaskPropertyFilter.error.missingValue",
    defaultMessage: "You must enter a value.",
  },

  missingPropertyType: {
    id: "TaskPropertyFilter.error.missingPropertyType",
    defaultMessage: "Please choose a property type.",
  },

  notNumericValue: {
    id: "TaskPropertyFilter.error.notNumericValue",
    defaultMessage: "Property value given is not a valid number.",
  },

  stringType: {
    id: "TaskPropertyFilter.propertyType.stringType",
    defaultMessage: "text",
  },

  numberType: {
    id: "TaskPropertyFilter.propertyType.numberType",
    defaultMessage: "number",
  },

  compoundRuleType: {
    id: "TaskPropertyFilter.propertyType.compoundRuleType",
    defaultMessage: "compound rule",
  },
})
