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
    unauthorized: messages.userUnauthorized,
    updateFailure: messages.userUpdateFailure,
  },

  task: {
    none: messages.taskNone,
    saveFailure: messages.taskSaveFailure,
    updateFailure: messages.taskUpdateFailure,
    deleteFailure: messages.taskDeleteFailure,
    fetchFailure: messages.taskFetchFailure,
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
  },

  virtualChallenge: {
    createFailure: messages.virtualChallengeCreateFailure,
  },

  project: {
    saveFailure: messages.projectSaveFailure,
    fetchFailure: messages.projectFetchFailure,
    searchFailure: messages.projectSearchFailure
  },

  map: {
    renderFailure: messages.mapRenderFailure,
  },

  josm: {
    noResponse: messages.josmNoResponse,
  },
}
