import { connect } from 'react-redux'
import { denormalize } from 'normalizr'
import _get from 'lodash/get'
import { logoutUser,
         saveChallenge, unsaveChallenge,
         saveTask, unsaveTask,
         userDenormalizationSchema } from '../../../services/User/User'
import AsEndUser from '../../../services/User/AsEndUser'

const mapStateToProps = state => {
  const props = {user: null}

  const userId = _get(state, 'currentUser.userId')
  const userEntity = _get(state, `entities.users.${userId}`)
  if (userEntity) {
    props.user =
      denormalize(userEntity, userDenormalizationSchema(), state.entities)

    if (props.user) {
      const endUser = new AsEndUser(props.user)
      props.user.isLoggedIn = endUser.isLoggedIn()
      props.user.isSuperUser = endUser.isSuperUser()
    }
  }

  return props
}

const mapDispatchToProps = dispatch => {
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
  }
}

const WithCurrentUser =
  WrappedComponent => connect(mapStateToProps, mapDispatchToProps)(WrappedComponent)

export default WithCurrentUser
