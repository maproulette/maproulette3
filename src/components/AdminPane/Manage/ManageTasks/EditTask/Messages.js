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
    defaultMessage: "Name of the task.",
  },

  instructionLabel: {
    id: 'EditTask.form.instruction.label',
    defaultMessage: "Instructions",
  },

  instructionDescription: {
    id: 'EditTask.form.instruction.description',
    defaultMessage: "Instructions for users doing this specific task " +
                    "(overrides challenge instructions).",
  },

  geometriesLabel: {
    id: 'EditTask.form.geometries.label',
    defaultMessage: "GeoJSON",
  },

  geometriesDescription: {
    id: 'EditTask.form.geometries.description',
    defaultMessage: "GeoJSON for this task. Every Task in MapRoulette basically " +
      "consists of a geometry: a point, line or polygon indicating on the map " +
      "where it is that you want the mapper to pay attention, described by " +
      "GeoJSON.",
  },

  priorityLabel: {
    id: 'EditTask.form.priority.label',
    defaultMessage: "Priority",
  },

  priorityDescription: {
    id: 'EditTask.form.priority.description',
    defaultMessage: "Priority of this task. " +
      "The priority of tasks can be defined as High, Medium and Low. All " +
      "high priority tasks will be shown first, then medium and finally " +
      "low.",
  },

  statusLabel: {
    id: 'EditTask.form.status.label',
    defaultMessage: "Status",
  },

  statusDescription: {
    id: 'EditTask.form.status.description',
    defaultMessage: "Status of this task. Depending on the current " +
      "status, your choices for updating the status may be limited.",
  },
})
