import { connect } from "react-redux";
import _map from "lodash/map";
import _get from "lodash/get";
import _isObject from "lodash/isObject";
import _compact from "lodash/compact";
import bundleByTaskBundleId from "../../../../utils/bundleByTaskBundleId";
import createBlob from "../../../../utils/createBlob";
import {
  saveChallenge,
  uploadChallengeGeoJSON,
  setIsEnabled,
  moveChallenge,
  rebuildChallenge,
  removeChallenge,
  fetchChallenge,
  fetchChallengeActions,
  deleteChallenge,
  archiveChallenge,
} from "../../../../services/Challenge/Challenge";
import { recordChallengeSnapshot } from "../../../../services/Challenge/ChallengeSnapshot";
import {
  bulkUpdateTasks,
  deleteChallengeTasks,
  bulkTaskStatusChange,
} from "../../../../services/Task/Task";
import { TaskStatus } from "../../../../services/Task/TaskStatus/TaskStatus";
import { removeReviewRequest } from "../../../../services/Task/TaskReview/TaskReview";
import { addError } from "../../../../services/Error/Error";
import AppErrors from "../../../../services/Error/AppErrors";
import { ChallengeStatus } from "../../../../services/Challenge/ChallengeStatus/ChallengeStatus";
import AsValidatableGeoJSON from "../../../../interactions/GeoJSON/AsValidatableGeoJSON";
import AsLineReadableFile from "../../../../interactions/File/AsLineReadableFile";
import WithProgress from "../../../HOCs/WithProgress/WithProgress";

/**
 * WithChallengeManagement provides functions to its WrappedComponent that can
 * support management capabilities.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithChallengeManagement = (WrappedComponent) =>
  WithProgress(
    WithProgress(
      connect(null, mapDispatchToProps)(WrappedComponent),
      "creatingTasks"
    ),
    "deletingTasks"
  );

/**
 * Method used to direct remote or local data structures into line-by-line GeoJson format
 * if a taskBundleIdProperty is provided. Any errors will be treated silently and return false
 * to allow parent methods to continue other processes.
 *
 * @private
 */
async function rebuildPrebundle(challenge, localFile) {
  try {
    if (challenge.taskBundleIdProperty) {
      if (localFile) {
        const data = await new Response(localFile).text();

        const bundled = bundleByTaskBundleId(
          JSON.parse(data).features,
          challenge.taskBundleIdProperty
        );

        return createBlob(bundled);
      }
    }

    return false;
  } catch (e) {
    console.log(e);
    return false;
  }
}

/**
 * Method used to direct remote or local data structures into line-by-line GeoJson format
 * if a taskBundleIdProperty is provided. Any errors will be treated silently and return false
 * to allow parent methods to continue other processes.
 *
 * @private
 */
async function convertAndBundleGeoJson(challenge) {
  try {
    let data = {};

    if (challenge.taskBundleIdProperty) {
      if (challenge.remoteGeoJson) {
        data = await fetch(challenge.remoteGeoJson).then((response) =>
          response.json()
        );
      } else if (challenge.lineByLineGeoJSON) {
        const lineFile = AsLineReadableFile(challenge.lineByLineGeoJSON);
        let allLinesRead = false;
        let allLines = [];

        while (!allLinesRead) {
          let taskLine = await lineFile.readLines(1);
          if (taskLine[0] === null) {
            allLinesRead = true;
          } else {
            allLines.push(taskLine[0]);
          }
        }

        data.features = [];

        if (allLines?.length) {
          allLines.forEach((taskLine) => {
            JSON.parse(taskLine).features.forEach((feature) => {
              data.features.push(feature);
            });
          });
        }
      } else if (challenge.localGeoJSON) {
        data = JSON.parse(challenge.localGeoJSON);
      }

      if (data.features?.length) {
        const bundled = bundleByTaskBundleId(
          data.features,
          challenge.taskBundleIdProperty
        );

        return bundled;
      }
    }

    return false;
  } catch (e) {
    console.log(e);
    return false;
  }
}

/**
 * Upload a line-by-line GeoJSON file in chunks of 100 lines/tasks, updating
 * the task creation progress as it goes. Note that this does not signal completion
 * at the end, allowing the caller to do some follow-up work before indicating that
 * the upload is complete
 *
 * @private
 */
async function uploadLineByLine(
  dispatch,
  ownProps,
  challenge,
  geoJSON,
  dataOriginDate
) {
  ownProps.updateCreatingTasksProgress(true, 0);
  const lineFile = AsLineReadableFile(geoJSON);
  let allLinesRead = false;
  let totalTasksCreated = 0;

  while (!allLinesRead) {
    let taskLines = await lineFile.readLines(100);
    if (taskLines[taskLines.length - 1] === null) {
      allLinesRead = true;
      taskLines = _compact(taskLines);
    }

    await dispatch(
      uploadChallengeGeoJSON(
        challenge.id,
        taskLines.join("\n"),
        true,
        false,
        dataOriginDate
      )
    );
    totalTasksCreated += taskLines.length;
    ownProps.updateCreatingTasksProgress(true, totalTasksCreated);
  }

  return challenge;
}

/**
 * Initiate deletion of all incomplete tasks in the given challenge and then
 * poll the server for progress updates every 10 seconds until deletion is
 * complete, passing down the latest task-deletion progress to the wrapped
 * component
 */
async function deleteIncompleteTasks(dispatch, ownProps, challenge) {
  const estimatedToDelete = _get(challenge, "actions.available");
  let latestAvailable = estimatedToDelete;

  ownProps.updateDeletingTasksProgress(true, 0);

  // Initiate delete
  await deleteChallengeTasks(challenge.id, [
    TaskStatus.created,
    TaskStatus.skipped,
  ]);

  // Check on deletion progress every 10 seconds for as long as tasks continue
  // to be deleted
  const deletionCompletePromise = new Promise((resolve) => {
    const pollingFrequency = 10000; // 10 seconds

    const updateDeleteProgress = () => {
      fetchChallengeActions(
        challenge.id,
        true
      )(dispatch).then((actionsResult) => {
        fetchChallenge(
          challenge.id,
          true
        )(dispatch).then((challengeResult) => {
          const available = _get(
            actionsResult,
            `entities.challenges.${challenge.id}.actions.available`,
            latestAvailable
          );

          const status = _get(
            challengeResult,
            `entities.challenges.${challenge.id}.status`
          );

          if (
            available >= latestAvailable &&
            status !== ChallengeStatus.deletingTasks
          ) {
            // Delete is complete
            ownProps.updateDeletingTasksProgress(false);
            resolve();
          } else {
            latestAvailable = available;
            ownProps.updateDeletingTasksProgress(
              true,
              estimatedToDelete - latestAvailable
            );
            setTimeout(updateDeleteProgress, pollingFrequency);
          }
        });
      });
    };

    // Kick off first progress update
    setTimeout(updateDeleteProgress, pollingFrequency);
  });

  return deletionCompletePromise;
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  saveChallenge: async (challengeData) => {
    const prebundled = await convertAndBundleGeoJson(challengeData);

    //If the prebundler succeeds, mutate challenge data to fit line-by-line criteria
    if (prebundled) {
      challengeData.remoteGeoJson = undefined;
      challengeData.localGeoJSON = undefined;
      challengeData.overpassTargetType = null;
      challengeData.source = "Local File";
      challengeData.lineByLineGeoJSON = createBlob(prebundled);
    }

    return dispatch(saveChallenge(challengeData))
      .then(async (challenge) => {
        // If we have line-by-line GeoJSON, we need to stream that separately
        if (_isObject(challenge) && challengeData.lineByLineGeoJSON) {
          await uploadLineByLine(
            dispatch,
            ownProps,
            challenge,
            challengeData.lineByLineGeoJSON
          );
          ownProps.updateCreatingTasksProgress(false);
        }

        return challenge;
      })
      .catch((error) => {
        console.log(error);
        return null;
      });
  },

  moveChallenge: (challengeId, toProjectId) =>
    dispatch(moveChallenge(challengeId, toProjectId)),

  deleteIncompleteTasks: (challenge) =>
    deleteIncompleteTasks(dispatch, ownProps, challenge),

  recordSnapshot: (challengeId) => recordChallengeSnapshot(challengeId),

  rebuildChallenge: async (challenge, localFile, dataOriginDate) => {
    ownProps.updateCreatingTasksProgress(true);

    const prebundle = await rebuildPrebundle(challenge, localFile);

    try {
      // For local files we need to figure out if it's line-by-line to
      // decide which service call to use
      const fileData = prebundle || localFile;

      if (fileData) {
        if (await AsValidatableGeoJSON(fileData).isLineByLine()) {
          await uploadLineByLine(
            dispatch,
            ownProps,
            challenge,
            fileData,
            dataOriginDate
          );
        } else {
          await dispatch(
            uploadChallengeGeoJSON(
              challenge.id,
              localFile,
              false,
              false,
              dataOriginDate
            )
          );
        }
      } else {
        await dispatch(rebuildChallenge(challenge.id));
      }
    } catch (error) {
      dispatch(addError(AppErrors.challenge.rebuildFailure));
    }

    // Refresh all the challenge data, including clustered tasks if we can, as
    // it all has likely changed as a result of the rebuild
    await fetchChallengeActions(challenge.id);
    await fetchChallenge(challenge.id);

    // Reset map bounds to avoid potential user confusion after the rebuild
    if (ownProps.clearMapBounds) {
      ownProps.clearMapBounds();
    }

    ownProps.updateCreatingTasksProgress(false);
    return challenge;
  },

  deleteChallenge: (projectId, challengeId) => {
    // Optimistically remove the challenge.
    dispatch(removeChallenge(challengeId));

    dispatch(deleteChallenge(challengeId)).then(() =>
      ownProps.history.replace(`/admin/project/${projectId}`)
    );
  },

  archiveChallenge: (projectId, challengeId, pathname) => {
    dispatch(archiveChallenge(challengeId, true)).then(() =>
      ownProps.history.replace(pathname)
    );
  },

  unarchiveChallenge: (projectId, challengeId, pathname) => {
    dispatch(archiveChallenge(challengeId, false)).then(() =>
      ownProps.history.replace(pathname)
    );
  },

  updateEnabled: (challengeId, isEnabled) => {
    dispatch(setIsEnabled(challengeId, isEnabled));
  },

  applyBulkTaskChanges: (tasks, changes) => {
    const alteredTasks = _map(tasks, (task) =>
      Object.assign(
        {},
        task,
        {
          id: task.id.toString(), // bulk APIs want string ids
          name: task.name || task.title,
        },
        changes
      )
    );

    return dispatch(bulkUpdateTasks(alteredTasks, true));
  },

  applyBulkTaskStatusChange: (
    newStatus,
    challengeId,
    searchCriteria,
    excludeTaskIds
  ) => {
    return dispatch(
      bulkTaskStatusChange(
        newStatus,
        challengeId,
        searchCriteria,
        excludeTaskIds
      )
    );
  },

  removeReviewRequest: (
    challengeId,
    taskIds,
    searchCriteria,
    excludeTaskIds,
    asMetaReview
  ) => {
    return dispatch(
      removeReviewRequest(
        challengeId,
        taskIds,
        searchCriteria,
        excludeTaskIds,
        asMetaReview
      )
    );
  },
});

export default WithChallengeManagement;
