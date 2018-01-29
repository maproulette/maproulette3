import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with EditTask
 */
export default defineMessages({
  editTask: {
    id: 'EditTask.header',
    defaultMessage: "Edit Task",
  },

  newTask: {
    id: 'NewTask.header',
    defaultMessage: "New Task",
  },

  formTitle: {
    id: 'EditTask.form.formTitle',
    defaultMessage: "Task Details",
  },

  save: {
    id: 'EditTask.save',
    defaultMessage: "Save",
  },

  nameLabel: {
    id: 'EditTask.form.name.label',
    defaultMessage: "Name",
  },

  nameDescription: {
    id: 'EditTask.form.name.description',
    defaultMessage: "Name of the task",
  },

  instructionLabel: {
    id: 'EditTask.form.instruction.label',
    defaultMessage: "Instructions",
  },

  instructionDescription: {
    id: 'EditTask.form.instruction.description',
    defaultMessage: "Instructions for users doing this specific task " +
                    "(overrides challenge instructions)",
  },

  geometriesLabel: {
    id: 'EditTask.form.geometries.label',
    defaultMessage: "GeoJSON",
  },

  geometriesDescription: {
    id: 'EditTask.form.geometries.description',
    defaultMessage: "GeoJSON for this task",
  },

  priorityLabel: {
    id: 'EditTask.form.priority.label',
    defaultMessage: "Priority",
  },

  priorityDescription: {
    id: 'EditTask.form.priority.description',
    defaultMessage: "Priority of this task",
  },

  statusLabel: {
    id: 'EditTask.form.status.label',
    defaultMessage: "Status",
  },

  statusDescription: {
    id: 'EditTask.form.status.description',
    defaultMessage: "Status of this task",
  },
})
