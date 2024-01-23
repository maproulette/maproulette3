import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with ChallengeResultList.
 */
export default defineMessages({
  heading: {
    id: "Challenge.results.heading",
    defaultMessage: "Challenges",
  },

  noResults: {
    id: "Challenge.results.noResults",
    defaultMessage: "Cannot find matching name",
  },

  noChallengeIds: {
    id: "Challenge.detectedIds.noChallengeIds",
    defaultMessage: "Cannot find matching Id",
  },

  challenge: {
    id: "Challenge.detectedIds.challenge",
    defaultMessage: "Challenge ",
  },

  completedChallengeCount: {
    id: "Challenge.fields.ChallengeResultList.label",
    defaultMessage:
    "{count,plural,=0{No challenges} one{# challenge} other{# challenges}} " +
    "completed in project"
  },

  project: {
    id: "Challenge.detectedIds.project",
    defaultMessage: "Project ",
  },

  locatedIn: {
    id: 'ChallengeFilterSubnav.filter.locatedIn.label',
    defaultMessage: 'Located in ',
  },

  tooManyTasksLabel: {
    id: "VirtualChallenge.controls.tooMany.label",
    defaultMessage: "Zoom in to work on mapped tasks",
  },

  tooManyTasksTooltip: {
    id: "VirtualChallenge.controls.tooMany.tooltip",
    defaultMessage: 'At most {maxTasks, number} tasks can be included in a "virtual" challenge',
  },

  loadMoreLabel: {
    id: "Challenge.controls.loadMore.label",
    defaultMessage: "More Results",
  },

  invalidId: {
    id: "Challenge.controls.invalidId.label",
    defaultMessage: "Id must be a number.",
  },

  doesntExist: {
    id: "Challenge.controls.doesntExist.label",
    defaultMessage: "No discoverable task with this id exists.",
  },

  task: {
    id: "Challenge.controls.task.label",
    defaultMessage: "Task",
  },

  goTo: {
    id: "Challenge.controls.goTo.label",
    defaultMessage: "Go directly to:",
  },
})
