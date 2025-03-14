import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with CustomUrlList
 */
export default defineMessages({
  noCustomUrls: {
    id: "CustomUrlList.noCustomUrls",
    defaultMessage: "No custom URLs",
  },

  nameLabel: {
    id: "Admin.EditProject.form.name.label",
    defaultMessage: "Name",
  },

  nameDescription: {
    id: "CustomUrlList.name.description",
    defaultMessage: "A unique name/label for this custom URL",
  },

  descriptionLabel: {
    id: "Admin.EditProject.form.description.label",
    defaultMessage: "Description",
  },

  descriptionDescription: {
    id: "CustomUrlList.description.description",
    defaultMessage: "Optional brief description of the URL",
  },

  urlLabel: {
    id: "CustomUrlList.url.label",
    defaultMessage: "URL",
  },

  urlDescription: {
    id: "CustomUrlList.url.description",
    defaultMessage:
      "The full URL, using [mustache tags](https://learn.maproulette.org/documentation/mustache-tag-replacement/) for property replacement. Note that URLs referencing missing or unavailable mustache tags will be automatically disabled to prevent accidental creation of malformed or erroneous URLs",
  },

  addLabel: {
    id: "CustomUrlList.controls.add.label",
    defaultMessage: "Add URL",
  },

  editLabel: {
    id: "Admin.EditChallenge.edit.header",
    defaultMessage: "Edit",
  },

  saveLabel: {
    id: "Admin.EditProject.controls.save.label",
    defaultMessage: "Save",
  },

  deleteLabel: {
    id: "Admin.ManageChallengeSnapshots.deleteSnapshot.label",
    defaultMessage: "Delete",
  },

  cancelLabel: {
    id: "Admin.EditProject.controls.cancel.label",
    defaultMessage: "Cancel",
  },
});
