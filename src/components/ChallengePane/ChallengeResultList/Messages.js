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
    defaultMessage: "No Results",
  },

  tooManyTasksLabel: {
    id: "VirtualChallenge.controls.tooMany.label",
    defaultMessage: "Zoom in to work on mapped tasks",
  },

  tooManyTasksTooltip: {
    id: "VirtualChallenge.controls.tooMany.tooltip",
    defaultMessage: 'At most {maxTasks, number} tasks can be included in a "virtual" challenge',
  },

  createVirtualChallenge: {
    id: "VirtualChallenge.controls.create.label",
    defaultMessage: "Work on {taskCount, number} Mapped Tasks",
  },

  virtualChallengeNameLabel: {
    id: "VirtualChallenge.fields.name.label",
    defaultMessage: 'Name your "virtual" challenge',
  },

  loadMoreLabel: {
    id: "Challenge.controls.loadMore.label",
    defaultMessage: "More Results",
  },
})
