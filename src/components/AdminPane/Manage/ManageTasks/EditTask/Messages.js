import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with EditTask
 */
export default defineMessages({
  editTask: {
    id: 'Admin.EditTask.edit.header',
    defaultMessage: "Edit Task",
  },

  newTask: {
    id: 'Admin.EditTask.new.header',
    defaultMessage: "New Task",
  },

  formTitle: {
    id: 'Admin.EditTask.form.formTitle',
    defaultMessage: "Task Details",
  },

  save: {
    id: 'Admin.EditTask.controls.save.label',
    defaultMessage: "Save",
  },

  cancel: {
    id: 'Admin.EditTask.controls.cancel.label',
    defaultMessage: "Cancel",
  },

  nameLabel: {
    id: 'Admin.EditTask.form.name.label',
    defaultMessage: "Name",
  },

  nameDescription: {
    id: 'Admin.EditTask.form.name.description',
    defaultMessage: "Name of the task",
  },

  instructionLabel: {
    id: 'Admin.EditTask.form.instruction.label',
    defaultMessage: "Instructions",
  },

  instructionDescription: {
    id: 'Admin.EditTask.form.instruction.description',
    defaultMessage: "Instructions for users doing this specific task " +
                    "(overrides challenge instructions)",
  },

  geometriesLabel: {
    id: 'Admin.EditTask.form.geometries.label',
    defaultMessage: "GeoJSON",
  },

  geometriesDescription: {
    id: 'Admin.EditTask.form.geometries.description',
    defaultMessage: "GeoJSON for this task. Every Task in MapRoulette basically " +
      "consists of a geometry: a point, line or polygon indicating on the map " +
      "where it is that you want the mapper to pay attention, described by " +
      "GeoJSON",
  },

  priorityLabel: {
    id: 'Admin.EditTask.form.priority.label',
    defaultMessage: "Priority",
  },

  statusLabel: {
    id: 'Admin.EditTask.form.status.label',
    defaultMessage: "Status",
  },

  statusDescription: {
    id: 'Admin.EditTask.form.status.description',
    defaultMessage: "Status of this task. Depending on the current " +
      "status, your choices for updating the status may be restricted",
  },

  additionalTagsLabel: {
    id: 'Admin.EditTask.form.additionalTags.label',
    defaultMessage: "MR Tags",
  },

  additionalTagsDescription: {
    id: 'Admin.EditTask.form.additionalTags.description',
    defaultMessage: "You can optionally provide additional " +
    "MR tags that can be used to annotate this task.",
  },

  addTagsPlaceholder: {
    id: 'Admin.EditTask.form.additionalTags.placeholder',
    defaultMessage: "Add MR Tags",
  },
})
