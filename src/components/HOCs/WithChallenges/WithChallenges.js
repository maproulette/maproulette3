import { connect } from 'react-redux'
import { denormalize } from 'normalizr'
import { challengeSchema } from '../../../services/Challenge/Challenge'
import { isUsableChallengeStatus }
       from '../../../services/Challenge/ChallengeStatus/ChallengeStatus'
import { BasemapLayerSources }
       from '../../../services/Challenge/ChallengeBasemap/ChallengeBasemap'
import { loadRandomTaskFromChallenge } from '../../../services/Task/Task'
import { changeVisibleLayer } from '../../../services/VisibleLayer/VisibleLayer'
import { buildError, addError } from '../../../services/Error/Error'
import { values as _values,
         get as _get,
         isNumber as _isNumber,
         filter as _filter } from 'lodash'

/**
 * WithChallenges passes down denormalized challenges from the redux store to
 * the wrapped component, by default applying a filter that only lets enabled
 * and usable challenges through. If all challenges are desired regardless of
 * status, the `allStatuses` prop should be set to true. A startChallenge
 * function is also passed down, which can be used to begin work on a given
 * challenge.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithChallenges =
  WrappedComponent => connect(mapStateToProps, mapDispatchToProps)(WrappedComponent)

const mapStateToProps = (state, ownProps) => {
  const challenges = _values(_get(state, 'entities.challenges')) || []

  // By default, only pass through challenges that are enabled, have some
  // tasks, and are in a usable status (unless the allStatuses prop is set to
  // true).
  let usableChallenges = challenges
  if (ownProps.allStatuses !== true) {
    usableChallenges = _filter(challenges, challenge => {
      // Don't treat as complete if we're simply missing completion data.
      const tasksComplete = _isNumber(_get(challenge, 'actions.available')) ?
                            challenge.actions.available === 0 : false

      return challenge.enabled &&
             !tasksComplete &&
             isUsableChallengeStatus(challenge.status)
    })
  }

  // Denormalize challenges so that parent projects will be embedded.
  usableChallenges = usableChallenges.map(challenge =>
    denormalize(challenge, challengeSchema(), state.entities)
  )

  return { challenges: usableChallenges }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    startChallenge: challenge => {
      dispatch(loadRandomTaskFromChallenge(challenge.id)).then(task => {
        if (task) {
          ownProps.history.push(`/challenge/${task.parent}/task/${task.id}`)

          // If the challenge defines a default basemap layer, use it.
          const defaultLayer = BasemapLayerSources[challenge.defaultBasemap]
          if (defaultLayer) {
            dispatch(changeVisibleLayer(defaultLayer))
          }
        }
        else {
          // No tasks left in this challenge, back to challenges.
          dispatch(addError(buildError(
            "Task.none", "No tasks remain in this challenge."
          )))
        }
      })
    }
  }
}

export default WithChallenges
