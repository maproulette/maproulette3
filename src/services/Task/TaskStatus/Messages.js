import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with TaskStatus.
 */
export default defineMessages({
  created: {
    id: "Task.status.created",
    defaultMessage: "Created"
  },
  fixed: {
    id: "Task.status.fixed",
    defaultMessage: "Fixed"
  },
  falsePositive: {
    id: "Task.status.falsePositive",
    defaultMessage: "Not an Issue"
  },
  skipped: {
    id: "Task.status.skipped",
    defaultMessage: "Skipped"
  },
  deleted: {
    id: "Task.status.deleted",
    defaultMessage: "Deleted"
  },
  alreadyFixed: {
    id: "Task.status.alreadyFixed",
    defaultMessage: "Already Fixed"
  },
  tooHard: {
    id: "Task.status.tooHard",
    defaultMessage: "Too Hard"
  },
})
