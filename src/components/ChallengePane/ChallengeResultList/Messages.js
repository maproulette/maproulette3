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

  project: {
    id: "Challenge.detectedIds.project",
    defaultMessage: "Project ",
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
})
