import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with TaskAnalysisTable
 */
export default defineMessages({
  startedOnLabel: {
    id: "TaskHistory.fields.startedOn.label",
    defaultMessage: "Started on task",
  },

  startedReviewOnLabel: {
    id: "TaskHistory.fields.startedReviewOn.label",
    defaultMessage: "Started review on task",
  },

  viewAtticLabel: {
    id: "TaskHistory.controls.viewAttic.label",
    defaultMessage: "View Attic",
  },

  taskUpdatedLabel: {
    id: "TaskHistory.fields.taskUpdated.label",
    defaultMessage: "Task updated by challenge manager",
  },

  listByTime: {
    id: "TaskHistory.controls.listByTime.label",
    defaultMessage: "Entries"
  },

  listByUser: {
    id: "TaskHistory.controls.listByUser.label",
    defaultMessage: "Contributors"
  },

  reviewerType: {
    id: "TaskHistory.fields.userType.reviewer",
    defaultMessage: "Reviewer"
  },

  metaReviewerType: {
    id: "TaskHistory.fields.userType.metaReviewer",
    defaultMessage: "Meta-Reviewer"
  },

  mapperType: {
    id: "TaskHistory.fields.userType.mapper",
    defaultMessage: "Mapper"
  },

  metaReviewLabel: {
    id: "TaskHistory.metaReview.label",
    defaultMessage: "Meta-Review"
  },

  errorTagsLabel: {
    id: "TaskHistory.errorTags.label",
    defaultMessage: "Error Tags"
  }

})
