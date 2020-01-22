import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with ConfigureColumnsModal
 */
export default defineMessages({
  configureColumnsHeader: {
    id: "ConfigureColumnsModal.header",
    defaultMessage: "Choose Columns to Display",
  },

  availableColumnsHeader: {
    id: "ConfigureColumnsModal.availableColumns.header",
    defaultMessage: "Available Columns",
  },

  showingColumnsHeader: {
    id: "ConfigureColumnsModal.showingColumns.header",
    defaultMessage: "Displayed Columns",
  },

  addLabel: {
    id: "ConfigureColumnsModal.controls.add",
    defaultMessage: "Add",
  },

  removeLabel: {
    id: "ConfigureColumnsModal.controls.remove",
    defaultMessage: "Remove",
  }

})
