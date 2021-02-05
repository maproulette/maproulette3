import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with TaskFilters
 */
export default defineMessages({
  searchButton: {
    id: "TaskPropertyQueryBuilder.controls.search",
    defaultMessage: "Search",
  },

  clearButton: {
    id: "TaskPropertyQueryBuilder.controls.clear",
    defaultMessage: "Clear",
  },

  addValueButton: {
    id: "TaskPropertyQueryBuilder.controls.addValue",
    defaultMessage: "Add Value",
  },

  noneOption: {
    id: "TaskPropertyQueryBuilder.options.none.label",
    defaultMessage: "None",
  },

  missingRightRule: {
    id: "TaskPropertyQueryBuilder.error.missingRightRule",
    defaultMessage: "When using a compound rule both parts must be specified.",
  },

  missingLeftRule: {
    id: "TaskPropertyQueryBuilder.error.missingLeftRule",
    defaultMessage: "When using a compound rule both parts must be specified.",
  },

  missingKey: {
    id: "TaskPropertyQueryBuilder.error.missingKey",
    defaultMessage: "Please select a property name.",
  },

  missingValue: {
    id: "TaskPropertyQueryBuilder.error.missingValue",
    defaultMessage: "You must enter a value.",
  },

  missingPropertyType: {
    id: "TaskPropertyQueryBuilder.error.missingPropertyType",
    defaultMessage: "Please choose a property type.",
  },

  notNumericValue: {
    id: "TaskPropertyQueryBuilder.error.notNumericValue",
    defaultMessage: "Property value given is not a valid number.",
  },

  stringType: {
    id: "TaskPropertyQueryBuilder.propertyType.stringType",
    defaultMessage: "text",
  },

  numberType: {
    id: "TaskPropertyQueryBuilder.propertyType.numberType",
    defaultMessage: "number",
  },

  compoundRuleType: {
    id: "TaskPropertyQueryBuilder.propertyType.compoundRuleType",
    defaultMessage: "compound rule",
  },

  missingStyleValue: {
    id: "TaskPropertyQueryBuilder.error.missingStyleValue",
    defaultMessage: "You must enter a style value.",
  },

  missingStyleName: {
    id: "TaskPropertyQueryBuilder.error.missingStyleName",
    defaultMessage: "You must choose a style name.",
  },

  commaSeparateValues: {
    id: "TaskPropertyQueryBuilder.commaSeparateValues.label",
    defaultMessage: "Comma separate values",
  },
})
