import { connect } from 'react-redux'
import { fetchClusteredTasks }
       from '../../../services/Task/ClusteredTask'

/**
 * WithClusteredTasks provides a clusteredTasks prop containing the current
 * clustered task data from the redux store, as well as a fetchClusteredTasks
 * function for retrieving the clustered tasks for a given challenge.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithClusteredTasks = WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(WrappedComponent)

export const mapStateToProps = state => ({
  clusteredTasks: state.currentClusteredTasks,
})

export const mapDispatchToProps = dispatch => ({
  fetchClusteredTasks: (challengeId, isVirtualChallenge) =>
    dispatch(fetchClusteredTasks(challengeId, isVirtualChallenge)),
})

export default WithClusteredTasks
