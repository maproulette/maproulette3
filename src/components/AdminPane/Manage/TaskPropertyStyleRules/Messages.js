import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with TaskPropertyStyleRules
 */
export default defineMessages({
  stylesHeader: {
    id: 'Admin.TaskPropertyStyleRules.styles.header',
    defaultMessage: "Task Property Styling",
  },

  stylesTip: {
    id: 'Admin.TaskPropertyStyleRules.styles.tip',
    defaultMessage: "See the " +
      "[wiki](https://github.com/osmlab/maproulette3/wiki/Styling-Task-Features) " +
      "for details on setting up styles."
  },

  deleteRule: {
    id: 'Admin.TaskPropertyStyleRules.deleteRule',
    defaultMessage: "Delete Rule",
  },

  addRule: {
    id: 'Admin.TaskPropertyStyleRules.addRule',
    defaultMessage: "Add Another Rule",
  },

  addNewStyle: {
    id: 'Admin.TaskPropertyStyleRules.addNewStyle.label',
    defaultMessage: "Add",
  },

  addNewStyleTooltip: {
    id: 'Admin.TaskPropertyStyleRules.addNewStyle.tooltip',
    defaultMessage: "Add Another Style",
  },

  removeStyleTooltip: {
    id: 'Admin.TaskPropertyStyleRules.removeStyle.tooltip',
    defaultMessage: "Remove Style",
  },

  styleName: {
    id: 'Admin.TaskPropertyStyleRules.styleName',
    defaultMessage: "Style Name",
  },

  styleValue: {
    id: 'Admin.TaskPropertyStyleRules.styleValue',
    defaultMessage: "Style Value",
  },

  styleValuePlaceholder: {
    id: 'Admin.TaskPropertyStyleRules.styleValue.placeholder',
    defaultMessage: "value",
  },
})
