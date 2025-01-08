import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { denormalize } from "normalizr";
import _debounce from "lodash/debounce";
import {
  logoutUser,
  fetchUser,
  fetchBasicUser,
  loadCompleteUser,
  saveChallengeForUser,
  unsaveChallengeForUser,
  saveTask,
  unsaveTask,
  fetchTopChallenges,
  fetchSavedChallenges,
  fetchSavedTasks,
  fetchUserActivity,
  updateUserSettings,
  updateUserAppSetting,
  userDenormalizationSchema,
} from "../../../services/User/User";
import AsEndUser from "../../../interactions/User/AsEndUser";

const APP_ID = "mr3Frontend";

/**
 * WithCurrentUser passes down the current user from the redux store.  If the
 * user is non-null, it also automatically adds isSignedIn and isSuperUser
 * fields to the user object (isSignedIn should be checked as the user could be
 * a guest user). Various functions are also made available for managing saved
 * user challenges and tasks, as well as logging out the user.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithCurrentUser = (WrappedComponent) =>
  connect(mapStateToProps, mapDispatchToProps)(WrappedComponent);

export const mapStateToProps = (state) => {
  const props = { user: null, allUsers: null };

  const userId = state.currentUser?.userId;
  const userEntity = state.entities?.users?.[userId];
  if (userEntity) {
    props.user = denormalize(
      userEntity,
      userDenormalizationSchema(),
      state.entities
    );

    if (props.user) {
      const endUser = AsEndUser(props.user);
      props.user.isLoggedIn = endUser.isLoggedIn();
      props.user.isSuperUser = endUser.isSuperUser();
      props.user.hasUnreadNotifications = endUser.hasUnreadNotifications();
      props.user.unreadNotificationCount = endUser.unreadNotificationCount();
    }
  }

  props.allUsers = state.entities?.users;
  return props;
};

export const mapDispatchToProps = (dispatch, ownProps) => {
  const actions = bindActionCreators(
    {
      fetchUser,
      fetchBasicUser,
      loadCompleteUser,
      logoutUser,
      fetchSavedChallenges,
      saveChallengeForUser,
      unsaveChallengeForUser,
      fetchSavedTasks,
      saveTask,
      unsaveTask,
      updateUserSettings,
      fetchTopChallenges,
      fetchUserActivity,
    },
    dispatch
  );

  actions.updateUserAppSetting = _debounce((userId, setting) => {
    return dispatch(updateUserAppSetting(userId, APP_ID, setting));
  }, 100);

  actions.getUserAppSetting = (user, settingName) => {
    return user?.properties?.[APP_ID]?.settings?.[settingName];
  };

  actions.updateEmail = (email) => {
    return dispatch(updateUserSettings(ownProps.user.id, { email }));
  };

  return actions;
};

export default WithCurrentUser;
