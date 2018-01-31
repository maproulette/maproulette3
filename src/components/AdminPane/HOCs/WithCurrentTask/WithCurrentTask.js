import React, { Component } from 'react'
import { denormalize } from 'normalizr'
import { connect } from 'react-redux'
import _get from 'lodash/get'
import _omit from 'lodash/omit'
import { taskDenormalizationSchema,
         fetchTask,
         fetchTaskComments,
         saveTask,
         deleteTask } from '../../../../services/Task/Task'

/**
 * WithCurrentTask makes available to the WrappedComponent the current task
 * from the route as well as relevant admin functions like save and delete.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithCurrentTask = function(WrappedComponent) {
  return class extends Component {
    state = {
      loading: true,
    }

    currentTaskId = () =>
      parseInt(_get(this.props, 'match.params.taskId'), 10)

    componentDidMount() {
      const taskId = this.currentTaskId()

      if (!isNaN(taskId)) {
        Promise.all([
          this.props.fetchTask(taskId),
          this.props.fetchTaskComments(taskId),
        ]).then(() => this.setState({loading: false}))
      }
      else {
        this.setState({loading: false})
      }
    }

    render() {
      const taskId = this.currentTaskId()
      const task = isNaN(taskId) ? null :
        denormalize(_get(this.props, `entities.tasks.${taskId}`),
                    taskDenormalizationSchema(),
                    this.props.entities)

      return <WrappedComponent key={taskId}
                               task={task}
                               challengeId={parseInt(_get(this.props, 'match.params.challengeId'), 10)}
                               projectId={parseInt(_get(this.props, 'match.params.projectId'), 10)}
                               loading={this.state.loading}
                               {..._omit(this.props, ['entities',
                                                      'fetchTask',
                                                      'fetchTaskComments'])} />
    }
  }
}

const mapStateToProps = state => ({
  entities: state.entities,
})

const mapDispatchToProps = dispatch => ({
  fetchTask: taskId => dispatch(fetchTask(taskId)),
  fetchTaskComments: taskId =>
    dispatch(fetchTaskComments(taskId)),
  saveTask: taskData => dispatch(saveTask(taskData)),
  deleteTask: taskId => dispatch(deleteTask(taskId)),
})

export default WrappedComponent =>
  connect(mapStateToProps,
          mapDispatchToProps)(WithCurrentTask(WrappedComponent))
