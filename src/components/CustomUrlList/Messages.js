import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with CustomUrlList
 */
export default defineMessages({
  noCustomUrls: {
    id: "CustomUrlList.noCustomUrls",
    defaultMessage: "No custom URLs",
  },

  nameLabel: {
    id: "CustomUrlList.name.label",
    defaultMessage: "Name",
  },

  nameDescription: {
    id: "CustomUrlList.name.description",
    defaultMessage: "A unique name/label for this custom URL",
  },

  descriptionLabel: {
    id: "CustomUrlList.description.label",
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
    defaultMessage: "The full URL, using mustache tags for property replacement",
  },

  addLabel: {
    id: "CustomUrlList.controls.add.label",
    defaultMessage: "Add URL",
  },

  editLabel: {
    id: "CustomUrlList.controls.edit.label",
    defaultMessage: "Edit",
  },

  saveLabel: {
    id: "CustomUrlList.controls.save.label",
    defaultMessage: "Save",
  },

  deleteLabel: {
    id: "CustomUrlList.controls.delete.label",
    defaultMessage: "Delete",
  },

  cancelLabel: {
    id: "CustomUrlList.controls.cancel.label",
    defaultMessage: "Cancel",
  },
})
