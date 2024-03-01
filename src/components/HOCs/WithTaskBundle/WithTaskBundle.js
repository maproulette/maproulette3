import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _omit from 'lodash/omit'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import { bundleTasks, deleteTaskBundle, resetTaskBundle, removeTaskFromBundle, fetchTaskBundle } from '../../../services/Task/Task'

/**
 * WithTaskBundle passes down methods for creating new task bundles and
 * updating existing ones, as well as tracking a current bundle
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export function WithTaskBundle(WrappedComponent) {
  return class extends Component {
    state = {
      loading: false,
      taskBundle: null,
      completingTask: null,
      initialBundle: null,
      selectedTasks: [],
      resetSelectedTasks: null
    }

    componentDidMount() {
      const { task } = this.props
      this.setState({ completingTask: null })

      if (_isFinite(_get(task, 'bundleId'))) {
        this.setupBundle(task.bundleId)
      }
      window.addEventListener('beforeunload', this.handleBeforeUnload)
    }

    componentDidUpdate(prevProps, prevState) {
      const { initialBundle } = this.state
      const { task } = this.props
      if (_get(task, 'id') !== _get(prevProps, 'task.id')) {
        this.setState({ initialBundle: null, taskBundle: null, loading: false, completingTask: null })
        if (_isFinite(_get(task, 'bundleId'))) {
          this.setupBundle(task.bundleId)
        }
        if ((prevState.taskBundle || prevState.initialBundle) && 
            prevState.taskBundle !== prevState.initialBundle  && 
            (!prevState.completingTask || prevProps.task.status === 3)) {
          if (initialBundle) {
            // Whenever the user redirects, skips a task, or refreshes and there is a 
            // new bundle state, the bundle state needs to reset to its initial value.
            this.props.resetTaskBundle(prevState.initialBundle, prevProps.task.id)
          } else {
            // Whenever the user redirects, skips a task, or refreshes and there was 
            // no intial value, the bundle will be destroyed.
            this.props.deleteTaskBundle(prevState.taskBundle.bundleId, prevProps.task.id)
          }
        }
      }
    }

    componentWillUnmount() {
      if(!this.state.completingTask){
        this.resetBundle()
      }
      window.removeEventListener('beforeunload', this.handleBeforeUnload)
    }

    handleBeforeUnload = () => {
      if(!this.state.completingTask){
        this.resetBundle()
      }
    }

    resetBundle = () => {
      const { initialBundle } = this.state
      const { task } = this.props

      if ((this.state.taskBundle || this.state.initialBundle) &&
          this.state.taskBundle !== this.state.initialBundle &&
          (!this.state.completingTask || task.status === 3)) {
        if (initialBundle) {
          // Whenever the user redirects, skips a task, or refreshes and there is a 
          // new bundle state, the bundle state needs to reset to its initial value.
          this.props.resetTaskBundle(initialBundle, task.id)
        } else {
          // Whenever the user redirects, skips a task, or refreshes and there was 
          // no intial value, the bundle will be destroyed.
          this.props.deleteTaskBundle(taskBundle.bundleId, task.id)
        }
      }
    }

    setupBundle = bundleId => {
      this.setState({loading: true})
      this.props.fetchTaskBundle(bundleId).then(taskBundle => {
        this.setState({initialBundle: taskBundle, taskBundle, loading: false})
      })
    }

    createTaskBundle = (taskIds, bundleTypeMismatch, name) => {
      this.props.bundleTasks(taskIds, bundleTypeMismatch, name).then(taskBundle => {
        this.setState({taskBundle})
      })
    }

    removeTaskBundle = (bundleId, taskId) => {
      const { initialBundle, taskBundle } = this.state
      if(initialBundle && initialBundle !== taskBundle){
        this.setState({loading: true})
        this.props.resetTaskBundle(initialBundle, this.props.task.id).then(taskBundle => {
          this.setState({taskBundle, loading: false})
        })
      } else if (
        _isFinite(bundleId) &&
        _get(this.state, 'taskBundle.bundleId') === bundleId &&
        (this.props.task.status === 0 || this.props.task.status === 3)
      ) {
        // The task id we pass to delete will be left locked, so it needs to be
        // the current task even if it's not the primary task in the bundle
        this.props.deleteTaskBundle(bundleId, taskId)
        this.clearActiveTaskBundle()
      }
    }

    removeTaskFromBundle = async (bundleId, taskId) => {
      const { initialBundle } = this.state

      this.setState({loading: true})
      if(this.state.taskBundle.taskIds.length === 2 && 
        !this.state.initialBundle && 
        (this.props.task.status === 0 || this.props.task.status === 3)) {
        this.props.deleteTaskBundle(bundleId, this.state.taskBundle.taskIds[0])
        this.clearActiveTaskBundle()
        this.setState({loading: false})
        return
      }

      this.props.removeTaskFromBundle(initialBundle?.taskIds, bundleId, taskId).then(taskBundle => {
        this.setState({taskBundle, loading: false})
      })
    }

    clearActiveTaskBundle = () => {
      this.setState({taskBundle: null, loading: false})
    }

    setCompletingTask = task => {
      this.setState({ completingTask: task })
    }

    render() {
      return (
        <WrappedComponent
          {..._omit(this.props, ['bundleTasks', 'deleteTaskBundle', 'removeTaskFromBundle'])}
          taskBundle={this.state.taskBundle}
          taskBundleLoading={this.state.loading}
          setCompletingTask={this.setCompletingTask}
          completingTask={this.props.completingTask}
          createTaskBundle={this.createTaskBundle}
          removeTaskBundle={this.removeTaskBundle}
          initialBundle={this.state.initialBundle}
          removeTaskFromBundle={this.removeTaskFromBundle}
          clearActiveTaskBundle={this.clearActiveTaskBundle}
          setSelectedTasks={(selectedTasks) => this.setState({selectedTasks})}
          selectedTasks={this.state.selectedTasks}
          setResetSelectedTasksAccessor={(f) => this.setState({resetSelectedTasks: f})}
          resetSelectedTasks={() =>
            this.state.resetSelectedTasks ? this.state.resetSelectedTasks() : null}
        />
      )
    }
  }
}

export const mapDispatchToProps = dispatch => bindActionCreators({
  bundleTasks,
  deleteTaskBundle,
  resetTaskBundle,
  removeTaskFromBundle,
  fetchTaskBundle,
}, dispatch)

export default WrappedComponent =>
  connect(null, mapDispatchToProps)(WithTaskBundle(WrappedComponent))
