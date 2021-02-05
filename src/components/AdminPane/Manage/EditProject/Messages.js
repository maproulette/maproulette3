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
    defaultMessage: "Discoverable",
  },

  enabledDescription: {
    id: 'Admin.EditProject.form.enabled.description',
    defaultMessage: "Once your project is made Discoverable, all Challenges under " +
      "it that are also set to Discoverable will be discoverable/searchable " +
      "by other users. If your project is not Discoverable, then no challenges " +
      "in it will be treated as discoverable regardless of their settings. Note, " +
      "however, that all projects and challenges are considered public and -- even " +
      "when Discoverable is off -- users can still view your project or challenge " +
      "if they have a direct link to it.",
  },

  featuredLabel: {
    id: 'Admin.EditProject.form.featured.label',
    defaultMessage: "Featured",
  },

  featuredDescription: {
    id: 'Admin.EditProject.form.featured.description',
    defaultMessage: "Featured projects are shown on the home page and " +
    "top of the Find Challenges page to bring attention to them. Note " +
    "that featuring a project does **not** also feature its challenges. " +
    "Only super-users may mark a project as featured.",
  },

  isVirtualLabel: {
    id: 'Admin.EditProject.form.isVirtual.label',
    defaultMessage: "Virtual",
  },

  isVirtualDescription: {
    id: 'Admin.EditProject.form.isVirtual.description',
    defaultMessage: "If a project is virtual, then you can add " +
      "existing challenges as a means of grouping. You cannot add " +
      "new Challenges directly to a Virtual Projact. This setting " +
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
