import { connect } from 'react-redux'
import _get from 'lodash/get'
import _isFinite from 'lodash/isNumber'
import { TaskLoadMethod }
       from '../../../services/Task/TaskLoadMethod/TaskLoadMethod'
import { setPreferences,
         CHALLENGES_PREFERENCE_GROUP,
         VIRTUAL_CHALLENGES_PREFERENCE_GROUP }
       from '../../../services/Preferences/Preferences'

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

export const mapStateToProps = (state, ownProps) => {
  const isVirtual = _isFinite(ownProps.virtualChallengeId)
  const concreteChallengeId = _get(ownProps, 'challenge.id', ownProps.challengeId)
  const challengeId = isVirtual ? ownProps.virtualChallengeId : concreteChallengeId
  const mappedProps = {}

  if (_isFinite(challengeId)) {
    mappedProps.minimizeChallenge =
      _get(state.currentPreferences,
           `${preferenceGroup(isVirtual)}.${challengeId}.minimize`,
           false)

    // Instruction preferences are always tied to the concrete challenge.
    mappedProps.collapseInstructions =
      _get(state.currentPreferences,
           `${preferenceGroup(false)}.${concreteChallengeId}.collapseInstructions`,
           false)

    mappedProps.collapseMoreOptions =
      _get(state.currentPreferences,
           `${preferenceGroup(isVirtual)}.${challengeId}.collapseMoreOptions`,
           true)

    mappedProps.taskLoadBy =
      _get(state.currentPreferences,
           `${preferenceGroup(isVirtual)}.${challengeId}.taskLoadMethod`,
           TaskLoadMethod.random)

    mappedProps.visibleMapLayer =
      _get(state.currentPreferences,
           `${preferenceGroup(isVirtual)}.${challengeId}.visibleMapLayer`)

    mappedProps.showMapillaryLayer =
      _get(state.currentPreferences,
           `${preferenceGroup(isVirtual)}.${challengeId}.showMapillaryLayer`)
  }

  return mappedProps
}

export const mapDispatchToProps = dispatch => ({
  setChallengeMinimization: (challengeId, isVirtual, minimize=false) =>
    dispatch(setPreferences(preferenceGroup(isVirtual),
                            {[challengeId]: {minimize}})),

  setInstructionsCollapsed: (challengeId, isVirtual, collapseInstructions=false) =>
    dispatch(setPreferences(preferenceGroup(isVirtual),
                            {[challengeId]: {collapseInstructions}})),

  setMoreOptionsCollapsed: (challengeId, isVirtual, collapseMoreOptions=true) =>
    dispatch(setPreferences(preferenceGroup(isVirtual),
                            {[challengeId]: {collapseMoreOptions}})),

  setTaskLoadBy: (challengeId, isVirtual, taskLoadMethod) =>
    dispatch(setPreferences(preferenceGroup(isVirtual),
                            {[challengeId]: {taskLoadMethod}})),

  setVisibleMapLayer: (challengeId, isVirtual, visibleMapLayerId) =>
    dispatch(setPreferences(preferenceGroup(isVirtual),
                            {[challengeId]: {visibleMapLayer: visibleMapLayerId}})),

  setShowMapillaryLayer: (challengeId, isVirtual, showMapillary) =>
    dispatch(setPreferences(preferenceGroup(isVirtual),
                            {[challengeId]: {showMapillaryLayer: showMapillary}})),
})

export const preferenceGroup = function(isVirtualChallenge) {
  return isVirtualChallenge ? VIRTUAL_CHALLENGES_PREFERENCE_GROUP :
                              CHALLENGES_PREFERENCE_GROUP
}

export default WithChallengePreferences
