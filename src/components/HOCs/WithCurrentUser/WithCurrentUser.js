import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { denormalize } from 'normalizr'
import _get from 'lodash/get'
import { logoutUser,
         fetchUser,
         loadCompleteUser,
         saveChallenge, unsaveChallenge,
         saveTask, unsaveTask,
         fetchTopChallenges,
         fetchSavedChallenges,
         fetchSavedTasks,
         fetchUserActivity,
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
  const props = {user: null, allUsers: null}

  const userId = _get(state, 'currentUser.userId')
  const userEntity = _get(state, `entities.users.${userId}`)
  if (userEntity) {
    props.user =
      denormalize(userEntity, userDenormalizationSchema(), state.entities)

    if (props.user) {
      const endUser = AsEndUser(props.user)
      props.user.isLoggedIn = endUser.isLoggedIn()
      props.user.isSuperUser = endUser.isSuperUser()
      props.user.hasUnreadNotifications = endUser.hasUnreadNotifications()
    }
  }

  props.allUsers = _get(state, "entities.users")
  return props
}

export const mapDispatchToProps = dispatch => {
  const actions = bindActionCreators({
    fetchUser,
    loadCompleteUser,
    logoutUser,
    fetchSavedChallenges,
    saveChallenge,
    unsaveChallenge,
    fetchSavedTasks,
    saveTask,
    unsaveTask,
    fetchTopChallenges,
    fetchUserActivity,
  }, dispatch)

  return actions
}

export default WithCurrentUser
