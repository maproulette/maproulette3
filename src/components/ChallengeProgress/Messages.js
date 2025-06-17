import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with ChallengeProgress
 */
export default defineMessages({
  available: {
    id: "ChallengeProgressBorder.available",
    defaultMessage: "Available",
  },

  tooltipLabel: {
    id: "Admin.ManageTasks.header",
    defaultMessage: "Tasks",
  },

  tasksRemaining: {
    id: "BurndownChart.heading",
    defaultMessage: "Tasks Remaining: {taskCount, number}",
  },

  noCompletionData: {
    id: "ChallengeProgress.noCompletionData",
    defaultMessage: "No Completion Data",
  },

  outOfTotal: {
    id: "ChallengeProgress.tasks.totalCount",
    defaultMessage: " of {totalCount, number}",
  },

  byPriorityToggle: {
    id: "ChallengeProgress.priority.toggle",
    defaultMessage: "View by Task Priority",
  },

  priorityLabel: {
    id: "ChallengeProgress.priority.label",
    defaultMessage: "{priority} Priority Tasks",
  },

  reviewStatusLabel: {
    id: "ChallengeProgress.reviewStatus.label",
    defaultMessage: "Review Status",
  },

  avgTimeSpent: {
    id: "ChallengeProgress.metrics.averageTime.label",
    defaultMessage: "Avg time per task:",
  },

  excludesSkip: {
    id: "ChallengeProgress.metrics.excludesSkip.label",
    defaultMessage: "(excluding skipped tasks)",
  },
});
