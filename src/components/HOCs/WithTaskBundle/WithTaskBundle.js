import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _omit from 'lodash/omit'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import { bundleTasks, deleteTaskBundle, resetTaskBundle, removeTaskFromBundle, fetchTaskBundle } from '../../../services/Task/Task'
import { releaseTask } from '../../../services/Task/Task'

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
      bundleEditsDisabled: false,
      taskBundle: null,
      completingTask: null,
      initialBundle: null,
      selectedTasks: [],
      resetSelectedTasks: null
    }

    componentDidMount() {
      const { task } = this.props
      this.setBundlingConditions()
      this.setState({ completingTask: null })

      if (_isFinite(_get(task, 'bundleId')) && task?.status === 0) {
        this.props.deleteTaskBundle(task.bundleId)
      } else if (_isFinite(_get(task, 'bundleId'))){
        this.setupBundle(task.bundleId)
      }

      window.addEventListener('beforeunload', this.handleBeforeUnload)
    }

    componentDidUpdate(prevProps, prevState) {
      const { initialBundle } = this.state
      const { task } = this.props
      if (_get(task, 'id') !== _get(prevProps, 'task.id')) {
        this.setBundlingConditions()
        this.setState({ selectedTasks: [], initialBundle: null, taskBundle: null, loading: false, completingTask: null })
        if (_isFinite(_get(task, 'bundleId'))) {
          this.setupBundle(task.bundleId)
        }

        const prevInitialBundle = prevState.initialBundle
        const prevTaskBundle = prevState.taskBundle
        if ((prevTaskBundle || prevInitialBundle) && prevTaskBundle !== prevInitialBundle && !prevState.completingTask) {
          if (initialBundle) {
            // Whenever the user redirects, skips a task, or refreshes and there is a 
            // new bundle state, the bundle state needs to reset to its initial value.
            this.props.resetTaskBundle(prevInitialBundle)
          } else {
            // Whenever the user redirects, skips a task, or refreshes and there was 
            // no initial value, the bundle will be destroyed.
            this.props.deleteTaskBundle(prevTaskBundle.bundleId)
            this.clearActiveTaskBundle()
          }
        } else if ((prevTaskBundle && prevInitialBundle) && prevTaskBundle !== prevInitialBundle && prevState.completingTask) {
          const tasksToUnlock = prevInitialBundle.taskIds.filter(taskId => !prevTaskBundle.taskIds.includes(taskId))
          tasksToUnlock.map(taskId => {
            this.props.releaseTask(taskId).then(() => {
              // wait for lock to be cleared in db and provide some leeway 
              // time with setTimeout before triggering storage event
              setTimeout(() => localStorage.removeItem(`lock-${taskId}`), 1500)
            }).catch(() => null)
          })
        }
      }
    }

    componentWillUnmount() {
      this.resetBundle()

      this.setState({ selectedTasks: [], initialBundle: null, taskBundle: null, loading: false, completingTask: null })
      window.removeEventListener('beforeunload', this.handleBeforeUnload)
    }

    setBundlingConditions = () => {
      const { task, taskReadOnly, workspace, user, name } = this.props
      const isCompletionWorkspace = workspace?.name === "taskCompletion" || name === "taskCompletion"
      const isReviewWorkspace = workspace?.name === "taskReview" || name === "taskReview"
      
      const completionStatus = isCompletionWorkspace && ([2].includes(task?.reviewStatus) || [0, 3, 6].includes(task?.status))
      
      const enableMapperEdits = (!task?.completedBy || user.id === task.completedBy) && completionStatus && !isReviewWorkspace
      const enableSuperUserEdits = user.isSuperUser && (completionStatus || isReviewWorkspace)
      
      const bundleEditsDisabled = taskReadOnly || (!enableMapperEdits && !enableSuperUserEdits)

      this.setState({ bundleEditsDisabled })
    }

    handleBeforeUnload = () => {
      this.resetBundle()

      this.setState({ selectedTasks: [], initialBundle: null, taskBundle: null, loading: false, completingTask: null })
    }

    resetBundle = () => {
      const { initialBundle } = this.state
      if (!this.state.completingTask) {
        this.resetSelectedTasks()
        if (
          (this.state.taskBundle || this.state.initialBundle) &&
          this.state.taskBundle !== this.state.initialBundle &&
          !this.state.completingTask
        ) {
          if (initialBundle) {
            // Whenever the user redirects, skips a task, or refreshes and there is a 
            // new bundle state, the bundle state needs to reset to its initial value.
            this.props.resetTaskBundle(initialBundle)
          } else {
            // Whenever the user redirects, skips a task, or refreshes and there was 
            // no initial value, the bundle will be destroyed.
            this.props.deleteTaskBundle(this.state.taskBundle.bundleId)
            this.clearActiveTaskBundle()
          }
        }
      } else if (
        this.state.taskBundle &&
        this.state.initialBundle &&
        this.state.taskBundle !== this.state.initialBundle &&
        this.state.completingTask
      ) {
        const tasksToUnlock = this.state.initialBundle.taskIds.filter(
          (taskId) => !this.state.taskBundle.taskIds.includes(taskId)
        )
        tasksToUnlock.map((taskId) => {
          this.props.releaseTask(taskId).then(() => {
            // wait for lock to be cleared in db and provide some leeway 
            // time with setTimeout before triggering storage event
            setTimeout(
              () => localStorage.removeItem(`lock-${taskId}`),
              1500
            )
          }).catch(() => null)
        })
      }
    }

    setupBundle = bundleId => {
      const { task, workspace, history, fetchTaskBundle } = this.props
      this.setState({ loading: true })
      fetchTaskBundle(bundleId, !this.state.bundleEditsDisabled).then(taskBundle => {
        if(taskBundle) {
          if (!task.isBundlePrimary) {
            const primaryTask = taskBundle.tasks.find(task => task.isBundlePrimary)
            const isMetaReview = history?.location?.pathname?.includes("meta-review")
            const location = workspace?.name === "taskReview" ? (isMetaReview ? "/meta-review" : "/review") : ""
            if (primaryTask) {
              history.push(`/challenge/${primaryTask.parent}/task/${primaryTask.id}${location}`)
            } else {
              console.error("Primary task not found in task bundle.")
            }
          }
        }
        this.setState({ initialBundle: taskBundle, selectedTasks: taskBundle?.taskIds, taskBundle })
      })
      this.setState({ loading: false })
    }

    createTaskBundle = (taskIds, bundleTypeMismatch, name) => {
      this.setState({loading: true})
      this.props.bundleTasks(this.props.taskId, taskIds, bundleTypeMismatch, name).then(taskBundle => {
        this.setState({selectedTasks: taskBundle?.taskIds, taskBundle, loading: false})
      })
    }

    resetToInitialTaskBundle = (bundleId) => {
      const { initialBundle, taskBundle } = this.state
      if(initialBundle && initialBundle !== taskBundle){
        this.setState({loading: true})
        this.props.resetTaskBundle(initialBundle).then(taskBundle => {
          this.setState({selectedTasks: taskBundle?.taskIds, taskBundle, loading: false})
        })
      } else if (
        _isFinite(bundleId) &&
        _get(this.state, 'taskBundle.bundleId') === bundleId &&
        (this.props.task.status === 0)
      ) {
        // The task id we pass to delete will be left locked, so it needs to be
        // the current task even if it's not the primary task in the bundle
        this.props.deleteTaskBundle(bundleId)
        this.clearActiveTaskBundle()
      }
    }

    resetSelectedTasks = () => {
      if (this.state.resetSelectedTasks) {
        this.state.resetSelectedTasks()
      }
    }

    removeTaskFromBundle = async (bundleId, taskId) => {
      const { initialBundle } = this.state
      this.setState({loading: true})
      if(this.state.taskBundle?.taskIds.length === 2 && !this.state.initialBundle && this.props.task.status === 0) {
        this.props.deleteTaskBundle(bundleId)
        this.clearActiveTaskBundle()
        this.setState({loading: false})
        return
      }

      this.props.removeTaskFromBundle(initialBundle?.taskIds, bundleId, taskId).then(taskBundle => {
        this.setState({taskBundle, loading: false})
      })
    }

    clearActiveTaskBundle = () => {
      this.setState({selectedTasks: [], taskBundle: null, loading: false})
      this.resetSelectedTasks()

    }

    setCompletingTask = task => {
      this.setState({ selectedTasks: [], completingTask: task })
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
          resetToInitialTaskBundle={this.resetToInitialTaskBundle}
          initialBundle={this.state.initialBundle}
          removeTaskFromBundle={this.removeTaskFromBundle}
          clearActiveTaskBundle={this.clearActiveTaskBundle}
          setSelectedTasks={(selectedTasks) => this.setState({selectedTasks})}
          selectedTasks={this.state.selectedTasks}
          bundleEditsDisabled={this.state.bundleEditsDisabled}
          setResetSelectedTasksAccessor={(f) => this.setState({resetSelectedTasks: f})}
          resetSelectedTasks={this.resetSelectedTasks}
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
  releaseTask
}, dispatch)

export default WrappedComponent =>
  connect(null, mapDispatchToProps)(WithTaskBundle(WrappedComponent))
