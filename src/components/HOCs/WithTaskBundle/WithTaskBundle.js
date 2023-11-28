import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _omit from 'lodash/omit'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import { bundleTasks, deleteTaskBundle, removeTaskFromBundle, fetchTaskBundle } from '../../../services/Task/Task'

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
    }

    setupBundle = bundleId => {
      this.setState({loading: true})
      this.props.fetchTaskBundle(bundleId).then(taskBundle => {
        this.setState({taskBundle, loading: false})
      })
    }

    createTaskBundle = (taskIds, bundleTypeMismatch, name) => {
      this.props.bundleTasks(taskIds, bundleTypeMismatch, name).then(taskBundle => {
        this.setState({taskBundle})
      })
    }

    removeTaskBundle = (bundleId, taskId) => {
      if (_isFinite(bundleId) && _get(this.state, 'taskBundle.bundleId') === bundleId) {
        // The task id we pass to delete will be left locked, so it needs to be
        // the current task even if it's not the primary task in the bundle
        this.props.deleteTaskBundle(bundleId, taskId)
        this.clearActiveTaskBundle()
      }
    }

    removeTaskFromBundle = async (bundleId, taskId) => {
      this.setState({loading: true})
      if(this.state.taskBundle.taskIds.length === 2) {
        this.props.deleteTaskBundle(bundleId, this.state.taskBundle.taskIds[0])
        this.clearActiveTaskBundle()
        this.setState({loading: false})
        return
      }

      this.props.removeTaskFromBundle(bundleId, taskId).then(taskBundle => {
        this.setState({taskBundle, loading: false})
      })
    };

    clearActiveTaskBundle = () => {
      this.setState({taskBundle: null, loading: false})
    }

    componentDidMount() {
      if (_isFinite(_get(this.props, 'task.bundleId'))) {
        this.setupBundle(this.props.task.bundleId)
      }
    }

    componentDidUpdate(prevProps) {
      if (_get(this.props, 'task.id') !== _get(prevProps, 'task.id')) {
        if (_isFinite(_get(this.props, 'task.bundleId'))) {
          this.setupBundle(this.props.task.bundleId)
        }
        else {
          this.clearActiveTaskBundle()
        }
      }
    }

    render() {
      return (
        <WrappedComponent
          {..._omit(this.props, ['bundleTasks', 'deleteTaskBundle', 'removeTaskFromBundle'])}
          taskBundle={this.state.taskBundle}
          taskBundleLoading={this.state.loading}
          createTaskBundle={this.createTaskBundle}
          removeTaskBundle={this.removeTaskBundle}
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
  removeTaskFromBundle,
  fetchTaskBundle,
}, dispatch)

export default WrappedComponent =>
  connect(null, mapDispatchToProps)(WithTaskBundle(WrappedComponent))
