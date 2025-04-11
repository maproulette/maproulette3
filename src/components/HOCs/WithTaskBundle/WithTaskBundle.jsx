import _omit from "lodash/omit";
import { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import AsCooperativeWork from "../../../interactions/Task/AsCooperativeWork";
import { addError } from "../../../services/Error/Error";
import {
  bundleTasks,
  deleteTaskBundle,
  fetchTaskBundle,
  lockMultipleTasks,
  releaseMultipleTasks,
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
      bundlingDisabledReason: null,
      selectedTasks: [],
      resetSelectedTasks: null,
      loading: false,
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

      if (task && task?.id !== prevProps?.task?.id) {
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
      this.unlockBundleTasks();
      window.removeEventListener("beforeunload", this.handleBeforeUnload);
    }

    handleBeforeUnload = () => {
      this.stopLockRefresh();
      this.unlockBundleTasks();
    };

    startLockRefresh = (taskIds) => {
      this.stopLockRefresh();

      // Filter out the primary task ID before setting up refresh
      // since the primary task is managed by WithLockedTask
      const tasksToRefresh = taskIds.filter((taskId) => taskId !== this.props.task?.id);

      if (tasksToRefresh.length === 0) {
        return;
      }

      this.props.lockMultipleTasks(tasksToRefresh).catch((error) => {
        console.log("Error refreshing task locks:", error);
      });

      this.refreshLockInterval = setInterval(() => {
        this.props.lockMultipleTasks(tasksToRefresh);
      }, LOCK_REFRESH_INTERVAL);
    };

    stopLockRefresh = () => {
      clearInterval(this.refreshLockInterval);
      this.refreshLockInterval = null;
    };

    fetchBundle = async (bundleId) => {
      const { task, workspace, history, fetchTaskBundle } = this.props;
      this.setState({ loading: true });

      try {
        const taskBundle = await fetchTaskBundle(bundleId, !this.state.bundleEditsDisabled);
        this.handlePrimaryTaskRedirect(taskBundle, task, workspace, history);

        this.setState({
          taskBundle,
          initialBundle: taskBundle,
          selectedTasks: taskBundle?.taskIds || [],
        });

        if (this.props.selectTasks && taskBundle?.tasks) {
          if (this.props.resetSelectedTasks) {
            await this.props.resetSelectedTasks();
          }

          this.props.selectTasks(taskBundle.tasks);
        }

        this.updateBundlingConditions();
        if (!this.props.taskReadOnly && taskBundle) {
          this.startLockRefresh(taskBundle.taskIds);
        }
      } catch (error) {
        console.error("Error fetching bundle:", error);
      } finally {
        this.setState({ loading: false });
      }
    };

    updateBundlingConditions = () => {
      const { task, taskReadOnly, workspace, user, name } = this.props;

      try {
        const workspaceName = workspace?.name || name;
        const isCompletionWorkspace = ["taskCompletion"].includes(workspaceName);
        let reason = null;
        let bundleEditsDisabled = false;

        switch (true) {
          case !isCompletionWorkspace:
            reason = "workspace";
            bundleEditsDisabled = true;
            break;

          case taskReadOnly === true:
            reason = "readOnly";
            bundleEditsDisabled = true;
            break;

          case task?.lockedBy && task.lockedBy !== user.id:
            reason = "locked";
            bundleEditsDisabled = true;
            break;

          case task &&
            AsCooperativeWork &&
            (AsCooperativeWork(task).isCooperative() || AsCooperativeWork(task).isTagType()):
            reason = "taskType";
            bundleEditsDisabled = true;
            break;

          case !(task?.reviewStatus === 2 || [0, 3, 6].includes(task?.status)):
            reason = "doneOrReview";
            bundleEditsDisabled = true;
            break;

          default:
            // Check mapper edit permissions
            const hasNoCompletion = !task?.completedBy;
            const isTaskCompleter = user.id === task?.completedBy;
            const enableMapperEdits = hasNoCompletion || isTaskCompleter || user.isSuperUser;
            const isReviewCompleted = task?.reviewStatus === 2;
            const isTaskCompleted = [0, 3, 6].includes(task?.status);
            const completionStatus = isReviewCompleted || isTaskCompleted;

            if (!(enableMapperEdits && completionStatus)) {
              reason = "mapperEdits";
              bundleEditsDisabled = true;
            }
            break;
        }

        this.setState({
          bundleEditsDisabled,
          bundlingDisabledReason: reason,
        });
      } catch (error) {
        console.error("Error in updateBundlingConditions:", error);
        this.setState({
          bundleEditsDisabled: true,
          bundlingDisabledReason: "error",
        });
      }
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

      const tasksToLock = taskIds.filter((taskId) => taskId !== task.id);

      if (tasksToLock.length === 0) {
        return [];
      }

      try {
        const tasks = await this.props.lockMultipleTasks(tasksToLock);
        return Array.isArray(tasks) ? tasks : [];
      } catch (error) {
        console.error("Error locking tasks:", error);
        this.setState({
          error: "lockError",
        });
        return [];
      }
    };

    unlockTasks = async (taskIds) => {
      if (!taskIds || taskIds.length === 0) {
        return;
      }

      try {
        await this.props.releaseMultipleTasks(taskIds);
      } catch (error) {
        console.warn("Error unlocking tasks:", error);
        this.setState({ error: "unlockError" });
      }
    };

    refreshTaskLock = async (taskIds) => {
      const { task } = this.props;

      // Filter out the primary task ID before refreshing locks
      const tasksToRefresh = taskIds.filter((taskId) => taskId !== task.id);

      if (tasksToRefresh.length === 0) {
        return; // No tasks to refresh
      }

      await this.props.lockMultipleTasks(tasksToRefresh);
    };

    createTaskBundle = async (taskIds) => {
      if (taskIds.length > 50) {
        this.setState({ bundleLimitError: true });
        return false;
      }

      this.setState({ loading: true });

      const tasksToLock = taskIds.filter((taskId) => taskId !== this.props.task?.id);

      if (tasksToLock.length === 0) {
        this.setState({ loading: false });
        return false;
      }

      try {
        const tasks = await this.lockTasks(tasksToLock);

        // Check if we successfully locked the tasks
        if (!tasks || tasks.length === 0) {
          this.setState({
            error: "lockError",
            loading: false,
          });
          return false;
        }

        this.setState(() => ({
          loading: false,
          taskBundle: {
            tasks: [this.props.task, ...tasks],
            taskIds: taskIds,
          },
        }));

        this.startLockRefresh(taskIds);
        return true;
      } catch (error) {
        console.error("Error creating task bundle:", error);
        this.setState({
          error: "lockError",
          loading: false,
        });
        return false;
      }
    };

    addTaskToBundle = async (taskId) => {
      this.setState({ loading: true });

      try {
        const tasks = await this.lockTasks([taskId]);

        if (!tasks || tasks.length === 0) {
          this.setState({
            error: "lockError",
            loading: false,
          });
          return false;
        }

        this.setState((prevState) => ({
          loading: false,
          taskBundle: {
            ...prevState.taskBundle,
            tasks: [...prevState.taskBundle.tasks, ...tasks],
            taskIds: [...prevState.taskBundle.taskIds, taskId],
          },
        }));

        this.startLockRefresh([...this.state.taskBundle.taskIds, taskId]);
        return true;
      } catch (error) {
        console.error("Error adding task to bundle:", error);
        this.setState({
          error: "lockError",
          loading: false,
        });
        return false;
      }
    };

    removeTaskFromBundle = async (taskId) => {
      const { taskBundle, initialBundle } = this.state;

      if ((this.props.task && !initialBundle) || !initialBundle?.taskIds.includes(taskId)) {
        try {
          await this.unlockTasks([taskId]);
        } catch (error) {
          console.error("Error unlocking task:", error);
          return false;
        }
      }

      if (taskBundle?.taskIds.length <= 2) {
        this.stopLockRefresh();
        this.setState({
          taskBundle: null,
          selectedTasks: [],
        });
        return true;
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

      return true;
    };

    clearActiveTaskBundle = async () => {
      const { taskBundle, initialBundle } = this.state;
      const taskIds = taskBundle.taskIds.filter(
        (taskId) => !initialBundle?.taskIds.includes(taskId) && taskId !== this.props.task.id,
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

    unlockBundleTasks = () => {
      if (this.state.taskBundle) {
        // Only unlock tasks that aren't the primary task
        // since the primary task is managed by WithLockedTask
        const tasksToUnlock = this.state.taskBundle.taskIds.filter(
          (taskId) => taskId !== this.props.task?.id,
        );

        if (tasksToUnlock.length > 0) {
          // Log unlock attempt for debugging
          console.log(`Unlocking ${tasksToUnlock.length} bundle tasks`);
          this.unlockTasks(tasksToUnlock);
        }
      }
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
          bundlingDisabledReason={this.state.bundlingDisabledReason}
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
      lockMultipleTasks,
      releaseMultipleTasks,
      addError,
    },
    dispatch,
  );

export default (WrappedComponent) =>
  connect(null, mapDispatchToProps)(WithTaskBundle(WrappedComponent));
