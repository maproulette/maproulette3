import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _omit from 'lodash/omit'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import { bundleTasks, deleteTaskBundle, fetchTaskBundle }
       from '../../../services/Task/Task'

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
      if (!_isFinite(bundleId)) {
        return
      }

      this.setState({loading: true})
      this.props.fetchTaskBundle(bundleId).then(taskBundle => {
        this.setState({taskBundle, loading: false})
      })
    }

    createTaskBundle = (taskIds, name) => {
      this.props.bundleTasks(taskIds, name).then(taskBundle => {
        this.setState({taskBundle})
      })
    }

    removeTaskBundle = (bundleId, primaryTaskId) => {
      if (_isFinite(bundleId) && _get(this.state, 'taskBundle.bundleId') === bundleId) {
        this.props.deleteTaskBundle(bundleId, primaryTaskId)
        this.clearActiveTaskBundle()
      }
    }

    clearActiveTaskBundle = () => {
      this.setState({taskBundle: null, loading: false})
    }

    componentDidMount() {
      if (_get(this.props, 'task.isBundlePrimary', false)) {
        this.setupBundle(this.props.task.bundleId)
      }
    }

    componentDidUpdate(prevProps) {
      if (_get(this.props, 'task.id') !== _get(prevProps, 'task.id')) {
        if (_get(this.props, 'task.isBundlePrimary', false)) {
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
          {..._omit(this.props, ['bundleTasks', 'deleteTaskBundle'])}
          taskBundle={this.state.taskBundle}
          taskBundleLoading={this.state.loading}
          createTaskBundle={this.createTaskBundle}
          removeTaskBundle={this.removeTaskBundle}
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
  fetchTaskBundle,
}, dispatch)

export default WrappedComponent =>
  connect(null, mapDispatchToProps)(WithTaskBundle(WrappedComponent))
