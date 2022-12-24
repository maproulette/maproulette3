import messages from "./Messages";

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
    followFailure: messages.userFollowFailure,
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
    locked: messages.taskLocked,
    lockRefreshFailure: messages.taskLockRefreshFailure,
    bundleFailure: messages.taskBundleFailure,
    lockReleaseFailure: messages.taskLockReleaseFailure,
    cooperativeFailure: messages.taskCooperativeFailure,
  },

  osm: {
    requestTooLarge: messages.osmRequestTooLarge,
    bandwidthExceeded: messages.osmBandwidthExceeded,
    elementMissing: messages.osmElementMissing,
    fetchFailure: messages.osmFetchFailure,
  },

  mapillary: {
    fetchFailure: messages.mapillaryFetchFailure,
  },

  openStreetCam: {
    fetchFailure: messages.openStreetCamFetchFailure,
  },

  nominatim: {
    fetchFailure: messages.nominatimFetchFailure,
  },

  clusteredTask: {
    fetchFailure: messages.clusteredTaskFetchFailure,
  },

  boundedTask: {
    fetchFailure: messages.boundedTaskFetchFailure,
  },

  reviewTask: {
    fetchFailure: messages.reviewTaskFetchFailure,
    alreadyClaimed: messages.reviewTaskAlreadyClaimed,
  },

  challenge: {
    fetchFailure: messages.challengeFetchFailure,
    searchFailure: messages.challengeSearchFailure,
    deleteFailure: messages.challengeDeleteFailure,
    archiveFailure: messages.challengeArchiveFailure,
    saveFailure: messages.challengeSaveFailure,
    rebuildFailure: messages.challengeRebuildFailure,
    doesNotExist: messages.challengeDoesNotExist,
    moveFailure: messages.challengeMoveFailure
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
    placeNotFound: messages.placeNotFound,
  },

  widgetWorkspace: {
    renderFailure: messages.widgetWorkspaceRenderFailure,
    importFailure: messages.widgetWorkspaceImportFailure,
  },

  josm: {
    noResponse: messages.josmNoResponse,
    missingOSMIds: messages.josmMissingOSMIds,
  },

  team: {
    failure: messages.teamFailure,
  },

  search: {
    notSupported: messages.searchNotSupported,
  },

  file: {
    formatIncorrect: messages.fileFormatIncorrect,
  },
};
