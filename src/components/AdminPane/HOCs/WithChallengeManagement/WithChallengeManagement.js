import { connect } from 'react-redux'
import _map from 'lodash/map'
import _isObject from 'lodash/isObject'
import _compact from 'lodash/compact'
import { saveChallenge,
         uploadChallengeGeoJSON,
         setIsEnabled,
         moveChallenge,
         rebuildChallenge,
         removeChallenge,
         deleteChallenge } from '../../../../services/Challenge/Challenge'
import { bulkUpdateTasks } from '../../../../services/Task/Task'
import AsValidatableGeoJSON
       from '../../../../interactions/GeoJSON/AsValidatableGeoJSON'
import AsLineReadableFile
       from '../../../../interactions/File/AsLineReadableFile'
import WithProgress from '../../../HOCs/WithProgress/WithProgress'

/**
 * WithChallengeManagement provides functions to its WrappedComponent that can
 * support management capabilities.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithChallengeManagement = WrappedComponent =>
  WithProgress(connect(null, mapDispatchToProps)(WrappedComponent), 'creatingTasks')

/**
 * Upload a line-by-line GeoJSON file in chunks of 100 lines/tasks, updating
 * the task creation progress as it goes. Note that this does not signal completion
 * at the end, allowing the caller to do some follow-up work before indicating that
 * the upload is complete
 *
 * @private
 */
async function uploadLineByLine(dispatch, ownProps, challenge, geoJSON, removeUnmatchedTasks) {
  ownProps.updateCreatingTasksProgress(true, 0)
  const lineFile = AsLineReadableFile(geoJSON)
  let allLinesRead = false
  let totalTasksCreated = 0
  let removeUnmatched = removeUnmatchedTasks

  while (!allLinesRead) {
    let taskLines = await lineFile.readLines(100)
    if (taskLines[taskLines.length - 1] === null) {
      allLinesRead = true
      taskLines = _compact(taskLines)
    }

    await dispatch(
      uploadChallengeGeoJSON(challenge.id, taskLines.join('\n'), true, removeUnmatched)
    )
    removeUnmatched = false
    totalTasksCreated += taskLines.length
    ownProps.updateCreatingTasksProgress(true, totalTasksCreated)
  }

  return challenge
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  saveChallenge: async challengeData => {
    return dispatch(saveChallenge(challengeData)).then(async challenge => {
      // If we have line-by-line GeoJSON, we need to stream that separately
      if (_isObject(challenge) && challengeData.lineByLineGeoJSON) {
        uploadLineByLine(dispatch, ownProps, challenge, challengeData.lineByLineGeoJSON, false)
        ownProps.updateCreatingTasksProgress(false)
      }

      return challenge
    }).catch(error => {
      console.log(error)
      return null
    })
  },

  moveChallenge: (challengeId, toProjectId) =>
    dispatch(moveChallenge(challengeId, toProjectId)),

  rebuildChallenge: async (challenge, removeUnmatchedTasks, localFile) => {
    ownProps.updateCreatingTasksProgress(true)

    // For local files we need to figure out if it's line-by-line to
    // decide which service call to use
    if (localFile) {
      if (await AsValidatableGeoJSON(localFile).isLineByLine()) {
        await uploadLineByLine(dispatch, ownProps, challenge, localFile, removeUnmatchedTasks)
      }
      else {
        await dispatch(
          uploadChallengeGeoJSON(challenge.id, localFile, false, removeUnmatchedTasks)
        )
      }
    }
    else {
      await dispatch(rebuildChallenge(challenge.id, removeUnmatchedTasks))
    }

    // Refresh the clustered tasks, if we can, as they've likely been changed
    // by the rebuild.
    if (ownProps.fetchClusteredTasks) {
      await ownProps.fetchClusteredTasks(challenge.id)
    }

    ownProps.updateCreatingTasksProgress(false)
    return challenge
  },

  deleteChallenge: (projectId, challengeId) => {
    // Optimistically remove the challenge.
    dispatch(removeChallenge(challengeId))

    dispatch(deleteChallenge(challengeId)).then(() =>
      ownProps.history.replace(`/admin/project/${projectId}`)
    )
  },

  updateEnabled: (challengeId, isEnabled) => {
    dispatch(setIsEnabled(challengeId, isEnabled))
  },

  applyBulkTaskChanges: (tasks, changes) => {
    const alteredTasks = _map(
      tasks,
      task => Object.assign({},
                            task,
                            {
                              id: task.id.toString(), // bulk APIs want string ids
                              name: task.name || task.title,
                            },
                            changes)
    )

    return dispatch(bulkUpdateTasks(alteredTasks, true))
  },
})

export default WithChallengeManagement
