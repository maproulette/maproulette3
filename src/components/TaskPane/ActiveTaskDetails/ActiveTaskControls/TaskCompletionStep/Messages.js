import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with TaskFixedControl.
 */
export default defineMessages({
  revisionNeeded: {
    id: 'Task.controls.step1.revisionNeeded',
    defaultMessage: "This task needs revision.",
  },

  checkComments: {
    id: 'Task.controls.step1.checkComments',
    defaultMessage: "Be sure to check comments for any details.",
  },

  otherOptions: {
    id: 'Task.controls.step1.otherOptions',
    defaultMessage: "Other",
  },

  changeStatusOptions: {
    id: 'Task.controls.step1.changeStatusOptions',
    defaultMessage: "Change Status",
  },

  errorTagsApplied: {
    id: 'Task.controls.step1.errorTagsApplied',
    defaultMessage: "The following error tags were applied"
  }
})
