import { connect } from 'react-redux'
import { denormalize } from 'normalizr'
import _get from 'lodash/get'
import { logoutUser,
         saveChallenge, unsaveChallenge,
         saveTask, unsaveTask,
         updateUserSettings,
         userDenormalizationSchema } from '../../../services/User/User'
import AsEndUser from '../../../interactions/User/AsEndUser'

/**
 * WithCurrentUser passes down the current user from the redux store.  If the
 * user is non-null, it also automatically adds isSignedIn and isSuperUser
 * fields to the user object (isSignedIn should be checked as the user could be
 * a guest user). Various functions are also made available for managing saved
 * user challenges and tasks, as well as logging out the user.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithCurrentUser =
  WrappedComponent => connect(mapStateToProps, mapDispatchToProps)(WrappedComponent)

export const mapStateToProps = state => {
  const props = {user: null}

  const userId = _get(state, 'currentUser.userId')
  const userEntity = _get(state, `entities.users.${userId}`)
  if (userEntity) {
    props.user =
      denormalize(userEntity, userDenormalizationSchema(), state.entities)

    if (props.user) {
      const endUser = AsEndUser(props.user)
      props.user.isLoggedIn = endUser.isLoggedIn()
      props.user.isSuperUser = endUser.isSuperUser()
    }
  }

  return props
}

export const mapDispatchToProps = dispatch => {
  return {
    logoutUser: () => dispatch(logoutUser()),

    saveChallenge: (userId, challengeId) =>
      dispatch(saveChallenge(userId, challengeId)),

    unsaveChallenge: (userId, challengeId) =>
      dispatch(unsaveChallenge(userId, challengeId)),

    saveTask: (userId, taskId) =>
      dispatch(saveTask(userId, taskId)),

    unsaveTask: (userId, taskId) =>
      dispatch(unsaveTask(userId, taskId)),

    updateUserSettings: (userId, settings) =>
      dispatch(updateUserSettings(userId, settings))
  }
}

export default WithCurrentUser
