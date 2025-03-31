import bbox from "@turf/bbox";
import { featureCollection, point } from "@turf/helpers";
import _isEmpty from "lodash/isEmpty";
import _isEqual from "lodash/isEqual";
import _map from "lodash/map";
import _pick from "lodash/pick";
import _sum from "lodash/sum";
import _values from "lodash/values";
import { Component } from "react";
import { FormattedMessage } from "react-intl";
import { Popup } from "react-leaflet";
import AsCooperativeWork from "../../../interactions/Task/AsCooperativeWork";
import AsMappableTask from "../../../interactions/Task/AsMappableTask";
import { toLatLngBounds } from "../../../services/MapBounds/MapBounds";
import { buildSearchURL } from "../../../services/SearchCriteria/SearchCriteria";
import { TaskAction } from "../../../services/Task/TaskAction/TaskAction";
import { WidgetDataTarget, registerWidgetType } from "../../../services/Widget/Widget";
import BusySpinner from "../../BusySpinner/BusySpinner";
import Dropdown from "../../Dropdown/Dropdown";
import MapPane from "../../EnhancedMap/MapPane/MapPane";
import WithBoundedTasks from "../../HOCs/WithBoundedTasks/WithBoundedTasks";
import WithBrowsedChallenge from "../../HOCs/WithBrowsedChallenge/WithBrowsedChallenge";
import WithChallengeTaskClusters from "../../HOCs/WithChallengeTaskClusters/WithChallengeTaskClusters";
import WithClusteredTasks from "../../HOCs/WithClusteredTasks/WithClusteredTasks";
import WithFilterCriteria from "../../HOCs/WithFilterCriteria/WithFilterCriteria";
import WithFilteredClusteredTasks from "../../HOCs/WithFilteredClusteredTasks/WithFilteredClusteredTasks";
import WithKeyboardShortcuts from "../../HOCs/WithKeyboardShortcuts/WithKeyboardShortcuts";
import WithNearbyTasks from "../../HOCs/WithNearbyTasks/WithNearbyTasks";
import WithSavedFilters from "../../HOCs/WithSavedFilters/WithSavedFilters";
import WithSelectedClusteredTasks from "../../HOCs/WithSelectedClusteredTasks/WithSelectedClusteredTasks";
import WithTaskClusterMarkers from "../../HOCs/WithTaskClusterMarkers/WithTaskClusterMarkers";
import WithTaskPropertyKeys from "../../HOCs/WithTaskPropertyKeys/WithTaskPropertyKeys";
import WithWebSocketSubscriptions from "../../HOCs/WithWebSocketSubscriptions/WithWebSocketSubscriptions";
import QuickWidget from "../../QuickWidget/QuickWidget";
import SvgSymbol from "../../SvgSymbol/SvgSymbol";
import TaskAnalysisTable from "../../TaskAnalysisTable/TaskAnalysisTable";
import TaskClusterMap from "../../TaskClusterMap/TaskClusterMap";
import TaskPriorityFilter from "../../TaskFilters/TaskPriorityFilter";
import TaskPropertyFilter from "../../TaskFilters/TaskPropertyFilter";
import TaskStatusFilter from "../../TaskFilters/TaskStatusFilter";
import messages from "./Messages";
import TaskMarkerContent from "./TaskMarkerContent";

const VALID_STATUS_KEYS = [TaskAction.available, TaskAction.skipped, TaskAction.tooHard];

const descriptor = {
  widgetKey: "TaskBundleWidget",
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 4,
  defaultWidth: 6,
  minHeight: 12,
  defaultHeight: 14,
};

const ClusterMap = WithChallengeTaskClusters(
  WithTaskClusterMarkers(TaskClusterMap("taskBundling")),
  true,
  false,
  false,
  false,
);

const shortcutGroup = "taskEditing";

export default class TaskBundleWidget extends Component {
  state = {
    shortcutActive: false,
    errors: new Set(),
    isBundling: false,
    isUnbundling: false,
    error: null,
  };

  handleKeyboardShortcuts = (event) => {
    const { activeKeyboardShortcuts, textInputActive, taskReadOnly, keyboardShortcutGroups } =
      this.props;

    // Return early if any of the following conditions are met:
    // - Shortcut group is not active
    // - Typing in inputs
    // - Modifier keys are pressed
    // - Task is in read-only mode
    if (
      _isEmpty(activeKeyboardShortcuts[shortcutGroup]) ||
      textInputActive(event) ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      taskReadOnly
    ) {
      return;
    }

    if (event.key === keyboardShortcutGroups.taskEditing.completeTogether.key) {
      this.createBundle();
    }
  };

  /**
   * Initialize the cluster filters to include tasks from the current challenge
   * and initially within bounds of "nearby" tasks as a starting point for the
   * widget map
   */
  initializeClusterFilters(prevProps = {}) {
    if (this.props.taskBundle) {
      // Only set bounds if they haven't been set already or if the bundle has changed
      const bundleChanged =
        !prevProps.taskBundle || this.props.taskBundle.bundleId !== prevProps.taskBundle.bundleId;
      const boundsNotSet =
        !this.props.criteria?.boundingBox || this.props.criteria.boundingBox.length === 0;

      if (boundsNotSet || bundleChanged) {
        const bundleBounds = bbox({
          type: "FeatureCollection",
          features: _map(this.props.taskBundle.tasks, (task) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [task.location.coordinates[0], task.location.coordinates[1]],
            },
          })),
        });

        const bounds = toLatLngBounds(bundleBounds);
        const zoom = this.props.criteria?.zoom || 18;

        this.props.updateTaskFilterBounds(bounds, zoom);
      }
    } else if (
      (this.props.nearbyTasks?.tasks?.length || 0) > 0 &&
      !_isEqual(this.props.nearbyTasks, prevProps.nearbyTasks) &&
      !this.props.taskBundle
    ) {
      // Only set bounds if they haven't been set already
      if (!this.props.criteria?.boundingBox || this.props.criteria.boundingBox.length === 0) {
        this.setBoundsToNearbyTask();
      }
    }
  }

  initializeWebsocketSubscription(prevProps = {}) {
    const challengeId = this.props.task?.parent?.id;
    if (Number.isFinite(challengeId) && challengeId !== prevProps.task?.parent?.id) {
      this.props.subscribeToChallengeTaskMessages(challengeId);
    }
  }

  createBundle = () => {
    const { taskBundle, bundleEditsDisabled, selectedTasks, task } = this.props;

    if (
      taskBundle ||
      bundleEditsDisabled ||
      selectedTasks.selected.size > 50 ||
      this.state.isBundling
    ) {
      return;
    }

    const selectedArray = Array.from(selectedTasks.selected.values());

    // Check if the current task is cooperative or tag fix type
    const isCooperative = AsCooperativeWork(task).isCooperative();
    const isTagFix = AsCooperativeWork(task).isTagType();

    // Don't allow bundling for cooperative or tag fix tasks
    if (isCooperative || isTagFix) {
      this.setState((prevState) => ({
        errors: new Set([...prevState.errors, "bundleTypeNotAllowed"]),
      }));
      return;
    }

    // Check if any selected task is cooperative or tag fix type
    if (
      selectedArray.some(
        (item) => AsCooperativeWork(item).isCooperative() || AsCooperativeWork(item).isTagType(),
      )
    ) {
      this.setState((prevState) => ({
        errors: new Set([...prevState.errors, "bundleTypeNotAllowed"]),
      }));
      return;
    }

    // Get selected task IDs and ensure current task is included
    const selectedIds = Array.from(selectedTasks.selected.keys());
    if (!selectedIds.includes(task.id)) {
      this.props.selectTasks([task]);
    }

    this.setState({ isBundling: true });
    this.props.createTaskBundle(selectedIds).finally(() => this.setState({ isBundling: false }));
  };

  resetTaskBundle = async () => {
    this.setState({ isUnbundling: true });
    try {
      await this.props.resetTaskBundle();
      await this.props.resetSelectedTasks();
      // Select the main task and all tasks from the initial bundle
      if (this.props.initialBundle?.tasks) {
        this.props.selectTasks(this.props.initialBundle.tasks);
      } else if (this.props.task) {
        // If no initial bundle, at least select the main task
        this.props.selectTasks([this.props.task]);
      }
    } finally {
      this.setState({ isUnbundling: false });
    }
  };

  unbundleTask = (task) => {
    const taskId = task.id ?? task.taskId;
    if (taskId === this.props.task.id || this.state.isUnbundling) {
      return;
    }
    this.setState({ isUnbundling: true });
    this.props.removeTaskFromBundle(taskId).finally(() => this.setState({ isUnbundling: false }));
    this.props.deselectTasks([task]);
  };

  bundleTask = (task) => {
    if (this.state.isBundling) return;

    const taskId = task.id ?? task.taskId;
    this.setState({ isBundling: true });
    this.props.addTaskToBundle(taskId).finally(() => this.setState({ isBundling: false }));
    this.props.selectTasks([task]);
  };

  setBoundsToNearbyTask = () => {
    const taskList = this.props.nearbyTasks?.tasks;
    // Add the current task to the task list so that it always shows
    // up in the bounds.
    const mappableTask = AsMappableTask(this.props.task);
    mappableTask.point = mappableTask.calculateCenterPoint();
    if (taskList) {
      taskList.push(mappableTask);
    }

    if (!taskList || taskList.length === 0) {
      return;
    }

    const nearbyBounds = bbox(
      featureCollection(taskList.map((t) => point([t.point.lng, t.point.lat]))),
    );

    // Preserve existing zoom or default to 18
    const zoom = this.props.criteria?.zoom || 18;
    this.props.updateTaskFilterBounds(toLatLngBounds(nearbyBounds), zoom);
  };

  saveFilters = () => {
    if (!this.props.criteria) return;
    const searchURL = buildSearchURL(this.props.criteria);
    this.props.updateUserAppSetting(this.props.user.id, {
      taskBundleFilters: searchURL,
    });
  };

  revertFilters = () => {
    if (this.props.clearAllFilters) {
      this.props.clearAllFilters();
    }

    if (this.props.updateUserAppSetting) {
      this.props.updateUserAppSetting(this.props.user.id, {
        taskBundleFilters: "",
      });
    }
  };

  clearActiveTaskBundle = async () => {
    this.setState({ isUnbundling: true });
    try {
      await this.props.clearActiveTaskBundle();
    } finally {
      this.setState({ isUnbundling: false });
    }
  };

  async componentDidMount() {
    this.initializeClusterFilters();
    await this.props.resetSelectedTasks();

    // Always select the main task
    if (this.props.task) {
      this.props.selectTasks([this.props.task]);
    }

    // Then add any additional bundle tasks
    if (this.props.taskBundle?.tasks) {
      const additionalTasks = this.props.taskBundle.tasks.filter(
        (t) => t.id !== this.props.task?.id,
      );
      if (additionalTasks.length > 0) {
        this.props.selectTasks(additionalTasks);
      }
    }
    if (this.props.taskBundle || this.props.nearbyTasks) {
      this.initializeClusterFilters();
      this.initializeWebsocketSubscription();
    }
  }

  async componentDidUpdate(prevProps) {
    const taskChanged = this.props.task?.id !== prevProps.task?.id;
    const bundleChanged = this.props.taskBundle?.bundleId !== prevProps.taskBundle?.bundleId;

    if (taskChanged || bundleChanged) {
      await this.props.resetSelectedTasks();
      // Always select the main task first
      if (this.props.task) {
        this.props.selectTasks([this.props.task]);
      }
      // Then add any additional bundle tasks
      if (this.props.taskBundle?.tasks) {
        const additionalTasks = this.props.taskBundle.tasks.filter(
          (t) => t.id !== this.props.task?.id,
        );
        if (additionalTasks.length > 0) {
          this.props.selectTasks(additionalTasks);
        }
      }
    }

    if (bundleChanged || this.props.nearbyTasks !== prevProps.nearbyTasks) {
      this.initializeClusterFilters(prevProps);
      this.initializeWebsocketSubscription(prevProps);
    }

    const newErrors = new Set();
    const errorChecks = {
      lockError: this.props.failedLocks,
      unlockError: this.props.failedUnlocks,
      refreshError: this.props.failedRefreshTasks,
      bundleTypeError: this.props.bundleTypeMismatchError,
      fetchBundleError: this.props.fetchBundleError,
      updateTaskBundleError: this.props.updateTaskBundleError,
    };

    Object.entries(errorChecks).forEach(([errorType, condition]) => {
      if (condition) newErrors.add(errorType);
    });

    if (
      newErrors.size !== this.state.errors.size ||
      [...newErrors].some((error) => !this.state.errors.has(error))
    ) {
      this.setState({ errors: newErrors });
    }

    if (
      this.props.selectedTaskCount(this.props.taskInfo?.totalCount) > 1 &&
      this.state.shortcutActive === false
    ) {
      this.setState({ shortcutActive: true });
      this.props.activateKeyboardShortcut(
        shortcutGroup,
        _pick(this.props.keyboardShortcutGroups.taskEditing, "completeTogether"),
        this.handleKeyboardShortcuts,
      );
    } else if (
      this.state.shortcutActive === true &&
      this.props.selectedTaskCount(this.props.taskInfo?.totalCount) <= 1
    ) {
      this.setState({ shortcutActive: false });
      this.props.deactivateKeyboardShortcut(
        shortcutGroup,
        "completeTogether",
        this.handleKeyboardShortcuts,
      );
    }

    // Reset error state if task or bundle changes
    if (
      this.props.task?.id !== prevProps.task?.id ||
      !_isEqual(this.props.taskBundle, prevProps.taskBundle)
    ) {
      this.setState({
        error: null, // Reset error state
      });
    }
  }

  componentWillUnmount() {
    this.props.resetSelectedTasks();
    const challengeId = this.props.task?.parent?.id;
    if (Number.isFinite(challengeId)) {
      this.props.unsubscribeFromChallengeTaskMessages(challengeId);
    }

    this.props.deactivateKeyboardShortcut(
      shortcutGroup,
      "completeTogether",
      this.handleKeyboardShortcuts,
    );
  }

  render() {
    const WidgetContent = this.props.taskBundle ? ActiveBundle : BuildBundle;
    return (
      <QuickWidget
        {...this.props}
        className=""
        widgetTitle={<FormattedMessage {...messages.title} />}
        noMain
      >
        <WidgetContent
          {...this.props}
          saveFilters={this.saveFilters}
          revertFilters={this.revertFilters}
          createBundle={this.createBundle}
          resetTaskBundle={this.resetTaskBundle}
          unbundleTask={this.unbundleTask}
          bundleTask={this.bundleTask}
          clearActiveTaskBundle={this.clearActiveTaskBundle}
          loading={this.props.loading}
          errors={this.state.errors}
          isBundling={this.state.isBundling}
          isUnbundling={this.state.isUnbundling}
        />
      </QuickWidget>
    );
  }
}

const calculateTasksInChallenge = (props) => {
  const actions = props.browsedChallenge?.actions;
  if (!actions) {
    return props.taskInfo?.totalCount || props.taskInfo?.tasks?.length;
  }

  return _sum(_values(_pick(actions, VALID_STATUS_KEYS)));
};

const BundlingDisabledMessage = ({
  task,
  workspace,
  taskReadOnly,
  user,
  bundlingDisabledReason,
}) => {
  // Use the reason provided by WithTaskBundle if available
  let messageKey = bundlingDisabledReason
    ? `bundlingDisabled${
        bundlingDisabledReason.charAt(0).toUpperCase() + bundlingDisabledReason.slice(1)
      }`
    : null;

  // Fallback to the old logic if no reason is provided
  if (!messageKey) {
    // Check if read-only first
    if (taskReadOnly) {
      messageKey = "bundlingDisabledReadOnly";
    }
    // Check if task is cooperative or tag fix type
    else if (
      task &&
      (AsCooperativeWork(task).isCooperative() || AsCooperativeWork(task).isTagType())
    ) {
      messageKey = "bundlingDisabledTaskType";
    }
    // Check workspace type
    else {
      const workspaceName = workspace?.name;
      const isCompletionWorkspace = ["taskCompletion"].includes(workspaceName);

      if (!isCompletionWorkspace) {
        messageKey = "bundlingDisabledWorkspace";
      } else {
        // Check completion status
        const isReviewCompleted = task?.reviewStatus === 2;
        const isTaskCompleted = [0, 3, 6].includes(task?.status);
        const completionStatus = isReviewCompleted || isTaskCompleted;

        // Check mapper edit permissions
        const hasNoCompletion = !task?.completedBy;
        const isTaskCompleter = user.id === task?.completedBy;

        if (!completionStatus) {
          messageKey = "bundlingDisabledNotCompleted";
        } else if (!hasNoCompletion && !isTaskCompleter && !user.isSuperUser) {
          messageKey = "bundlingDisabledNotOwner";
        } else {
          messageKey = "bundlingDisabledGeneric";
        }
      }
    }
  }

  return messageKey ? (
    <div className="mr-bg-blue-dark mr-p-2 mr-mb-2 mr-rounded mr-text-white mr-text-center">
      <FormattedMessage {...messages[messageKey]} />
    </div>
  ) : null;
};

const ActiveBundle = (props) => {
  const { task, taskBundle, bundleEditsDisabled, initialBundle, widgetLayout, isUnbundling } =
    props;
  const disabled =
    props.bundleEditsDisabled ||
    (props.initialBundle &&
      props.initialBundle?.taskIds?.sort() === props.taskBundle?.taskIds?.sort());

  const showMarkerPopup = (markerData) => {
    return (
      <Popup
        key={markerData.options.taskId}
        offset={task.id === markerData.options.taskId ? [0.5, -16] : [0.5, -5]}
      >
        <div className="marker-popup-content">
          <TaskMarkerContent
            {...props}
            marker={markerData}
            taskId={markerData.options.taskId}
            taskBundleData={taskBundle?.tasks}
            bundling
            unbundleTask={props.unbundleTask}
            bundleTask={props.bundleTask}
          />
        </div>
      </Popup>
    );
  };

  const bundleCenter = toLatLngBounds(
    bbox({
      type: "FeatureCollection",
      features: _map(taskBundle.tasks, (task) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [task.location.coordinates[0], task.location.coordinates[1]],
        },
      })),
    }),
  );

  const map = (
    <ClusterMap
      {...props}
      loadingTasks={props.loadingTasks}
      highlightPrimaryTask={task.id}
      showMarkerPopup={showMarkerPopup}
      centerBounds={bundleCenter}
      initialBounds={bundleCenter}
      fitbBoundsControl
      selectedTasks={props.selectedTasks}
    />
  );

  const table = (
    <TaskAnalysisTable
      {...props}
      selectedTasks={new Map()}
      taskData={props.bundledOnly && taskBundle ? taskBundle?.tasks : props.taskInfo?.tasks}
      totalTaskCount={props.taskInfo?.totalCount || props.taskInfo?.tasks?.length}
      totalTasksInChallenge={calculateTasksInChallenge(props)}
      showColumns={["featureId", "id", "status", "priority", "editBundle"]}
      suppressHeader
      suppressManagement
      suppressTriState
      defaultPageSize={5}
    />
  );

  return (
    <div className="mr-pb-2 mr-h-full mr-rounded">
      {bundleEditsDisabled && (
        <BundlingDisabledMessage
          task={task}
          workspace={props.workspace}
          taskReadOnly={props.taskReadOnly}
          user={props.user}
          bundlingDisabledReason={props.bundlingDisabledReason}
        />
      )}
      <div
        className="mr-h-3/4 mr-min-h-80 mr-max-h-screen-80"
        style={{ maxHeight: `${widgetLayout?.w * 80}px` }}
      >
        {props.loading ? (
          <BusySpinner className="mr-h-full mr-flex mr-items-center" />
        ) : (
          <MapPane showLasso={false}>{map}</MapPane>
        )}
      </div>
      {props.errors.size > 0 && (
        <div className="mr-text-red mr-mt-4 mr-text-center mr-space-y-2">
          {[...props.errors].map((errorType) => (
            <div key={errorType}>
              <FormattedMessage {...messages[errorType]} />
              {errorType === "lockError" && props.failedLocks && (
                <span className="mr-ml-2">({props.failedLocks.join(", ")})</span>
              )}
            </div>
          ))}
        </div>
      )}
      <h3 className="mr-text-lg mr-text-center mr-text-pink-light mr-mt-4">
        <FormattedMessage
          {...messages.simultaneousTasks}
          values={{ taskCount: taskBundle?.taskIds.length }}
        />
      </h3>
      <div className="mr-flex mr-justify-between mr-content-center mr-my-4">
        <button
          className="mr-button mr-button--green-lighter mr-button--small mr-mr-2"
          onClick={() => props.setBundledOnly(!props.bundledOnly)}
        >
          <FormattedMessage
            {...messages[props.bundledOnly ? "displayAllTasksLabel" : "displayBundledTasksLabel"]}
          />
        </button>
        {initialBundle && (
          <button
            disabled={disabled || isUnbundling}
            className="mr-button mr-button--green-lighter mr-button--small mr-mr-2"
            style={{
              cursor: disabled || isUnbundling ? "default" : "pointer",
              opacity: disabled || isUnbundling ? 0.3 : 1,
            }}
            onClick={() => props.resetTaskBundle()}
          >
            {isUnbundling ? (
              <BusySpinner inline small />
            ) : (
              <FormattedMessage {...messages.resetBundleLabel} />
            )}
          </button>
        )}
        <button
          disabled={bundleEditsDisabled || isUnbundling}
          className="mr-button mr-button--green-lighter mr-button--small"
          style={{
            cursor: bundleEditsDisabled || isUnbundling ? "default" : "pointer",
            opacity: bundleEditsDisabled || isUnbundling ? 0.3 : 1,
          }}
          onClick={() => props.clearActiveTaskBundle()}
        >
          {isUnbundling ? (
            <BusySpinner inline small />
          ) : (
            <FormattedMessage {...messages.unbundleTasksLabel} />
          )}
        </button>
      </div>
      <div
        className={
          widgetLayout && widgetLayout?.w === 4
            ? "mr-my-4 mr-px-4 mr-space-y-3"
            : "mr-my-4 mr-px-4 xl:mr-flex xl:mr-justify-between mr-items-center"
        }
      >
        <div className="mr-flex mr-items-center">
          <p className="mr-text-base mr-uppercase mr-text-mango mr-mr-8">
            <FormattedMessage {...messages.filterListLabel} />
          </p>
          <ul className="md:mr-flex">
            <li className="md:mr-mr-8">
              <TaskStatusFilter {...props} />
            </li>
            <li className="md:mr-mr-8">
              <TaskPriorityFilter {...props} />
            </li>
            <li>
              <TaskPropertyFilter {...props} />
            </li>
          </ul>
        </div>
        <div
          className={`mr-flex mr-space-x-3 mr-items-center ${
            widgetLayout && widgetLayout?.w === 4 ? "mr-justify-between" : "mr-justify-end"
          }`}
        >
          {<ClearFiltersControl clearFilters={props.clearAllFilters} />}
          <Dropdown
            className="mr-flex mr-items-center"
            dropdownButton={(dropdown) => (
              <button
                onClick={dropdown.toggleDropdownVisible}
                className="mr-flex mr-items-center mr-text-green-lighter"
              >
                <SvgSymbol
                  sym="filter-icon"
                  viewBox="0 0 20 20"
                  className="mr-fill-current mr-w-5 mr-h-5"
                />
              </button>
            )}
            dropdownContent={(dropdown) => (
              <div className="mr-flex mr-flex-col mr-space-y-2">
                <SaveFiltersControl
                  saveFilters={props.saveFilters}
                  closeDropdown={dropdown.closeDropdown}
                />
                <RevertFiltersControl revertFilters={props.revertFilters} />
              </div>
            )}
          />
        </div>
      </div>
      <div className={"mr-px-4"}>{table}</div>
    </div>
  );
};

const BuildBundle = (props) => {
  const {
    virtualChallenge,
    virtualChallengeId,
    taskInfo,
    taskReadOnly,
    selectedTasks,
    bundleEditsDisabled,
    isBundling,
    isUnbundling,
  } = props;

  if (virtualChallenge || Number.isFinite(virtualChallengeId)) {
    return (
      <div className="mr-text-base">
        <FormattedMessage {...messages.noVirtualChallenges} />
      </div>
    );
  }

  const totalTaskCount = taskInfo?.totalCount || taskInfo?.tasks?.length;
  const showBundleButton =
    !taskReadOnly && props.selectedTaskCount(totalTaskCount) > 1 && !bundleEditsDisabled;
  const isTooManyTasks = selectedTasks.selected.size > 50;

  const bundleButton = showBundleButton ? (
    <button
      className={`mr-button mr-button--green-lighter mr-button--small ${
        isTooManyTasks || isBundling ? "mr-opacity-50 mr-cursor-not-allowed" : ""
      }`}
      disabled={isTooManyTasks || isBundling}
      onClick={props.createBundle}
    >
      {isBundling ? (
        <BusySpinner inline small />
      ) : (
        <FormattedMessage {...messages[isTooManyTasks ? "tooManyTasks" : "bundleTasksLabel"]} />
      )}
    </button>
  ) : null;

  const showMarkerPopup = (markerData) => {
    return (
      <Popup
        key={markerData.options.taskId}
        offset={props.task.id === markerData.options.taskId ? [0.5, -16] : [0.5, -5]}
      >
        <div className="marker-popup-content">
          <TaskMarkerContent {...props} marker={markerData} taskId={markerData.options.taskId} />
        </div>
      </Popup>
    );
  };

  const map = (
    <ClusterMap
      {...props}
      showMarkerPopup={showMarkerPopup}
      highlightPrimaryTask={props.task.id}
      taskCenter={AsMappableTask(props.task).calculateCenterPoint()}
      boundingBox={props.criteria?.boundingBox}
      initialBounds={toLatLngBounds(props.criteria?.boundingBox || [])}
      onBulkTaskSelection={(tasks) => {
        // Ensure main task stays selected
        if (!props.selectedTasks.selected.has(props.task.id)) {
          props.selectTasks([props.task]);
        }
        const tasksToSelect = tasks.filter((t) => t.id !== props.task.id);
        props.selectTasks(tasksToSelect);
      }}
      onBulkTaskDeselection={(tasks) => {
        const tasksToDeselect = tasks.filter((t) => t.id !== props.task.id);
        props.deselectTasks(tasksToDeselect);
      }}
      fitbBoundsControl
      showSelectMarkersInView
    />
  );

  const isLoading = props.loading || props.nearbyTasks?.loading;

  return (
    <div className="mr-pb-2 mr-h-full mr-rounded">
      {bundleEditsDisabled && (
        <BundlingDisabledMessage
          task={props.task}
          workspace={props.workspace}
          taskReadOnly={taskReadOnly}
          user={props.user}
          bundlingDisabledReason={props.bundlingDisabledReason}
        />
      )}
      <div
        className="mr-h-3/4 mr-min-h-80 mr-max-h-screen-80"
        style={{ maxHeight: `${props.widgetLayout?.w * 80}px` }}
      >
        {isLoading ? (
          <BusySpinner className="mr-h-full mr-flex mr-items-center" />
        ) : (
          <MapPane showLasso={!bundleEditsDisabled}>{map}</MapPane>
        )}
      </div>
      {props.errors.size > 0 && (
        <div className="mr-text-red mr-mt-4 mr-text-center mr-space-y-2">
          {[...props.errors].map((errorType) => (
            <div key={errorType}>
              <FormattedMessage {...messages[errorType]} />
              {errorType === "lockError" && props.failedLocks && (
                <span className="mr-ml-2">({props.failedLocks.join(", ")})</span>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="mr-flex mr-justify-end mr-mt-2">
        {props.initialBundle && (
          <button
            className={`mr-button mr-button--red mr-button--small mr-mt-2 mr-float-right ${
              bundleEditsDisabled || isUnbundling
                ? "mr-text-grey-light mr-cursor-default"
                : "mr-text-green-lighter"
            }`}
            onClick={props.resetTaskBundle}
            disabled={bundleEditsDisabled || isUnbundling}
          >
            {isUnbundling ? (
              <BusySpinner inline small />
            ) : (
              <FormattedMessage {...messages.resetBundleLabel} />
            )}
          </button>
        )}
      </div>
      <div
        className={
          props.widgetLayout && props.widgetLayout?.w === 4
            ? "mr-my-4 mr-px-4 mr-space-y-3"
            : "mr-my-4 mr-px-4 xl:mr-flex xl:mr-justify-between mr-items-center"
        }
      >
        <div className="mr-flex mr-items-center">
          <p className="mr-text-base mr-uppercase mr-text-mango mr-mr-8">
            <FormattedMessage {...messages.filterListLabel} />
          </p>
          <ul className="md:mr-flex">
            <li className="md:mr-mr-8">
              <TaskStatusFilter {...props} />
            </li>
            <li className="md:mr-mr-8">
              <TaskPriorityFilter {...props} />
            </li>
            <li>
              <TaskPropertyFilter {...props} />
            </li>
          </ul>
        </div>

        <div
          className={`mr-flex mr-space-x-3 mr-items-center ${
            props.widgetLayout && props.widgetLayout?.w === 4
              ? "mr-justify-between"
              : "mr-justify-end"
          }`}
        >
          {<ClearFiltersControl clearFilters={props.clearAllFilters} />}
          <Dropdown
            className="mr-flex mr-items-center"
            dropdownButton={(dropdown) => (
              <button
                onClick={dropdown.toggleDropdownVisible}
                className="mr-flex mr-items-center mr-text-green-lighter"
              >
                <SvgSymbol
                  sym="filter-icon"
                  viewBox="0 0 20 20"
                  className="mr-fill-current mr-w-5 mr-h-5"
                />
              </button>
            )}
            dropdownContent={(dropdown) => (
              <div className="mr-flex mr-flex-col mr-space-y-2">
                <SaveFiltersControl
                  saveFilters={props.saveFilters}
                  closeDropdown={dropdown.closeDropdown}
                />
                <RevertFiltersControl revertFilters={props.revertFilters} />
              </div>
            )}
          />
        </div>
      </div>
      <div className="mr-px-4">
        <TaskAnalysisTable
          {...props}
          taskData={props.taskInfo?.tasks}
          totalTaskCount={totalTaskCount}
          totalTasksInChallenge={calculateTasksInChallenge(props)}
          showColumns={["selected", "featureId", "id", "status", "priority", "comments"]}
          customHeaderControls={bundleButton}
          suppressManagement
          showSelectionCount
          highlightPrimaryTask
          defaultPageSize={5}
          forBundling
          suppressTriState
        />
      </div>
    </div>
  );
};

registerWidgetType(
  WithSelectedClusteredTasks(
    WithNearbyTasks(
      WithClusteredTasks(
        WithSavedFilters(
          WithFilteredClusteredTasks(
            WithTaskPropertyKeys(
              WithFilterCriteria(
                WithBoundedTasks(
                  WithBrowsedChallenge(
                    WithWebSocketSubscriptions(WithKeyboardShortcuts(TaskBundleWidget)),
                  ),
                  "filteredClusteredTasks",
                  "taskInfo",
                ),
                true,
                false,
                true,
                true,
                "taskBundleFilters",
              ),
            ),
            "clusteredTasks",
            "filteredClusteredTasks",
            {
              includeLocked: false,
            },
            true,
            "taskBundleFilters",
          ),
        ),
      ),
    ),
  ),
  descriptor,
);

const RevertFiltersControl = ({ revertFilters }) => {
  const handleClick = () => {
    revertFilters();
  };
  return (
    <button
      className="mr-flex mr-items-center mr-text-current hover:mr-text-green-lighter mr-transition-colors"
      onClick={handleClick}
    >
      <FormattedMessage {...messages.restoreDefaultFiltersLabel} />
    </button>
  );
};

const SaveFiltersControl = ({ saveFilters, closeDropdown }) => {
  const handleClick = () => {
    saveFilters();
    closeDropdown();
  };
  return (
    <button
      className="mr-flex mr-items-center mr-text-current hover:mr-text-green-lighter mr-transition-colors"
      onClick={handleClick}
    >
      <FormattedMessage {...messages.saveCurrentFiltersLabel} />
    </button>
  );
};

const ClearFiltersControl = ({ clearFilters }) => (
  <button className="mr-flex mr-items-center mr-text-green-lighter" onClick={clearFilters}>
    <SvgSymbol
      sym="close-icon"
      viewBox="0 0 20 20"
      className="mr-fill-current mr-w-5 mr-h-5 mr-mr-1"
    />
    <FormattedMessage {...messages.clearFiltersLabel} />
  </button>
);
