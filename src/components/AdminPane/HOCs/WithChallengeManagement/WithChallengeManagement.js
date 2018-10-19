import { connect } from 'react-redux'
import _map from 'lodash/map'
import _isObject from 'lodash/isObject'
import { saveChallenge,
         uploadChallengeGeoJSON,
         setIsEnabled,
         moveChallenge,
         rebuildChallenge,
         removeChallenge,
         deleteChallenge } from '../../../../services/Challenge/Challenge'
import { bulkUpdateTasks } from '../../../../services/Task/Task'


/**
 * WithChallengeManagement provides functions to its WrappedComponent that can
 * support management capabilities.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithChallengeManagement =
  WrappedComponent => connect(null, mapDispatchToProps)(WrappedComponent)

const mapDispatchToProps = (dispatch, ownProps) => ({
  saveChallenge: challengeData => {
    return dispatch(saveChallenge(challengeData)).then(challenge => {
      // If we have line-by-line GeoJSON, we need to submit that separately
      if (_isObject(challenge) && challengeData.lineByLineGeoJSON) {
        return dispatch(
          uploadChallengeGeoJSON(challenge.id, challengeData.lineByLineGeoJSON)
        ).then(() => challenge)
      }
      else {
        return Promise.resolve(challenge)
      }
    }).catch(error => null)
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
