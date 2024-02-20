import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with AppErrors.
 */
export default defineMessages({
  userMissingHomeLocation: {
    id: "Errors.user.missingHomeLocation",
    defaultMessage:
      "No home location found. Please either allow permission " +
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
    defaultMessage: "Unable to update your user on server.",
  },
  userFetchFailure: {
    id: "Errors.user.fetchFailure",
    defaultMessage: "Unable to fetch user data from server.",
  },
  userNotFound: {
    id: "Errors.user.notFound",
    defaultMessage: "No user found with that username.",
  },
  userFollowFailure: {
    id: "Errors.user.genericFollowFailure",
    defaultMessage: "Failure{details}",
  },

  leaderboardFetchFailure: {
    id: "Errors.leaderboard.fetchFailure",
    defaultMessage: "Unable to fetch leaderboard.",
  },

  reviewerLeaderboard: {
    id: "Errors.leaderboard.reviewerLeaderboard",
    defaultMessage: "Unable to retrieve reviewer leaderboard data.",
  },

  userFetchFailure: {
    id: "Errors.leaderboard.userFetchFailure",
    defaultMessage: "Unable to retrieve leaderboard data for user.",
  },

  taskNone: {
    id: "Errors.task.none",
    defaultMessage: "No tasks remain in this challenge.",
  },
  taskSaveFailure: {
    id: "Errors.task.saveFailure",
    defaultMessage: "Unable to save your changes{details}",
  },
  taskUpdateFailure: {
    id: "Errors.task.updateFailure",
    defaultMessage: "Unable to save your changes.",
  },
  taskDeleteFailure: {
    id: "Errors.task.deleteFailure",
    defaultMessage: "Unable to delete task.",
  },
  taskFetchFailure: {
    id: "Errors.task.fetchFailure",
    defaultMessage: "Unable to fetch a task to work on.",
  },
  taskDoesNotExist: {
    id: "Errors.task.doesNotExist",
    defaultMessage: "That task does not exist.",
  },
  taskLocked: {
    id: "Errors.task.alreadyLocked",
    defaultMessage: "Task has already been locked by someone else.",
  },
  taskLockRefreshFailure: {
    id: "Errors.task.lockRefreshFailure",
    defaultMessage:
      "Unable to extend your task lock. Your lock may have expired. We recommend refreshing the page to try establishing a fresh lock.",
  },
  taskLockReleaseFailure: {
    id: "Errors.task.lockReleaseFailure",
    defaultMessage:
      "Failed to release task lock. Your lock or your session may have expired.",
  },
  taskBundleFailure: {
    id: "Errors.task.bundleFailure",
    defaultMessage: "Unable to bundle tasks together",
  },
  removeTaskFromBundleFailure: {
    id: "Errors.task.removeTaskFromBundleFailure",
    defaultMessage: "Unable to remove task from bundle",
  },
  taskBundleCooperative: {
    id: "Errors.task.bundleCooperative",
    defaultMessage: "The main task is Cooperative. All selected tasks must be Cooperative.",
  },
  addCommentFailure: {
    id: "Errors.task.addCommentFailure",
    defaultMessage: "Comment was unable to be saved. An empty string was most likely submitted.",
  },
  taskBundleNotCooperative: {
    id: "Errors.task.bundleNotCooperative",
    defaultMessage: "The main task is not Cooperative. No selected tasks can be Cooperative.",
  },
  taskCooperativeFailure: {
    id: "Errors.task.cooperativeFailure",
    defaultMessage: "Failed to load cooperative task{details}",
  },
  unableToBundleTasks: {
    id: "Errors.task.unableToBundleTasks",
    defaultMessage: "The tasks with these IDs are locked by another user{details}. This most likely happened because a user completed or " +
    "bundled a task while you've been looking at this task. Refresh the page to view only tasks that are unlocked.",
  },
  osmRequestTooLarge: {
    id: "Errors.osm.requestTooLarge",
    defaultMessage: "OpenStreetMap data request too large",
  },
  osmBandwidthExceeded: {
    id: "Errors.osm.bandwidthExceeded",
    defaultMessage: "OpenStreetMap allowed bandwidth exceeded",
  },
  osmElementMissing: {
    id: "Errors.osm.elementMissing",
    defaultMessage: "Element not found on OpenStreetMap server",
  },
  osmFetchFailure: {
    id: "Errors.osm.fetchFailure",
    defaultMessage: "Unable to fetch data from OpenStreetMap",
  },

  mapillaryFetchFailure: {
    id: "Errors.mapillary.fetchFailure",
    defaultMessage: "Unable to fetch data from Mapillary",
  },

  openStreetCamFetchFailure: {
    id: "Errors.openStreetCam.fetchFailure",
    defaultMessage: "Unable to fetch data from OpenStreetCam",
  },

  nominatimFetchFailure: {
    id: "Errors.nominatim.fetchFailure",
    defaultMessage: "Unable to fetch data from Nominatim",
  },

  clusteredTaskFetchFailure: {
    id: "Errors.clusteredTask.fetchFailure",
    defaultMessage: "Unable to fetch task clusters",
  },

  boundedTaskFetchFailure: {
    id: "Errors.boundedTask.fetchFailure",
    defaultMessage: "Unable to fetch map-bounded tasks",
  },

  reviewTaskFetchFailure: {
    id: "Errors.reviewTask.fetchFailure",
    defaultMessage: "Unable to fetch review needed tasks",
  },

  reviewTaskAlreadyClaimed: {
    id: "Errors.reviewTask.alreadyClaimed",
    defaultMessage: "This task is already being reviewed by someone else.",
  },

  reviewTaskNotClaimed: {
    id: "Errors.reviewTask.notClaimedByYou",
    defaultMessage: "Unable to cancel review.",
  },

  challengeFetchFailure: {
    id: "Errors.challenge.fetchFailure",
    defaultMessage: "Unable to retrieve latest challenge data from server.",
  },
  challengeSearchFailure: {
    id: "Errors.challenge.searchFailure",
    defaultMessage: "Unable to search challenges on server.",
  },
  challengeDeleteFailure: {
    id: "Errors.challenge.deleteFailure",
    defaultMessage: "Unable to delete challenge.",
  },
  challengeArchiveFailure: {
    id: "Errors.challenge.archiveFailure",
    defaultMessage: "Unable to update archive status",
  },
  challengeSaveDetailsFailure: {
    id: "Errors.challengeSaveFailure.challengeSaveDetailsFailure",
    defaultMessage: "Unable to save your changes. It is likely a duplicate challenge name.",
  },
  challengeSaveNameFailure: {
    id: "Errors.challengeSaveFailure.challengeSaveNameFailure",
    defaultMessage: "The 'NAME OF YOUR CHALLENGE' field is required and must be more than 3 characters long.",
  },
  challengeSaveDescriptionFailure: {
    id: "Errors.challengeSaveFailure.challengeSaveDescriptionFailure",
    defaultMessage: "The 'DESCRIPTION OF YOUR CHALLENGE' field is required.",
  },
  challengeSaveInstructionFailure: {
    id: "Errors.challengeSaveFailure.challengeSaveInstructionFailure",
    defaultMessage: "The 'DETAILED INSTRUCTIONS FOR MAPPERS' field must have more than {minLength} characters.",
  },
  challengeSaveEditPolicyAgreementFailure: {
    id: "Errors.challengeSaveFailure.challengeSaveEditPolicyAgreementFailure",
    defaultMessage: "You must check the box at the bottom of the page to indicate that you acknowledge OpenStreetMap's Automated Edits code of conduct."
  },
  challengeRebuildFailure: {
    id: "Errors.challenge.rebuildFailure",
    defaultMessage: "Unable to rebuild challenge tasks",
  },
  challengeMoveFailure: {
    id: "Errors.challenge.moveFailure",
    defaultMessage: "Unable to move challenge/s",
  },
  challengeDoesNotExist: {
    id: "Errors.challenge.doesNotExist",
    defaultMessage: "That challenge does not exist.",
  },

  virtualChallengeFetchFailure: {
    id: "Errors.virtualChallenge.fetchFailure",
    defaultMessage:
      "Unable to retrieve latest virtual challenge data from server.",
  },
  virtualChallengeCreateFailure: {
    id: "Errors.virtualChallenge.createFailure",
    defaultMessage: "Unable to create a virtual challenge{details}",
  },
  virtualChallengeExpired: {
    id: "Errors.virtualChallenge.expired",
    defaultMessage: "Virtual challenge has expired.",
  },

  projectSaveFailure: {
    id: "Errors.project.saveFailure",
    defaultMessage: "Unable to save your changes{details}",
  },
  projectFetchFailure: {
    id: "Errors.project.fetchFailure",
    defaultMessage: "Unable to retrieve latest project data from server.",
  },
  projectSearchFailure: {
    id: "Errors.project.searchFailure",
    defaultMessage: "Unable to search projects.",
  },
  projectDeleteFailure: {
    id: "Errors.project.deleteFailure",
    defaultMessage: "Unable to delete project.",
  },
  projectNotManager: {
    id: "Errors.project.notManager",
    defaultMessage: "You must be a manager of that project to proceed.",
  },

  mapRenderFailure: {
    id: "Errors.map.renderFailure",
    defaultMessage:
      "Unable to render the map{details}. Attempting to fall back to default map layer.",
  },

  placeNotFound: {
    id: "Errors.map.placeNotFound",
    defaultMessage: "No results found by Nominatim.",
  },

  widgetWorkspaceRenderFailure: {
    id: "Errors.widgetWorkspace.renderFailure",
    defaultMessage:
      "Unable to render workspace. Switching to a working layout.",
  },

  widgetWorkspaceImportFailure: {
    id: "Errors.widgetWorkspace.importFailure",
    defaultMessage: "Unable to import layout{details}",
  },

  josmNoResponse: {
    id: "Errors.josm.noResponse",
    defaultMessage:
      "OSM remote control did not respond. Do you have JOSM " +
      "running with Remote Control enabled?",
  },
  josmMissingOSMIds: {
    id: "Errors.josm.missingFeatureIds",
    defaultMessage:
      "This task’s features do not include the OSM identifiers " +
      "required to open them standalone in JOSM. Please choose " +
      "another editing option.",
  },
  teamFailure: {
    id: "Errors.team.genericFailure",
    defaultMessage: "Failure{details}",
  },
  searchNotSupported: {
    id: "Errors.search.notSupported",
    defaultMessage: "Short code search not supported{details}",
  },
  fileFormatIncorrect: {
    id: "Errors.file.formatIncorrect",
    defaultMessage:
      "File format is unrecognized or unsupported for this operation",
  },
});
