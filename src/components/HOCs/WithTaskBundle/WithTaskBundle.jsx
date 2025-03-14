import _omit from "lodash/omit";
import { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  bundleTasks,
  deleteTaskBundle,
  fetchTaskBundle,
  refreshMultipleTaskLocks,
  releaseMultipleTasks,
  startMultipleTasks,
  updateTaskBundle,
} from "../../../services/Task/Task";

const LOCK_REFRESH_INTERVAL = 600000; // 10 minutes

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
      loading: false,
      failedLocks: null,
      failedUnlocks: null,
      failedRefreshTasks: null,
      bundleTypeMismatchError: false,
      fetchBundleError: false,
      updateTaskBundleError: false,
    };

    refreshLockInterval = null;

    async componentDidMount() {
      const { task } = this.props;
      if (Number.isFinite(task?.bundleId)) {
        await this.fetchBundle(task.bundleId);
      }
      this.updateBundlingConditions();
      window.addEventListener("beforeunload", this.handleBeforeUnload);
    }

    async componentDidUpdate(prevProps) {
      const { task } = this.props;

      if (task?.id !== prevProps?.task?.id || this.props.taskReadOnly !== prevProps.taskReadOnly) {
        if (this.state.taskBundle) {
          this.unlockTasks(this.state.taskBundle.taskIds);
        }

        this.setState({
          selectedTasks: [],
          taskBundle: null,
          initialBundle: null,
          loading: false,
          error: null,
        });
        if (Number.isFinite(task?.bundleId)) {
          await this.fetchBundle(task.bundleId);
        }
        this.updateBundlingConditions();
      }
    }

    componentWillUnmount() {
      this.stopLockRefresh();
      if (this.state.taskBundle) {
        this.unlockTasks(this.state.taskBundle.taskIds);
      }
      window.removeEventListener("beforeunload", this.handleBeforeUnload);
    }

    handleBeforeUnload = () => {
      this.stopLockRefresh();
      if (this.state.taskBundle) {
        this.unlockTasks(this.state.taskBundle.taskIds);
      }
    };

    startLockRefresh = (taskIds) => {
      this.stopLockRefresh();
      this.refreshLockInterval = setInterval(() => {
        this.props.refreshMultipleTaskLocks(
          taskIds.filter((taskId) => taskId !== this.props.task.id),
        );
      }, LOCK_REFRESH_INTERVAL);
    };

    stopLockRefresh = () => {
      clearInterval(this.refreshLockInterval);
      this.refreshLockInterval = null;
    };

    fetchBundle = async (bundleId) => {
      const { task, workspace, history, fetchTaskBundle } = this.props;
      this.setState({ loading: true, fetchBundleError: false });

      try {
        const taskBundle = await fetchTaskBundle(bundleId, !this.state.bundleEditsDisabled);
        this.handlePrimaryTaskRedirect(taskBundle, task, workspace, history);
        this.setState({
          taskBundle,
          initialBundle: taskBundle,
          selectedTasks: taskBundle?.taskIds || [],
          fetchBundleError: false,
        });
        this.updateBundlingConditions();
        if (!this.props.taskReadOnly && taskBundle) {
          this.startLockRefresh(taskBundle.taskIds);
        }
      } catch (error) {
        console.error("Error fetching bundle:", error);
        this.setState({ fetchBundleError: true });
      } finally {
        this.setState({ loading: false });
      }
    };

    updateBundlingConditions = () => {
      const { task, taskReadOnly, workspace, user, name } = this.props;

      // Check if read-only first
      if (taskReadOnly) {
        this.setState({ bundleEditsDisabled: true });
        return;
      }

      // Check workspace type
      const workspaceName = workspace?.name || name;
      const isCompletionWorkspace = ["taskCompletion"].includes(workspaceName);
      if (!isCompletionWorkspace) {
        this.setState({ bundleEditsDisabled: true });
        return;
      }

      // Check completion status
      const isReviewCompleted = task?.reviewStatus === 2;
      const isTaskCompleted = [0, 3, 6].includes(task?.status);
      const completionStatus = isReviewCompleted || isTaskCompleted;

      // Check super user permissions
      if (user.isSuperUser && completionStatus) {
        this.setState({ bundleEditsDisabled: false });
        return;
      }

      // Check mapper edit permissions
      const hasNoCompletion = !task?.completedBy;
      const isTaskCompleter = user.id === task.completedBy;
      const enableMapperEdits = hasNoCompletion || isTaskCompleter;

      if (enableMapperEdits && completionStatus) {
        this.setState({ bundleEditsDisabled: false });
        return;
      }

      // If none of the above conditions are met, disable edits
      this.setState({ bundleEditsDisabled: true });
    };

    handlePrimaryTaskRedirect = (taskBundle, task, workspace, history) => {
      // Exit early if this is already the primary task
      if (task.isBundlePrimary) {
        return;
      }

      // Find the primary task
      const primaryTask = taskBundle.tasks.find((task) => task.isBundlePrimary);
      if (!primaryTask) {
        console.error("Primary task not found in task bundle.");
        return;
      }

      // Determine if we're in meta-review
      const currentPath = history?.location?.pathname;
      const isMetaReview = currentPath ? currentPath.includes("meta-review") : false;

      // Determine the location suffix
      let location = "";
      if (workspace?.name === "taskReview") {
        location = isMetaReview ? "/meta-review" : "/review";
      }

      // Perform the redirect
      const redirectPath = `/challenge/${primaryTask.parent}/task/${primaryTask.id}${location}`;
      history.push(redirectPath);
    };

    resetSelectedTasks = () => {
      if (this.state.resetSelectedTasks) {
        this.state.resetSelectedTasks();
      }
    };

    lockTasks = async (taskIds) => {
      const { task } = this.props;

      this.setState({ loading: true, failedLocks: null });
      try {
        const tasks = await this.props.startMultipleTasks(
          taskIds.filter((taskId) => taskId !== task.id),
        );
        return tasks;
      } catch (error) {
        this.setState({ failedLocks: taskIds });
      } finally {
        this.setState({ loading: false });
      }
    };

    unlockTasks = async (taskIds) => {
      this.setState({ failedUnlocks: null });
      try {
        await this.props.releaseMultipleTasks(taskIds);
      } catch (error) {
        this.setState({ failedUnlocks: taskIds });
      }
    };

    refreshTaskLock = async (taskIds) => {
      const { task } = this.props;

      this.setState({ failedRefreshTasks: null });
      try {
        await this.props.refreshMultipleTaskLocks(taskIds.filter((taskId) => taskId !== task.id));
      } catch (error) {
        console.error("Error refreshing task lock:", error);
        this.setState({ failedRefreshTasks: taskIds });
      }
    };

    createTaskBundle = async (taskIds) => {
      if (taskIds.length > 50) {
        this.setState({ bundleLimitError: true });
        return;
      }
      const { tasks: lockedTasks, locked } = await this.lockTasks(
        taskIds.filter((taskId) => taskId !== this.props.task.id),
      );

      if (locked) {
        this.setState((prevState) => ({
          failedLocks: null,
          taskBundle: {
            ...prevState.taskBundle,
            tasks: [this.props.task, ...lockedTasks],
            taskIds: taskIds,
          },
        }));
        this.startLockRefresh(taskIds);
      } else {
        this.setState({ failedLocks: lockedTasks });
      }
    };

    addTaskToBundle = async (taskId) => {
      const { tasks: lockedTasks, locked } = await this.lockTasks([taskId]);

      if (locked) {
        this.setState((prevState) => ({
          failedLocks: null,
          taskBundle: {
            ...prevState.taskBundle,
            tasks: [...prevState.taskBundle.tasks, ...lockedTasks],
            taskIds: [...prevState.taskBundle.taskIds, taskId],
          },
        }));
        this.startLockRefresh([...this.state.taskBundle.taskIds, taskId]);
      } else {
        this.setState({ failedLocks: lockedTasks });
      }
    };

    removeTaskFromBundle = async (taskId) => {
      const { taskBundle, initialBundle } = this.state;

      if (initialBundle && !initialBundle?.taskIds.includes(taskId)) {
        await this.unlockTasks([taskId]);
      }

      if (taskBundle?.taskIds.length <= 2) {
        this.stopLockRefresh();
        this.setState({
          taskBundle: null,
          selectedTasks: [],
        });
        return;
      }

      const updatedTaskIds = taskBundle.taskIds.filter((id) => id !== taskId);
      const updatedTasks = taskBundle.tasks.filter((task) => task.id !== taskId);

      const updatedTaskBundle = {
        ...taskBundle,
        taskIds: updatedTaskIds,
        tasks: updatedTasks,
      };

      this.stopLockRefresh();
      this.startLockRefresh(updatedTaskIds);

      this.setState({
        taskBundle: updatedTaskBundle,
        selectedTasks: updatedTaskIds,
      });
    };

    clearActiveTaskBundle = async () => {
      const { taskBundle, initialBundle } = this.state;
      const taskIds = taskBundle.taskIds.filter(
        (taskId) => !initialBundle?.taskIds.includes(taskId),
      );
      await this.unlockTasks(taskIds);
      this.setState({
        selectedTasks: [],
        taskBundle: null,
      });
      this.resetSelectedTasks();
    };

    resetTaskBundle = () => {
      this.setState({
        selectedTasks: this.state.initialBundle?.taskIds,
        taskBundle: this.state.initialBundle,
      });
    };

    updateTaskBundle = async () => {
      const { taskBundle, initialBundle } = this.state;
      if (taskBundle || initialBundle) {
        try {
          this.setState({ updateTaskBundleError: false });

          if (!taskBundle && initialBundle) {
            await this.props.deleteTaskBundle(initialBundle?.bundleId);
            return null;
          }

          if (taskBundle && initialBundle) {
            return await this.props.updateTaskBundle(initialBundle, taskBundle.taskIds);
          }

          return await this.props.bundleTasks(this.props.taskId, taskBundle.taskIds);
        } catch (error) {
          console.error("Error updating task bundle:", error);
          this.setState({ updateTaskBundleError: true });
        }
      }
      return null;
    };

    render() {
      return (
        <WrappedComponent
          {..._omit(this.props, [
            "bundleTasks",
            "deleteTaskBundle",
            "updateTaskBundle",
            "removeTaskFromBundle",
          ])}
          taskBundle={this.state.taskBundle}
          initialBundle={this.state.initialBundle}
          taskBundleLoading={this.state.loading}
          createTaskBundle={this.createTaskBundle}
          updateTaskBundle={this.updateTaskBundle}
          resetTaskBundle={this.resetTaskBundle}
          removeTaskFromBundle={this.removeTaskFromBundle}
          addTaskToBundle={this.addTaskToBundle}
          clearActiveTaskBundle={this.clearActiveTaskBundle}
          setSelectedTasks={(selectedTasks) => this.setState({ selectedTasks })}
          selectedTasks={this.state.selectedTasks}
          bundleEditsDisabled={this.state.bundleEditsDisabled}
          setResetSelectedTasksAccessor={(f) => this.setState({ resetSelectedTasks: f })}
          resetSelectedTasks={this.resetSelectedTasks}
          error={this.state.error}
          failedLocks={this.state.failedLocks}
          failedUnlocks={this.state.failedUnlocks}
          failedRefreshTasks={this.state.failedRefreshTasks}
          bundleTypeMismatchError={this.state.bundleTypeMismatchError}
          fetchBundleError={this.state.fetchBundleError}
          updateTaskBundleError={this.state.updateTaskBundleError}
        />
      );
    }
  };
}

export const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchTaskBundle,
      bundleTasks,
      deleteTaskBundle,
      updateTaskBundle,
      refreshMultipleTaskLocks,
      startMultipleTasks,
      releaseMultipleTasks,
    },
    dispatch,
  );

export default (WrappedComponent) =>
  connect(null, mapDispatchToProps)(WithTaskBundle(WrappedComponent));
