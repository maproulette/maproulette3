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

const mapDispatchToProps = (dispatch, ownProps) => ({
  saveChallenge: async challengeData => {
    return dispatch(saveChallenge(challengeData)).then(async challenge => {
      // If we have line-by-line GeoJSON, we need to stream that separately
      if (_isObject(challenge) && challengeData.lineByLineGeoJSON) {
        ownProps.updateCreatingTasksProgress(true, 0)
        const lineFile = AsLineReadableFile(challengeData.lineByLineGeoJSON)
        let allLinesRead = false
        let totalTasksCreated = 0

        while (!allLinesRead) {
          let taskLines = await lineFile.readLines(100)
          if (taskLines[taskLines.length - 1] === null) {
            allLinesRead = true
            taskLines = _compact(taskLines)
          }

          await dispatch(uploadChallengeGeoJSON(challenge.id, taskLines.join('\n')))
          totalTasksCreated += taskLines.length
          ownProps.updateCreatingTasksProgress(true, totalTasksCreated)
        }

        ownProps.updateCreatingTasksProgress(false, 0)
        return challenge
      }
      else {
        return challenge
      }
    }).catch(error => {
      console.log(error)
      return null
    })
  },

  moveChallenge: (challengeId, toProjectId) =>
    dispatch(moveChallenge(challengeId, toProjectId)),

  rebuildChallenge: challengeId => dispatch(rebuildChallenge(challengeId)),

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
