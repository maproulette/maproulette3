import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with EditProject
 */
export default defineMessages({
  projectUnavailable: {
    id: 'Admin.EditProject.unavailable',
    defaultMessage: "Project Unavailable",
  },

  editProject: {
    id: 'Admin.EditProject.edit.header',
    defaultMessage: "Edit",
  },

  newProject: {
    id: 'Admin.EditProject.new.header',
    defaultMessage: "New Project",
  },

  save: {
    id: 'Admin.EditProject.controls.save.label',
    defaultMessage: "Save",
  },

  cancel: {
    id: 'Admin.EditProject.controls.cancel.label',
    defaultMessage: "Cancel",
  },

  nameLabel: {
    id: 'Admin.EditProject.form.name.label',
    defaultMessage: "Name",
  },

  nameDescription: {
    id: 'Admin.EditProject.form.name.description',
    defaultMessage: "Name of the project",
  },

  displayNameLabel: {
    id: 'Admin.EditProject.form.displayName.label',
    defaultMessage: "Display Name",
  },

  displayNameDescription: {
    id: 'Admin.EditProject.form.displayName.description',
    defaultMessage: "Displayed name of the project",
  },

  enabledLabel: {
    id: 'Admin.EditProject.form.enabled.label',
    defaultMessage: "Visible",
  },

  enabledDescription: {
    id: 'Admin.EditProject.form.enabled.description',
    defaultMessage: "If you set your project to Visible, all Challenges under " +
      "it that are also set to Visible will be available, discoverable, and " +
      "searchable for other users. Effectively, making your Project visible " +
      "publishes any Challenges under it that are also Visible. You can still work " +
      "on your own challenges and share static Challenge URLs for any of your " +
      "Challenges with people and it will work. So until you set your Project to " +
      "Visible, you can see your Project as testing ground for Challenges.",
  },

  isVirtualLabel: {
    id: 'Admin.EditProject.form.isVirtual.label',
    defaultMessage: "Virtual",
  },

  isVirtualDescription: {
    id: 'Admin.EditProject.form.isVirtual.description',
    defaultMessage: "If a project is virtual, then you can add " +
      "existing challenges as a means of grouping. This setting " +
      "cannot be changed after the project is created. Permissions " +
      "remain in effect from the challenges' original parent projects. "
  },

  descriptionLabel: {
    id: 'Admin.EditProject.form.description.label',
    defaultMessage: "Description",
  },

  descriptionDescription: {
    id: 'Admin.EditProject.form.description.description',
    defaultMessage: "Description of the project",
  },
})
