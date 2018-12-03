import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with KeyMappings.
 */
export default defineMessages({
  editId: {
    id: "KeyMapping.openEditor.editId",
    defaultMessage: "Edit in Id",
  },

  editJosm: {
    id: "KeyMapping.openEditor.editJosm",
    defaultMessage: "Edit in JOSM",
  },

  editJosmLayer: {
    id: "KeyMapping.openEditor.editJosmLayer",
    defaultMessage: "Edit in new JOSM layer",
  },

  editJosmFeatures: {
    id: "KeyMapping.openEditor.editJosmFeatures",
    defaultMessage: "Edit just features in JOSM",
  },

  editLevel0: {
    id: "KeyMapping.openEditor.editLevel0",
    defaultMessage: "Edit in Level0",
  },

  cancel: {
    id: "KeyMapping.taskEditing.cancel",
    defaultMessage: "Cancel Editing",
  },

  fitBounds: {
    id: "KeyMapping.taskEditing.fitBounds",
    defaultMessage: "Fit Map to Task Features",
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
    defaultMessage: "Not an Issue",
  },

  fixed: {
    id: "KeyMapping.taskCompletion.fixed",
    defaultMessage: "I fixed it!",
  },

  tooHard: {
    id: "KeyMapping.taskCompletion.tooHard",
    defaultMessage: "Too difficult / Couldn't see",
  },

  alreadyFixed: {
    id: "KeyMapping.taskCompletion.alreadyFixed",
    defaultMessage: "Already fixed",
  },

  nextTask: {
    id: "KeyMapping.taskReview.nextTask",
    defaultMessage: "Next Task",
  },

  prevTask: {
    id: "KeyMapping.taskReview.prevTask",
    defaultMessage: "Previous Task",
  },
})
