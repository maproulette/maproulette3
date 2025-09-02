import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with KeyMappings.
 */
export default defineMessages({
  editId: {
    id: "KeyMapping.openEditor.editId",
    defaultMessage: "Edit in iD",
  },

  editJosm: {
    id: "Editor.josm.label",
    defaultMessage: "Edit in JOSM",
  },

  editJosmLayer: {
    id: "Editor.josmLayer.label",
    defaultMessage: "Edit in new JOSM layer",
  },

  editJosmFeatures: {
    id: "Editor.josmFeatures.label",
    defaultMessage: "Edit just features in JOSM",
  },

  editLevel0: {
    id: "Editor.level0.label",
    defaultMessage: "Edit in Level0",
  },

  editRapid: {
    id: "Editor.rapid.label",
    defaultMessage: "Edit in Rapid",
  },

  layerOSMData: {
    id: "KeyMapping.layers.layerOSMData",
    defaultMessage: "Toggle OSM Data Layer",
  },

  layerTaskFeatures: {
    id: "KeyMapping.layers.layerTaskFeatures",
    defaultMessage: "Toggle Features Layer",
  },

  layerMapillary: {
    id: "KeyMapping.layers.layerMapillary",
    defaultMessage: "Toggle Mapillary Layer",
  },

  cancel: {
    id: "KeyMapping.taskEditing.cancel",
    defaultMessage: "Cancel Editing",
  },

  fitBounds: {
    id: "KeyMapping.taskEditing.fitBounds",
    defaultMessage: "Fit Map to Task Features",
  },

  completeTogether: {
    id: "KeyMapping.taskEditing.completeTogether",
    defaultMessage: "Complete Tasks Together",
  },

  escapeLabel: {
    id: "KeyMapping.taskEditing.escapeLabel",
    defaultMessage: "ESC",
  },

  skip: {
    id: "KeyMapping.taskCompletion.skip",
    defaultMessage: "Skip",
  },

  falsePositive: {
    id: "KeyMapping.taskCompletion.falsePositive",
    defaultMessage: "No / Not an issue",
  },

  fixed: {
    id: "KeyMapping.taskCompletion.fixed",
    defaultMessage: "Yes / I fixed it!",
  },

  tooHard: {
    id: "Admin.Task.fields.actions.tooHard",
    defaultMessage: "Can't Complete",
  },

  alreadyFixed: {
    id: "KeyMapping.taskCompletion.alreadyFixed",
    defaultMessage: "Already fixed",
  },

  nextTask: {
    id: "Admin.TaskInspect.controls.nextTask.label",
    defaultMessage: "Next Task",
  },

  prevTask: {
    id: "KeyMapping.taskInspect.prevTask",
    defaultMessage: "Previous Task",
  },

  confirmSubmit: {
    id: "Footer.email.submit.label",
    defaultMessage: "Submit",
  },
});
