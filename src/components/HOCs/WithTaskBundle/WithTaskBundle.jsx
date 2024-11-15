import { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _omit from 'lodash/omit'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import { 
  bundleTasks, 
  deleteTaskBundle,
  fetchTaskBundle, 
  updateTaskBundle, 
  releaseTask, 
  startTask 
} from '../../../services/Task/Task'

/**
 * WithTaskBundle passes down methods for creating new task bundles and
 * updating existing ones, as well as tracking a current bundle
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export function WithTaskBundle(WrappedComponent) {
  return class extends Component {
    state = {
      initialBundle: null,
      taskBundle: null,
      bundleEditsDisabled: false,
      selectedTasks: [],
      resetSelectedTasks: null,
      errorMessage: null,
      loading: false,
    }

    async componentDidMount() {
      const { task } = this.props
      if (_isFinite(_get(task, 'bundleId'))) {
        await this.fetchBundle(task.bundleId)
      }
      this.updateBundlingConditions()
    }

    async componentDidUpdate(prevProps) {
      const { task } = this.props
      if (_get(task, 'id') !== _get(prevProps, 'task.id')) {
        this.setState({ selectedTasks: [], taskBundle: null, initialBundle: null, loading: false })
        if (_isFinite(_get(task, 'bundleId'))) {
          await this.fetchBundle(task.bundleId)
        }
        this.updateBundlingConditions()
      }
    }

    fetchBundle = async (bundleId) => {
      const { task, workspace, history, fetchTaskBundle } = this.props
      this.setState({ loading: true })
      try {
        const taskBundle = await fetchTaskBundle(bundleId, !this.state.bundleEditsDisabled)
        this.handlePrimaryTaskRedirect(taskBundle, task, workspace, history)
        this.setState({
          taskBundle,
          initialBundle: taskBundle,
          selectedTasks: taskBundle?.taskIds || [],
        })
      } catch (error) {
        console.error("Error setting up bundle:", error)
      } finally {
        this.setState({ loading: false })
      }
    }

    updateBundlingConditions = () => {
      const { task, taskReadOnly, workspace, user, name } = this.props
      const workspaceName = workspace?.name || name
      const isCompletionWorkspace = ["taskCompletion"].includes(workspaceName)
      const isReviewWorkspace = ["taskReview"].includes(workspaceName)

      const completionStatus = isCompletionWorkspace && ([2].includes(task?.reviewStatus) || [0, 3, 6].includes(task?.status))
      const enableMapperEdits = !task?.completedBy || user.id === task.completedBy
      const enableSuperUserEdits = user.isSuperUser && (completionStatus || isReviewWorkspace)
      const bundleEditsDisabled = taskReadOnly || !(enableMapperEdits && completionStatus) && !enableSuperUserEdits

      this.setState({ bundleEditsDisabled })
    }

    handlePrimaryTaskRedirect = (taskBundle, task, workspace, history) => {
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

    resetSelectedTasks = () => {
      if (this.state.resetSelectedTasks) {
        this.state.resetSelectedTasks()
      }
    }

    unlockTasks = async (taskBundle,initialBundle) => {
      const tasksToUnlock = taskBundle.taskIds
      if(initialBundle){
        tasksToUnlock.filter(taskId => !initialBundle.taskIds.includes(taskId))
      }
      await Promise.all(tasksToUnlock.map(taskId =>
        this.props.releaseTask(taskId).then(() => {
          setTimeout(() => localStorage.removeItem(`lock-${taskId}`), 1500)
        }).catch(console.error)
      ))
    }

    lockTask = async (taskId) => {
      this.setState({ loading: true });
      try {
        const task = await this.props.startTask(taskId, true);
        setTimeout(() => localStorage.removeItem(`lock-${taskId}`), 1500);
        return task.entities.tasks[taskId];
      } catch (error) {
        console.error(`Failed to lock task ${taskId}:`, error);
        this.setState({ errorMessage: `Failed to lock task ${taskId}. Please try again.` });
        throw error;
      } finally {
        this.setState({ loading: false });
      }
    }

    createTaskBundle = async (taskIds, bundleTypeMismatch) => {
      if (bundleTypeMismatch) {
        throw new Error("Bundle type mismatch")
      }

      try {
        const updatedTasks = await Promise.all(taskIds.map(taskId => 
          this.lockTask(taskId)
        ))

        this.setState({ taskBundle: { ...this.state.taskBundle, tasks: updatedTasks, taskIds } })
      } catch (error) {
        console.error("Failed to create task bundle due to locking error:", error)
      }
    }

    resetTaskBundle = () => {
      const { initialBundle, taskBundle } = this.state
      if (initialBundle && initialBundle !== taskBundle) {
        this.setState({
          selectedTasks: initialBundle?.taskIds,
          taskBundle: initialBundle,
        })
      }
    }

    removeTaskFromBundle = async (taskId) => {
      const { taskBundle } = this.state
      if (taskBundle?.taskIds.length === 2) {
        this.setState({ taskBundle: null })
        return
      }

      const updatedTaskIds = taskBundle.taskIds.filter(id => id !== taskId)
      const updatedTasks = taskBundle.tasks.filter(task => task.id !== taskId)
      const updatedTaskBundle = { ...taskBundle, taskIds: updatedTaskIds, tasks: updatedTasks }
      await this.unlockTasks(updatedTaskBundle, taskBundle)

      this.setState({ taskBundle: updatedTaskBundle })
    }

    clearActiveTaskBundle = async () => {
      const { taskBundle, initialBundle } = this.state
        await this.unlockTasks(taskBundle, initialBundle)
        this.setState({
          selectedTasks: [],
        taskBundle: null,
      })
      this.resetSelectedTasks()
    }

    updateTaskBundle = async () => {
      const { taskBundle, initialBundle } = this.state
      if (taskBundle || initialBundle) {
        if (!taskBundle && initialBundle) {
          await this.props.deleteTaskBundle(initialBundle.bundleId)
          return null
        } else if (taskBundle && initialBundle) {
          return await this.props.updateTaskBundle(initialBundle, taskBundle.taskIds)
        } else {
          return await this.props.bundleTasks(this.props.taskId, taskBundle.taskIds)
        }
      }
      return taskBundle
    }

    // Render method
    render() {
      return (
        <WrappedComponent
          {..._omit(this.props, ['bundleTasks', 'deleteTaskBundle', 'updateTaskBundle', 'removeTaskFromBundle'])}
          taskBundle={this.state.taskBundle}
          initialBundle={this.state.initialBundle}
          taskBundleLoading={this.state.loading}
          createTaskBundle={this.createTaskBundle}
          updateTaskBundle={this.updateTaskBundle}
          resetTaskBundle={this.resetTaskBundle}
          removeTaskFromBundle={this.removeTaskFromBundle}
          clearActiveTaskBundle={this.clearActiveTaskBundle}
          setSelectedTasks={(selectedTasks) => this.setState({ selectedTasks })}
          selectedTasks={this.state.selectedTasks}
          bundleEditsDisabled={this.state.bundleEditsDisabled}
          setResetSelectedTasksAccessor={(f) => this.setState({ resetSelectedTasks: f })}
          resetSelectedTasks={this.resetSelectedTasks}
          errorMessage={this.state.errorMessage}
        />
      )
    }
  }
}

export const mapDispatchToProps = dispatch => bindActionCreators({
  fetchTaskBundle,
  bundleTasks,
  deleteTaskBundle,
  updateTaskBundle,
  releaseTask,
  startTask
}, dispatch)

export default WrappedComponent =>
  connect(null, mapDispatchToProps)(WithTaskBundle(WrappedComponent))
