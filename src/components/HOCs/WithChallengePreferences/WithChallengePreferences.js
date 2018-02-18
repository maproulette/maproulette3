import { connect } from 'react-redux'
import _get from 'lodash/get'
import _isNumber from 'lodash/isNumber'
import { setPreferences } from '../../../services/Preferences/Preferences'

/**
 * WithChallengePreferences passes down the user's preference settings for the
 * given challengeId, such as whether instructions should be minimized or whether
 * tasks should be loaded randomly or by geographic proximity, as well as
 * functions for updating those preferences.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithChallengePreferences = WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(WrappedComponent)

export const CHALLENGES_PREFERENCE_GROUP = 'challenges'

export const mapStateToProps = (state, ownProps) => {
  const challengeId = _get(ownProps, 'challenge.id', ownProps.challengeId)
  const mappedProps = {}

  if (_isNumber(challengeId)) {
    mappedProps.minimizeChallenge =
      _get(state.currentPreferences,
           `${CHALLENGES_PREFERENCE_GROUP}.${challengeId}.minimize`,
           false)

    mappedProps.collapseInstructions =
      _get(state.currentPreferences,
           `${CHALLENGES_PREFERENCE_GROUP}.${challengeId}.collapseInstructions`,
           false)
  }

  return mappedProps
}

export const mapDispatchToProps = dispatch => ({
  setChallengeMinimization: (challengeId, minimize=false) =>
    dispatch(setPreferences(CHALLENGES_PREFERENCE_GROUP,
                            {[challengeId]: {minimize}})),

  setInstructionsCollapsed: (challengeId, collapseInstructions=false) =>
    dispatch(setPreferences(CHALLENGES_PREFERENCE_GROUP,
                            {[challengeId]: {collapseInstructions}})),
})

export default WithChallengePreferences
