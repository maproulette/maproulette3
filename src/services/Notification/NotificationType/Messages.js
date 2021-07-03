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
    id: "Notification.type.review.again",
    defaultMessage: "Review",
  },
  reviewRevised: {
    id: "Notification.type.review.revised",
    defaultMessage: "Review Revised",
  },
  challengeCompleted: {
    id: "Notification.type.challengeCompleted",
    defaultMessage: "Completed",
  },
  challengeCompletedLong: {
    id: "Notification.type.challengeCompletedLong",
    defaultMessage: "Challenge Completed",
  },
  mapperChallengeCompleted: {
    id: "Notification.type.challengeCompleted",
    defaultMessage: "Completed",
  },
  team: {
    id: "Notification.type.team",
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
