import { connect } from 'react-redux'
import { denormalize } from 'normalizr'
import { challengeSchema } from '../../../services/Challenge/Challenge'
import { isUsableChallengeStatus }
       from '../../../services/Challenge/ChallengeStatus/ChallengeStatus'
import _values from 'lodash/values'
import _get from 'lodash/get'
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
  const showArchived = _get(state, 'currentSearch.challenges.filters.archived', false);

  // By default, only pass through challenges that are enabled (and belong to
  // an enabled project), have some tasks, and are in a usable status (unless
  // the allStatuses prop is set to true).
  let usableChallenges = challenges
  if (ownProps.allStatuses !== true) {
    usableChallenges = _filter(challenges, challenge => {
      const parent = _get(state, `entities.projects.${challenge.parent}`)
      return challenge.enabled &&
             _get(parent, 'enabled', false) &&
             !challenge.deleted &&
             isUsableChallengeStatus(challenge.status)
    })
  }

  // Denormalize challenges so that parent projects will be embedded.
  usableChallenges = usableChallenges.map(challenge =>
    denormalize(challenge, challengeSchema(), state.entities)
  )

  if (!showArchived) {
    usableChallenges = usableChallenges.filter(challenge => !challenge.isArchived)
  }

  return { challenges: usableChallenges }
}

export default WithChallenges
