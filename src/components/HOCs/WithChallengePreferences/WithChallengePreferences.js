import _isFinite from "lodash/isNumber";
import { connect } from "react-redux";
import {
  CHALLENGES_PREFERENCE_GROUP,
  VIRTUAL_CHALLENGES_PREFERENCE_GROUP,
  setPreferences,
} from "../../../services/Preferences/Preferences";
import { TaskLoadMethod } from "../../../services/Task/TaskLoadMethod/TaskLoadMethod";

/**
 * WithChallengePreferences passes down the user's preference settings for the
 * given challengeId, such as whether instructions should be minimized or whether
 * tasks should be loaded randomly or by geographic proximity, as well as
 * functions for updating those preferences.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithChallengePreferences = (WrappedComponent) =>
  connect(mapStateToProps, mapDispatchToProps)(WrappedComponent);

export const mapStateToProps = (state, ownProps) => {
  const isVirtual = _isFinite(ownProps.virtualChallengeId);
  const concreteChallengeId = ownProps?.challenge?.id ?? ownProps.challengeId;
  const challengeId = isVirtual ? ownProps.virtualChallengeId : concreteChallengeId;
  const taskLoadMethod =
    ownProps.user?.properties?.mr3Frontend?.settings?.loadMethod || TaskLoadMethod.random;
  const mappedProps = {};

  if (_isFinite(challengeId)) {
    mappedProps.minimizeChallenge =
      state.currentPreferences?.[preferenceGroup(isVirtual)]?.[challengeId]?.minimize ?? false;

    // Instruction preferences are always tied to the concrete challenge.
    mappedProps.collapseInstructions =
      state.currentPreferences?.[preferenceGroup(false)]?.[concreteChallengeId]
        ?.collapseInstructions ?? false;

    mappedProps.collapseMoreOptions =
      state.currentPreferences?.[preferenceGroup(isVirtual)]?.[challengeId]?.collapseMoreOptions ??
      true;

    mappedProps.taskLoadBy =
      state.currentPreferences?.[preferenceGroup(isVirtual)]?.[challengeId]?.taskLoadMethod ??
      taskLoadMethod;

    mappedProps.visibleMapLayer =
      state.currentPreferences?.[preferenceGroup(isVirtual)]?.[challengeId]?.visibleMapLayer;

    mappedProps.showMapillaryLayer =
      state.currentPreferences?.[preferenceGroup(isVirtual)]?.[challengeId]?.showMapillaryLayer;

    mappedProps.showOpenStreetCamLayer =
      state.currentPreferences?.[preferenceGroup(isVirtual)]?.[challengeId]?.showOpenStreetCamLayer;
  }

  return mappedProps;
};

export const mapDispatchToProps = (dispatch) => ({
  setChallengeMinimization: (challengeId, isVirtual, minimize = false) =>
    dispatch(setPreferences(preferenceGroup(isVirtual), { [challengeId]: { minimize } })),

  setInstructionsCollapsed: (challengeId, isVirtual, collapseInstructions = false) =>
    dispatch(
      setPreferences(preferenceGroup(isVirtual), { [challengeId]: { collapseInstructions } }),
    ),

  setMoreOptionsCollapsed: (challengeId, isVirtual, collapseMoreOptions = true) =>
    dispatch(
      setPreferences(preferenceGroup(isVirtual), { [challengeId]: { collapseMoreOptions } }),
    ),

  setTaskLoadBy: (challengeId, isVirtual, taskLoadMethod) =>
    dispatch(setPreferences(preferenceGroup(isVirtual), { [challengeId]: { taskLoadMethod } })),

  setVisibleMapLayer: (challengeId, isVirtual, visibleMapLayerId) =>
    dispatch(
      setPreferences(preferenceGroup(isVirtual), {
        [challengeId]: { visibleMapLayer: visibleMapLayerId },
      }),
    ),

  setShowMapillaryLayer: (challengeId, isVirtual, showMapillary) =>
    dispatch(
      setPreferences(preferenceGroup(isVirtual), {
        [challengeId]: { showMapillaryLayer: showMapillary },
      }),
    ),

  setShowOpenStreetCamLayer: (challengeId, isVirtual, showOpenStreetCam) =>
    dispatch(
      setPreferences(preferenceGroup(isVirtual), {
        [challengeId]: { showOpenStreetCamLayer: showOpenStreetCam },
      }),
    ),
});

export const preferenceGroup = function (isVirtualChallenge) {
  return isVirtualChallenge ? VIRTUAL_CHALLENGES_PREFERENCE_GROUP : CHALLENGES_PREFERENCE_GROUP;
};

export default WithChallengePreferences;
