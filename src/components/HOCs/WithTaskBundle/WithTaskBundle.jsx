import _isFinite from "lodash/isFinite";
import _omit from "lodash/omit";
import { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  bundleTasks,
  deleteTaskBundle,
  fetchTaskBundle,
  removeTaskFromBundle,
  resetTaskBundle,
} from "../../../services/Task/Task";
import { releaseTask } from "../../../services/Task/Task";

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
      resetSelectedTasks: null,
    };

    async componentDidMount() {
      const { task } = this.props;
      if (_isFinite(task?.bundleId)) {
        await this.setupBundle(task.bundleId);
      } else {
        this.updateBundlingConditions();
      }

      window.addEventListener("beforeunload", this.handleBeforeUnload);
    }

    async componentDidUpdate(prevProps, prevState) {
      const { task } = this.props;

      if (task?.id !== prevProps?.task?.id) {
        this.setState({
          selectedTasks: [],
          initialBundle: null,
          taskBundle: null,
          loading: false,
          completingTask: null,
        });

        if (_isFinite(task?.bundleId)) {
          await this.setupBundle(task.bundleId);
        } else {
          this.updateBundlingConditions();
        }

        const prevInitialBundle = prevState.initialBundle;
        const prevTaskBundle = prevState.taskBundle;
        if (
          (prevTaskBundle || prevInitialBundle) &&
          prevTaskBundle !== prevInitialBundle &&
          !prevState.completingTask
        ) {
          if (prevInitialBundle) {
            // Whenever the user redirects, skips a task, or refreshes and there is a
            // new bundle state, the bundle state needs to reset to its initial value.
            this.props.resetTaskBundle(prevInitialBundle);
          } else {
            // Whenever the user redirects, skips a task, or refreshes and there was
            // no initial value, the bundle will be destroyed.
            this.clearActiveTaskBundle(prevTaskBundle.bundleId);
          }
        } else if (
          prevTaskBundle &&
          prevInitialBundle &&
          prevTaskBundle !== prevInitialBundle &&
          prevState.completingTask
        ) {
          await this.unlockTasks(prevTaskBundle, prevTaskBundle);
        }
      }
    }

    componentWillUnmount() {
      this.resetBundle();
      window.removeEventListener("beforeunload", this.handleBeforeUnload);
    }

    updateBundlingConditions = () => {
      const { task, taskReadOnly, workspace, user, name } = this.props;
      const isCompletionWorkspace = ["taskCompletion"].includes(workspace?.name || name);
      const isReviewWorkspace = ["taskReview"].includes(workspace?.name || name);
      const completionStatus =
        isCompletionWorkspace &&
        ([2].includes(task?.reviewStatus) || [0, 3, 6].includes(task?.status));
      const enableMapperEdits =
        (!task?.completedBy || user.id === task.completedBy) &&
        completionStatus &&
        !isReviewWorkspace;
      const enableSuperUserEdits = user.isSuperUser && (completionStatus || isReviewWorkspace);
      const bundleEditsDisabled = taskReadOnly || (!enableMapperEdits && !enableSuperUserEdits);

      this.setState({ bundleEditsDisabled });
    };

    handleBeforeUnload = () => {
      this.resetBundle();
    };

    resetBundle = async () => {
      const { initialBundle, taskBundle, completingTask } = this.state;
      if (!completingTask) {
        this.resetSelectedTasks();
        if (taskBundle || (initialBundle && taskBundle !== initialBundle)) {
          if (initialBundle) {
            await this.props.resetTaskBundle(initialBundle).catch(console.error);
          } else if (taskBundle) {
            await this.clearActiveTaskBundle(taskBundle.bundleId);
          }
        }
      } else if (taskBundle || (initialBundle && taskBundle && initialBundle)) {
        await this.unlockTasks(initialBundle, taskBundle);
      }
    };

    unlockTasks = async (initialBundle, taskBundle) => {
      const tasksToUnlock = initialBundle.taskIds.filter(
        (taskId) => !taskBundle.taskIds.includes(taskId),
      );
      await Promise.all(
        tasksToUnlock.map((taskId) =>
          this.props
            .releaseTask(taskId)
            .then(() => {
              // wait for lock to be cleared in db and provide some leeway
              // time with setTimeout before triggering storage event
              setTimeout(() => localStorage.removeItem(`lock-${taskId}`), 1500);
            })
            .catch(console.error),
        ),
      );
    };

    setupBundle = async (bundleId) => {
      const { task, workspace, history, fetchTaskBundle } = this.props;
      this.setState({ loading: true });
      try {
        const taskBundle = await fetchTaskBundle(bundleId, !this.state.bundleEditsDisabled);
        if (taskBundle) {
          if (!task.isBundlePrimary) {
            const primaryTask = taskBundle.tasks.find((task) => task.isBundlePrimary);
            const isMetaReview = history?.location?.pathname?.includes("meta-review");
            const location =
              workspace?.name === "taskReview" ? (isMetaReview ? "/meta-review" : "/review") : "";
            if (primaryTask) {
              history.push(`/challenge/${primaryTask.parent}/task/${primaryTask.id}${location}`);
            } else {
              console.error("Primary task not found in task bundle.");
            }
          }
        }
        this.updateBundlingConditions();
        this.setState({
          initialBundle: taskBundle,
          selectedTasks: taskBundle?.taskIds || [],
          taskBundle,
        });
      } catch (error) {
        console.error("Error setting up bundle:", error);
        this.updateBundlingConditions();
      } finally {
        this.setState({ loading: false });
      }
    };

    createTaskBundle = async (taskIds, bundleTypeMismatch, name) => {
      this.setState({ loading: true });
      try {
        const taskBundle = await this.props.bundleTasks(
          this.props.taskId,
          taskIds,
          bundleTypeMismatch,
          name,
        );
        this.setState({
          selectedTasks: taskBundle?.taskIds || [],
          taskBundle,
          loading: false,
        });
      } catch (error) {
        console.error("Error creating task bundle:", error);
        this.setState({ loading: false });
      }
    };

    resetToInitialTaskBundle = async (bundleId) => {
      const { initialBundle, taskBundle } = this.state;
      if (initialBundle && initialBundle !== taskBundle) {
        this.setState({ loading: true });
        try {
          const taskBundle = await this.props.resetTaskBundle(initialBundle);
          this.setState({
            selectedTasks: taskBundle?.taskIds || [],
            taskBundle,
            loading: false,
          });
        } catch (error) {
          console.error("Error resetting to initial task bundle:", error);
          this.setState({ loading: false });
        }
      } else if (
        _isFinite(bundleId) &&
        this.state.taskBundle?.bundleId === bundleId &&
        this.props.task.status === 0
      ) {
        await this.clearActiveTaskBundle(bundleId);
      }
    };

    resetSelectedTasks = () => {
      if (this.state.resetSelectedTasks) {
        this.state.resetSelectedTasks();
      }
    };

    removeTaskFromBundle = async (bundleId, taskId) => {
      const { initialBundle, taskBundle } = this.state;
      this.setState({ loading: true });
      try {
        if (taskBundle?.taskIds.length === 2 && !initialBundle && this.props.task.status === 0) {
          await this.clearActiveTaskBundle(bundleId);
          this.setState({ loading: false });
          return;
        }

        const updatedTaskBundle = await this.props.removeTaskFromBundle(
          initialBundle?.taskIds,
          bundleId,
          taskId,
        );
        this.setState({
          taskBundle: updatedTaskBundle,
          loading: false,
        });
      } catch (error) {
        console.error("Error removing task from bundle:", error);
        this.setState({ loading: false });
      }
    };

    clearActiveTaskBundle = async (bundleId) => {
      try {
        const bundleDeleted = await this.props.deleteTaskBundle(bundleId);
        if (bundleDeleted) {
          this.setState({
            selectedTasks: [],
            taskBundle: null,
            loading: false,
          });
          this.resetSelectedTasks();
        }
      } catch (error) {
        console.error("Error clearing active task bundle:", error);
        this.setState({ loading: false });
      }
    };

    setCompletingTask = (task) => {
      this.setState({ selectedTasks: [], completingTask: task });
    };

    render() {
      return (
        <WrappedComponent
          {..._omit(this.props, ["bundleTasks", "deleteTaskBundle", "removeTaskFromBundle"])}
          taskBundle={this.state.taskBundle}
          taskBundleLoading={this.state.loading}
          setCompletingTask={this.setCompletingTask}
          completingTask={this.props.completingTask}
          createTaskBundle={this.createTaskBundle}
          resetToInitialTaskBundle={this.resetToInitialTaskBundle}
          initialBundle={this.state.initialBundle}
          removeTaskFromBundle={this.removeTaskFromBundle}
          clearActiveTaskBundle={this.clearActiveTaskBundle}
          setSelectedTasks={(selectedTasks) => this.setState({ selectedTasks })}
          selectedTasks={this.state.selectedTasks}
          bundleEditsDisabled={this.state.bundleEditsDisabled}
          setResetSelectedTasksAccessor={(f) => this.setState({ resetSelectedTasks: f })}
          resetSelectedTasks={this.resetSelectedTasks}
        />
      );
    }
  };
}

export const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      bundleTasks,
      deleteTaskBundle,
      resetTaskBundle,
      removeTaskFromBundle,
      fetchTaskBundle,
      releaseTask,
    },
    dispatch,
  );

export default (WrappedComponent) =>
  connect(null, mapDispatchToProps)(WithTaskBundle(WrappedComponent));
