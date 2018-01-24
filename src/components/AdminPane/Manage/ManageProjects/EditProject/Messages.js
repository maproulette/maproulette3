import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with EditProject
 */
export default defineMessages({
  editProject: {
    id: 'EditProject.header',
    defaultMessage: "Edit Project",
  },

  newProject: {
    id: 'NewProject.header',
    defaultMessage: "New Project",
  },

  save: {
    id: 'EditProject.save',
    defaultMessage: "Save",
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
    defaultMessage: "Allow users to see the project",
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
