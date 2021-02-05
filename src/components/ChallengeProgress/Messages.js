import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with ChallengeProgress
 */
export default defineMessages({
  available: {
    id: "Task.fauxStatus.available",
    defaultMessage: "Available"
  },

  tooltipLabel: {
    id: "ChallengeProgress.tooltip.label",
    defaultMessage: "Tasks"
  },

  tasksRemaining: {
    id: "ChallengeProgress.tasks.remaining",
    defaultMessage: "Tasks Remaining: {taskCount, number}"
  },

  outOfTotal: {
    id: "ChallengeProgress.tasks.totalCount",
    defaultMessage: " of {totalCount, number}"
  },

  byPriorityToggle: {
    id: "ChallengeProgress.priority.toggle",
    defaultMessage: "View by Task Priority"
  },

  priorityLabel: {
    id: "ChallengeProgress.priority.label",
    defaultMessage: "{priority} Priority Tasks"
  },

  reviewStatusLabel: {
    id: "ChallengeProgress.reviewStatus.label",
    defaultMessage: "Review Status"
  },

  avgTimeSpent: {
    id: "ChallengeProgress.metrics.averageTime.label",
    defaultMessage: "Avg time per task:"
  },

  excludesSkip: {
    id: "ChallengeProgress.metrics.excludesSkip.label",
    defaultMessage: "(excluding skipped tasks)"
  },
})
