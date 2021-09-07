import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with TaskAnalysisTable
 */
export default defineMessages({
  inboxHeader: {
    id: "Inbox.header",
    defaultMessage: "Notifications",
  },

  refreshNotificationsLabel: {
    id: "Inbox.controls.refreshNotifications.label",
    defaultMessage: "Refresh",
  },

  groupByTaskLabel: {
    id: "Inbox.controls.groupByTask.label",
    defaultMessage: "Group by Task",
  },

  manageSubscriptionsLabel: {
    id: "Inbox.controls.manageSubscriptions.label",
    defaultMessage: "Manage Subscriptions",
  },

  markSelectedReadLabel: {
    id: "Inbox.controls.markSelectedRead.label",
    defaultMessage: "Mark Read",
  },

  deleteSelectedLabel: {
    id: "Inbox.controls.deleteSelected.label",
    defaultMessage: "Delete",
  },

  notificationTypeLabel: {
    id: "Inbox.tableHeaders.notificationType",
    defaultMessage: "Type",
  },

  createdLabel: {
    id: "Inbox.tableHeaders.created",
    defaultMessage: "Sent",
  },

  fromUsernameLabel: {
    id: "Inbox.tableHeaders.fromUsername",
    defaultMessage: "From",
  },

  challengeNameLabel: {
    id: "Inbox.tableHeaders.challengeName",
    defaultMessage: "Challenge",
  },

  isReadLabel: {
    id: "Inbox.tableHeaders.isRead",
    defaultMessage: "Read",
  },

  taskIdLabel: {
    id: "Inbox.tableHeaders.taskId",
    defaultMessage: "Task",
  },

  controlsLabel: {
    id: "Inbox.tableHeaders.controls",
    defaultMessage: "Actions",
  },

  openNotificationLabel: {
    id: "Inbox.actions.openNotification.label",
    defaultMessage: "Open",
  },

  noNotifications: {
    id: "Inbox.noNotifications",
    defaultMessage: "No Notifications",
  },

  mentionNotificationLead: {
    id: "Inbox.mentionNotification.lead",
    defaultMessage: "You've been mentioned in a comment:",
  },

  reviewApprovedNotificationLead: {
    id: "Inbox.reviewApprovedNotification.lead",
    defaultMessage: "Good news! Your task work has been reviewed and approved.",
  },

  reviewApprovedWithFixesNotificationLead: {
    id: "Inbox.reviewApprovedWithFixesNotification.lead",
    defaultMessage: "Your task work has been approved (with some fixes made for you by the reviewer).",
  },

  reviewRejectedNotificationLead: {
    id: "Inbox.reviewRejectedNotification.lead",
    defaultMessage: "Following a review of your task, the reviewer has determined that it needs some additional work.",
  },

  reviewAgainNotificationLead: {
    id: "Inbox.reviewAgainNotification.lead",
    defaultMessage: "The mapper has revised their work and is requesting an additional review.",
  },

  reviewRevisedNotificationLead: {
    id: "Inbox.reviewRevisedNotification.lead",
    defaultMessage: "Another reviewer has revised your review.",
  },

  metaReviewApprovedNotificationLead: {
    id: "Inbox.metaReviewApprovedNotification.lead",
    defaultMessage: "Good news! Your task review has been meta-reviewed and approved.",
  },

  metaReviewApprovedWithFixesNotificationLead: {
    id: "Inbox.metaReviewApprovedWithFixesNotification.lead",
    defaultMessage: "Your task review been approved (with some fixes made for you by the meta-reviewer).",
  },

  metaReviewRejectedNotificationLead: {
    id: "Inbox.metaReviewRejectedNotification.lead",
    defaultMessage: "Following a meta-review of your task review, the meta-reviewer has determined that it needs some additional work.",
  },

  metaReviewAgainNotificationLead: {
    id: "Inbox.metaReviewAgainNotification.lead",
    defaultMessage: "The reviewer has revised their review and is requesting an additional meta-review.",
  },

  challengeCompleteNotificationLead: {
    id: "Inbox.challengeCompleteNotification.lead",
    defaultMessage: "A challenge you manage has been completed.",
  },

  mapperChallengeCompleteNotificationLead: {
    id: "Inbox.mapperChallengeCompleteNotification.lead",
    defaultMessage: "A challenge you worked on has been completed. Thank you for contributing!",
  },

  teamInviteNotificationLead: {
    id: "Inbox.teamNotification.invited.lead",
    defaultMessage: "You've been invited to join a team!",
  },

  followedNotificationLead: {
    id: "Inbox.followNotification.followed.lead",
    defaultMessage: "You have a new follower!",
  },

  deleteNotificationLabel: {
    id: "Inbox.notification.controls.deleteNotification.label",
    defaultMessage: "Delete",
  },

  viewTaskLabel: {
    id: "Inbox.notification.controls.viewTask.label",
    defaultMessage: "View Task",
  },

  viewConversationLabel: {
    id: "Inbox.notification.controls.viewConversation.label",
    defaultMessage: "View Conversation"
  },

  reviewTaskLabel: {
    id: "Inbox.notification.controls.reviewTask.label",
    defaultMessage: "Review Task",
  },

  manageChallengeLabel: {
    id: "Inbox.notification.controls.manageChallenge.label",
    defaultMessage: "Manage Challenge",
  },

  findMoreChallengesLabel: {
    id: "Inbox.notification.controls.findMoreChallenge.label",
    defaultMessage: "Find more challenges to map!",
  },

  viewTeamsLabel: {
    id: "Inbox.notification.controls.viewTeams.label",
    defaultMessage: "View Teams",
  },
})
