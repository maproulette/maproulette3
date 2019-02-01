import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with AppErrors.
 */
export default defineMessages({
  userMissingHomeLocation: {
    id: "Errors.user.missingHomeLocation",
    defaultMessage: "No home location found. Please either allow permission " +
                    "from your browser or set your home location in your " +
                    "openstreetmap.org settings (you may to sign out and sign " +
                    "back in to MapRoulette afterwards to pick up fresh changes to " +
                    "your OpenStreetMap settings).",
  },
  userUnauthenticated: {
    id: "Errors.user.unauthenticated",
    defaultMessage: "Please sign in to continue.",
  },
  userUnauthorized: {
    id: "Errors.user.unauthorized",
    defaultMessage: "Sorry, you are not authorized to perform that action.",
  },
  userUpdateFailure: {
    id: "Errors.user.updateFailure",
    defaultMessage: "Unable to update your user on server."
  },
  userFetchFailure: {
    id: "Errors.user.fetchFailure",
    defaultMessage: "Unable to fetch user data from server."
  },
  userNotFound: {
    id: "Errors.user.notFound",
    defaultMessage: "No user found with that username."
  },

  leaderboardFetchFailure: {
    id: "Errors.leaderboard.fetchFailure",
    defaultMessage: "Unable to fetch leaderboard."
  },

  taskNone: {
    id: 'Errors.task.none',
    defaultMessage: "No tasks remain in this challenge.",
  },
  taskSaveFailure: {
    id: 'Errors.task.saveFailure',
    defaultMessage: "Unable to save your changes{details}",
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
  taskDoesNotExist: {
    id: 'Errors.task.doesNotExist',
    defaultMessage: "That task does not exist.",
  },

  osmRequestTooLarge: {
    id: 'Errors.osm.requestTooLarge',
    defaultMessage: "OpenStreetMap data request too large",
  },
  osmBandwidthExceeded: {
    id: 'Errors.osm.bandwidthExceeded',
    defaultMessage: "OpenStreetMap allowed bandwidth exceeded",
  },
  osmFetchFailure: {
    id: 'Errors.osm.fetchFailure',
    defaultMessage: "Unable to fetch data from OpenStreetMap",
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
    defaultMessage: "Unable to save your changes{details}",
  },
  challengeRebuildFailure: {
    id: 'Errors.challenge.rebuildFailure',
    defaultMessage: "Unable to rebuild challenge tasks",
  },
  challengeDoesNotExist: {
    id: 'Errors.challenge.doesNotExist',
    defaultMessage: "That challenge does not exist.",
  },

  virtualChallengeFetchFailure: {
    id: 'Errors.virtualChallenge.fetchFailure',
    defaultMessage: "Unable to retrieve latest virtual challenge data from server."
  },
  virtualChallengeCreateFailure: {
    id: 'Errors.virtualChallenge.createFailure',
    defaultMessage: "Unable to create a virtual challenge{details}",
  },
  virtualChallengeExpired: {
    id: 'Errors.virtualChallenge.expired',
    defaultMessage: "Virtual challenge has expired.",
  },

  projectSaveFailure: {
    id: 'Errors.project.saveFailure',
    defaultMessage: "Unable to save your changes{details}",
  },
  projectFetchFailure: {
    id: 'Errors.project.fetchFailure',
    defaultMessage: "Unable to retrieve latest project data from server.",
  },
  projectSearchFailure: {
    id: 'Errors.project.searchFailure',
    defaultMessage: "Unable to search projects.",
  },
  projectDeleteFailure: {
    id: 'Errors.project.deleteFailure',
    defaultMessage: "Unable to delete project.",
  },
  projectNotManager: {
    id: 'Errors.project.notManager',
    defaultMessage: "You must be a manager of that project to proceed.",
  },

  mapRenderFailure: {
    id: 'Errors.map.renderFailure',
    defaultMessage: "Unable to render the map. This may be caused by a problematic custom basemap.",
  },

  dashboardRenderFailure: {
    id: 'Errors.dashboard.renderFailure',
    defaultMessage: "Unable to render the dashboard. Switching to a working layout.",
  },

  josmNoResponse: {
    id: 'Errors.josm.noResponse',
    defaultMessage: "OSM remote control did not respond. Do you have JOSM " +
                    "running with Remote Control enabled?"
  },
  josmMissingOSMIds: {
    id: 'Errors.josm.missingFeatureIds',
    defaultMessage: "This task's features do not include the OSM identifiers " +
                    "required to open them standalone in JOSM. Please choose " +
                    "another editing option."
  },
})
