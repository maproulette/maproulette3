import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with ProjectMetrics
 */
export default defineMessages({
  header: {
    id: "ProjectMetrics.header",
    defaultMessage: "At a Glance"
  },
  projects: {
    id: "ProjectMetrics.projects",
    defaultMessage: "{count, plural, one {Project} other {Projects}}"
  },
  challenges: {
    id: "ProjectMetrics.challenges",
    defaultMessage: "{count, plural, one {Challenge} other {Challenges}}"
  },
  tasks: {
    id: "ProjectMetrics.tasks",
    defaultMessage: "{count, plural, one {Task} other {Tasks}}"
  },
})
