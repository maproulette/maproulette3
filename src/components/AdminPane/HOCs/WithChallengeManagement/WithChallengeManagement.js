import { connect } from 'react-redux'
import { saveChallenge,
         setIsEnabled,
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
  saveChallenge: challengeData => dispatch(saveChallenge(challengeData)),

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

  bulkUpdateTasks: (tasks, skipConversion=false) => {
    return dispatch(bulkUpdateTasks(tasks, skipConversion))
  }
})

export default WithChallengeManagement
