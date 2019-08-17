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

  disputeRevisionHeader: {
    id: 'TaskConfirmationModal.disputeRevisionHeader',
    defaultMessage: "Please Confirm Review Disagreement",
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

  loadNextReviewLabel: {
    id: 'TaskConfirmationModal.loadNextReview.label',
    defaultMessage: "Proceed With:",
  },

  cancelLabel: {
    id: 'TaskConfirmationModal.cancel.label',
    defaultMessage: "Cancel",
  },

  submitLabel: {
    id: 'TaskConfirmationModal.submit.label',
    defaultMessage: "Submit",
  },

  osmUploadNotice: {
    id: 'TaskConfirmationModal.osmUploadNotice',
    defaultMessage: "These changes will be uploaded to OpenStreetMap on your behalf",
  },

  osmViewChangesetLabel: {
    id: 'TaskConfirmationModal.controls.osmViewChangeset.label',
    defaultMessage: "Inspect changeset",
  },

  osmCommentHeader: {
    id: 'TaskConfirmationModal.osmComment.header',
    defaultMessage: "OSM Change Comment",
  },

  osmCommentPlaceholder: {
    id: 'TaskConfirmationModal.osmComment.placeholder',
    defaultMessage: "OpenStreetMap comment",
  },

  mrCommentHeader: {
    id: 'TaskConfirmationModal.comment.header',
    defaultMessage: "MapRoulette Comment (optional)",
  },

  placeholder: {
    id: 'TaskConfirmationModal.comment.placeholder',
    defaultMessage: "Your comment (optional)",
  },

  nextNearbyLabel: {
    id: 'TaskConfirmationModal.nextNearby.label',
    defaultMessage: "Select your next nearby task (optional)",
  },

  addTagsPlaceholder: {
    id: 'TaskConfirmationModal.addTags.placeholder',
    defaultMessage: "Add MR Tags",
  },
})
