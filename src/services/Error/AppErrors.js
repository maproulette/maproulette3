import messages from './Messages'

/**
 * App errors. Example use: `addError(AppErrors.user.unauthorized)`
 *
 * > Note, messages are kept separate so they'll be easily picked up when
 * > generating translation files.
 */
export default {
  user: {
    missingHomeLocation: messages.userMissingHomeLocation,
    unauthenticated: messages.userUnauthenticated,
    unauthorized: messages.userUnauthorized,
    updateFailure: messages.userUpdateFailure,
    fetchFailure: messages.userFetchFailure,
    notFound: messages.userNotFound,
  },

  leaderboard: {
    fetchFailure: messages.leaderboardFetchFailure,
  },

  task: {
    none: messages.taskNone,
    saveFailure: messages.taskSaveFailure,
    updateFailure: messages.taskUpdateFailure,
    deleteFailure: messages.taskDeleteFailure,
    fetchFailure: messages.taskFetchFailure,
    doesNotExist: messages.taskDoesNotExist,
  },

  osm: {
    requestTooLarge: messages.osmRequestTooLarge,
    bandwidthExceeded: messages.osmBandwidthExceeded,
    fetchFailure: messages.osmFetchFailure,
  },

  clusteredTask: {
    fetchFailure: messages.clusteredTaskFetchFailure,
  },

  boundedTask: {
    fetchFailure: messages.boundedTaskFetchFailure,
  },

  challenge: {
    fetchFailure: messages.challengeFetchFailure,
    searchFailure: messages.challengeSearchFailure,
    deleteFailure: messages.challengeDeleteFailure,
    saveFailure: messages.challengeSaveFailure,
    rebuildFailure: messages.challengeRebuildFailure,
    doesNotExist: messages.challengeDoesNotExist,
  },

  virtualChallenge: {
    fetchFailure: messages.virtualChallengeFetchFailure,
    createFailure: messages.virtualChallengeCreateFailure,
    expired: messages.virtualChallengeExpired,
  },

  project: {
    saveFailure: messages.projectSaveFailure,
    fetchFailure: messages.projectFetchFailure,
    searchFailure: messages.projectSearchFailure,
    deleteFailure: messages.projectDeleteFailure,
    notManager: messages.projectNotManager,
  },

  map: {
    renderFailure: messages.mapRenderFailure,
  },

  dashboard: {
    renderFailure: messages.dashboardRenderFailure,
  },

  josm: {
    noResponse: messages.josmNoResponse,
    missingOSMIds: messages.josmMissingOSMIds,
  },
}
