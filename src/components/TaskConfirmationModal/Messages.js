import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with TaskConfirmationModal
 */
export default defineMessages({
  header: {
    id: 'TaskConfirmationModal.header',
    defaultMessage: "Please Confirm",
  },

  submitRevisionHeader: {
    id: 'TaskConfirmationModal.submitRevisionHeader',
    defaultMessage: "Please Confirm Revision",
  },

  inReviewHeader: {
    id: 'TaskConfirmationModal.inReviewHeader',
    defaultMessage: "Please Confirm Review",
  },

  commentLabel: {
    id: 'TaskConfirmationModal.comment.label',
    defaultMessage: "Leave optional comment",
  },

  reviewLabel: {
    id: 'TaskConfirmationModal.review.label',
    defaultMessage: "Need an extra set of eyes? Check here to have your work reviewed by a human",
  },

  loadByLabel: {
    id: 'TaskConfirmationModal.loadBy.label',
    defaultMessage: "Next task:",
  },

  cancelLabel: {
    id: 'TaskConfirmationModal.cancel.label',
    defaultMessage: "Cancel",
  },

  submitLabel: {
    id: 'TaskConfirmationModal.submit.label',
    defaultMessage: "Submit",
  },
})
