import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with AppErrors.
 */
export default defineMessages({
  userMissingHomeLocation: {
    id: "Errors.user.missingHomeLocation",
    defaultMessage: "No home location found. Please set your home location " +
                    "in your openstreetmap.org settings and then refresh this " +
                    "page to try again.",
  },
  userUnauthorized: {
    id: "Errors.user.unauthorized",
    defaultMessage: "Please sign in to continue.",
  },
  userUpdateFailure: {
    id: "Errors.user.updateFailure",
    defaultMessage: "Unable to update your user on server."
  },

  taskNone: {
    id: 'Errors.task.none',
    defaultMessage: "No tasks remain in this challenge.",
  },
  taskSaveFailure: {
    id: 'Errors.task.saveFailure',
    defaultMessage: "Unable to save your changes",
  },
  taskUpdateFailure: {
    id: 'Errors.task.updateFailure',
    defaultMessage: "Unable to save your changes.",
  },
  taskDeleteFailure: {
    id: 'Errors.task.deleteFailure',
    defaultMessage: "Unable to delete task.",
  },
  taskFetchFailure: {
    id: 'Errors.task.fetchFailure',
    defaultMessage: "Unable to fetch a task to work on.",
  },

  clusteredTaskFetchFailure: {
    id: 'Errors.clusteredTask.fetchFailure',
    defaultMessage: "Unable to fetch task clusters",
  },

  boundedTaskFetchFailure: {
    id: 'Errors.boundedTask.fetchFailure',
    defaultMessage: "Unable to fetch map-bounded tasks",
  },

  challengeFetchFailure: {
    id: 'Errors.challenge.fetchFailure',
    defaultMessage: "Unable to retrieve latest challenge data from server."
  },
  challengeSearchFailure: {
    id: 'Errors.challenge.searchFailure',
    defaultMessage: "Unable to search challenges on server.",
  },
  challengeDeleteFailure: {
    id: 'Errors.challenge.deleteFailure',
    defaultMessage: "Unable to delete challenge.",
  },
  challengeSaveFailure: {
    id: 'Errors.challenge.saveFailure',
    defaultMessage: "Unable to save your changes",
  },
  challengeRebuildFailure: {
    id: 'Errors.challenge.rebuildFailure',
    defaultMessage: "Unable to rebuild challenge tasks",
  },

  virtualChallengeFetchFailure: {
    id: 'Errors.virtualChallenge.fetchFailure',
    defaultMessage: "Unable to retrieve latest virtual challenge data from server."
  },
  virtualChallengeCreateFailure: {
    id: 'Errors.virtualChallenge.createFailure',
    defaultMessage: "Unable to create a virtual challenge",
  },

  projectSaveFailure: {
    id: 'Errors.project.saveFailure',
    defaultMessage: "Unable to save your changes",
  },
  projectFetchFailure: {
    id: 'Errors.project.fetchFailure',
    defaultMessage: "Unable to retrieve latest project data from server.",
  },
  projectSearchFailure: {
    id: 'Errors.project.searchFailure',
    defaultMessage: "Unable to search projects.",
  },
  projectNotManager: {
    id: 'Errors.project.notManager',
    defaultMessage: "You must be a manager of that project to proceed.",
  },

  mapRenderFailure: {
    id: 'Errors.map.renderFailure',
    defaultMessage: "Unable to render the map. This is usally caused by a problematic custom basemap.",
  },

  josmNoResponse: {
    id: 'Errors.josm.noResponse',
    defaultMessage: "OSM remote control did not respond. Do you have JOSM " +
                    "running with Remote Control enabled?"
  },
})
