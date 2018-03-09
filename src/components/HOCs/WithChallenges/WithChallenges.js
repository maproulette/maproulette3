import { connect } from 'react-redux'
import { denormalize } from 'normalizr'
import { challengeSchema } from '../../../services/Challenge/Challenge'
import { isUsableChallengeStatus }
       from '../../../services/Challenge/ChallengeStatus/ChallengeStatus'
import _values from 'lodash/values'
import _get from 'lodash/get'
import _isNumber from 'lodash/isNumber'
import _filter from 'lodash/filter'

/**
 * WithChallenges passes down denormalized challenges from the redux store to
 * the wrapped component, by default applying a filter that only lets enabled
 * and usable challenges through. If all challenges are desired regardless of
 * status, the `allStatuses` prop should be set to true.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithChallenges =
  WrappedComponent => connect(mapStateToProps)(WrappedComponent)

export const mapStateToProps = (state, ownProps) => {
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
             !challenge.deleted &&
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

export default WithChallenges
