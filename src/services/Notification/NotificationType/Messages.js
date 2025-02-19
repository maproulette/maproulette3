import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with NotificationType
 */
export default defineMessages({
  system: {
    id: "Notification.type.system",
    defaultMessage: "System",
  },
  mention: {
    id: "Notification.type.mention",
    defaultMessage: "Mention",
  },
  reviewApproved: {
    id: "Notification.type.review.approved",
    defaultMessage: "Approved",
  },
  reviewRejected: {
    id: "Notification.type.review.rejected",
    defaultMessage: "Revise",
  },
  reviewAgain: {
    id: "Admin.TaskAnalysisTable.controls.reviewTask.label",
    defaultMessage: "Review",
  },
  reviewRevised: {
    id: "Notification.type.review.revised",
    defaultMessage: "Review Revised",
  },
  challengeCompleted: {
    id: "Challenge.fields.completed.label",
    defaultMessage: "Completed",
  },
  challengeCompletedLong: {
    id: "Notification.type.challengeCompletedLong",
    defaultMessage: "Challenge Completed",
  },
  mapperChallengeCompleted: {
    id: "Challenge.fields.completed.label",
    defaultMessage: "Completed",
  },
  team: {
    id: "Admin.ProjectManagers.options.teams.label",
    defaultMessage: "Team",
  },
  follow: {
    id: "Notification.type.follow",
    defaultMessage: "Follow",
  },
  metaReview: {
    id: "Notification.type.metaReview",
    defaultMessage: "Meta-Review",
  },
  metaReviewAgain: {
    id: "Notification.type.metaReviewAgain",
    defaultMessage: "Meta-Review Again",
  },
  challengeComment: {
    id: "Notification.type.challengeComment",
    defaultMessage: "Challenge Comment",
  },
});

export const subscriptionCountMessages = defineMessages({
  reviewCount: {
    id: "Notification.type.reviewCount",
    defaultMessage: "Review Count",
  },
  revisionCount: {
    id: "Notification.type.revisionCount",
    defaultMessage: "Revision Count",
  },
});
