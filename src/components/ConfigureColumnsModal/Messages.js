import { defineMessages } from "react-intl";

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
    id: "Admin.TaskPropertyStyleRules.addNewStyle.label",
    defaultMessage: "Add",
  },

  removeLabel: {
    id: "Admin.VirtualProject.controls.remove.label",
    defaultMessage: "Remove",
  },

  doneLabel: {
    id: "Admin.EditChallenge.form.taskPropertyStyles.close",
    defaultMessage: "Done",
  },
});
