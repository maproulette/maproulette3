import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with EditProject
 */
export default defineMessages({
  editProject: {
    id: 'EditProject.header',
    defaultMessage: "Edit",
  },

  newProject: {
    id: 'NewProject.header',
    defaultMessage: "New Project",
  },

  save: {
    id: 'EditProject.save',
    defaultMessage: "Save",
  },

  cancel: {
    id: 'EditProject.cancel',
    defaultMessage: "Cancel",
  },

  nameLabel: {
    id: 'EditProject.form.name.label',
    defaultMessage: "Name",
  },

  nameDescription: {
    id: 'EditProject.form.name.description',
    defaultMessage: "Name of the project",
  },

  displayNameLabel: {
    id: 'EditProject.form.displayName.label',
    defaultMessage: "Display Name",
  },

  displayNameDescription: {
    id: 'EditProject.form.displayName.description',
    defaultMessage: "Displayed name of the project",
  },

  enabledLabel: {
    id: 'EditProject.form.enabled.label',
    defaultMessage: "Visible",
  },

  enabledDescription: {
    id: 'EditProject.form.enabled.description',
    defaultMessage: "If you set your project to Visible, all Challenges under " +
      "it that are also set to Visible will be available, discoverable, and " +
      "searchable for other users. Effectively, making your Project visible " +
      "publishes any Challenges under it that are also Visible. You can still work " +
      "on your own challenges and share static Challenge URLs for any of your " +
      "Challenges with people and it will work. So until you set your Project to " +
      "Visible, you can see your Project as testing ground for Challenges.",
  },

  descriptionLabel: {
    id: 'EditProject.form.description.label',
    defaultMessage: "Description",
  },

  descriptionDescription: {
    id: 'EditProject.form.description.description',
    defaultMessage: "Description of the project",
  },
})
