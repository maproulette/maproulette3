import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { augmentClusteredTasks } from '../../../services/Task/ClusteredTask'

/**
 * WithClusteredTasks provides a clusteredTasks prop containing the current
 * clustered task data from the redux store.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithClusteredTasks = WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(WrappedComponent)

export const mapStateToProps = state => ({
  clusteredTasks: state.currentClusteredTasks,
  taskClusters: state.currentTaskClusters,
})

export const mapDispatchToProps = dispatch => bindActionCreators({
  augmentClusteredTasks,
}, dispatch)

export default WithClusteredTasks
