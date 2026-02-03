import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with KeyMappings.
 */
export default defineMessages({
  editId: {
    id: "KeyMapping.openEditor.editId",
    defaultMessage: "Open in iD Editor",
  },

  editJosm: {
    id: "Editor.josm.label",
    defaultMessage: "Open in JOSM Editor",
  },

  editJosmLayer: {
    id: "Editor.josmLayer.label",
    defaultMessage: "Open in new JOSM Editor layer",
  },

  editJosmFeatures: {
    id: "Editor.josmFeatures.label",
    defaultMessage: "Open just features in JOSM Editor",
  },

  editLevel0: {
    id: "Editor.level0.label",
    defaultMessage: "Open in Level0 Editor",
  },

  editRapid: {
    id: "Editor.rapid.label",
    defaultMessage: "Open in Rapid Editor",
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
