import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with ErrorTagManager
 */
export default defineMessages({
  heading: {
    id: "ErrorTagManager.heading",
    defaultMessage: "Error Tags Management",
  },
  addNewTag: {
    id: "ErrorTagManager.controls.addNewTag.label",
    defaultMessage: "Add New Tag",
  },
  searchPlaceholder: {
    id: "ErrorTagManager.controls.search.placeholder",
    defaultMessage: "Search tags by name...",
  },
  statusActive: {
    id: "ErrorTagManager.status.active",
    defaultMessage: "Active",
  },
  statusDisabled: {
    id: "ErrorTagManager.status.disabled",
    defaultMessage: "Disabled",
  },
  actionDisable: {
    id: "ErrorTagManager.controls.disable.label",
    defaultMessage: "Disable",
  },
  actionEnable: {
    id: "ErrorTagManager.controls.enable.label",
    defaultMessage: "Enable",
  },
  createHeading: {
    id: "ErrorTagManager.create.heading",
    defaultMessage: "Create New Error Tag",
  },
  nameLabel: {
    id: "ErrorTagManager.form.name.label",
    defaultMessage: "Name:",
  },
  descriptionLabel: {
    id: "ErrorTagManager.form.description.label",
    defaultMessage: "Description:",
  },
  namePlaceholder: {
    id: "ErrorTagManager.form.name.placeholder",
    defaultMessage: "Enter tag name",
  },
  descriptionPlaceholder: {
    id: "ErrorTagManager.form.description.placeholder",
    defaultMessage: "Enter tag description",
  },
  cancel: {
    id: "ErrorTagManager.controls.cancel.label",
    defaultMessage: "Cancel",
  },
  createTag: {
    id: "ErrorTagManager.controls.createTag.label",
    defaultMessage: "Create Tag",
  },
  notSuperAdmin: {
    id: "ErrorTagManager.notSuperAdmin",
    defaultMessage: "You are not a super admin",
  },
});
