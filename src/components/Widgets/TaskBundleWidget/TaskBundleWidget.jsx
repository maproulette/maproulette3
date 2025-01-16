import bbox from "@turf/bbox";
import { featureCollection, point } from "@turf/helpers";
import _isEmpty from "lodash/isEmpty";
import _isEqual from "lodash/isEqual";
import _isFinite from "lodash/isFinite";
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
  true,
  false,
  false,
);

const shortcutGroup = "taskEditing";

export default class TaskBundleWidget extends Component {
  state = {
    shortcutActive: false,
  };

  bundleTasks = () => {
    if ((this.props.taskBundle?.tasks?.length ?? 0) > 0 || this.props.bundleEditsDisabled) {
      return;
    }

    const selectedArray = Array.from(this.props.selectedTasks.selected.values());
    let bundleTypeMismatch = "";

    if (selectedArray.length > 1) {
      if (AsCooperativeWork(this.props.task).isCooperative()) {
        selectedArray.forEach((item) => {
          if (!AsCooperativeWork(item).isCooperative()) {
            bundleTypeMismatch = "cooperative";
          }
        });
      } else {
        selectedArray.forEach((item) => {
          if (AsCooperativeWork(item).isCooperative()) {
            bundleTypeMismatch = "notCooperative";
          }
        });
      }
    }

    // Because there's no way to select all tasks (TriState checkbox is
    // suppressed on the TaskAnalysisTables), we only need to worry about
    // explicitly selected tasks
    this.props.createTaskBundle([...this.props.selectedTasks.selected.keys()], bundleTypeMismatch);
  };

  handleKeyboardShortcuts = (event) => {
    // Ignore if shortcut group is not active
    if (_isEmpty(this.props.activeKeyboardShortcuts[shortcutGroup])) {
      return;
    }

    if (this.props.textInputActive(event)) {
      // ignore typing in inputs
      return;
    }

    // Ignore if modifier keys were pressed
    if (event.metaKey || event.altKey || event.ctrlKey) {
      return;
    }

    //Ignore if in read only mode
    if (this.props.taskReadOnly) {
      return;
    }

    const shortcuts = this.props.keyboardShortcutGroups.taskEditing;
    if (event.key === shortcuts.completeTogether.key) {
      this.bundleTasks();
    }
  };

  /**
   * Initialize the cluster filters to include tasks from the current challenge
   * and initially within bounds of "nearby" tasks as a starting point for the
   * widget map
   */
  initializeClusterFilters(prevProps = {}) {
    // If the nearby tasks loaded, update bounds
    if (
      (this.props.nearbyTasks?.tasks?.length ?? 0) > 0 &&
      !_isEqual(this.props.nearbyTasks, prevProps.nearbyTasks)
    ) {
      this.setBoundsToNearbyTask();
    }
  }

  initializeWebsocketSubscription(prevProps = {}) {
    const challengeId = this.props.task?.parent?.id;
    if (_isFinite(challengeId) && challengeId !== prevProps.task?.parent?.id) {
      this.props.subscribeToChallengeTaskMessages(challengeId);
    }
  }

  unbundleTasks = async () => {
    this.props.resetToInitialTaskBundle(this.props.taskBundle.bundleId);
  };

  unbundleTask = (task) => {
    const taskId = task.id ?? task.taskId;
    this.props.removeTaskFromBundle(this.props.taskBundle.bundleId, taskId);
    this.props.toggleTaskSelection(task);
  };

  updateBounds = (challengeId, bounds, zoom) => {
    this.props.updateTaskFilterBounds(bounds, zoom);
  };

  setBoundsToNearbyTask = () => {
    const taskList = this.props.nearbyTasks?.tasks;

    // Add the current task to the task list so that it always shows
    // up in the bounds.
    const mappableTask = AsMappableTask(this.props.task);
    mappableTask.point = mappableTask.calculateCenterPoint();
    if (taskList) {
      taskList?.push(mappableTask);
    }

    if (!taskList || taskList.length === 0) {
      return;
    }

    const nearbyBounds = bbox(
      featureCollection(taskList.map((t) => point([t.point.lng, t.point.lat]))),
    );

    this.updateBounds(this.props.challengeId, nearbyBounds, this.props.mapBounds?.zoom ?? 18);
  };

  saveFilters = () => {
    if (!this.props.criteria) return;
    const searchURL = buildSearchURL(this.props.criteria);
    this.props.updateUserAppSetting(this.props.user.id, { taskBundleFilters: searchURL });
  };

  revertFilters = () => {
    if (this.props.clearAllFilters) {
      this.props.clearAllFilters();
    }

    if (this.props.updateUserAppSetting) {
      this.props.updateUserAppSetting(this.props.user.id, { taskBundleFilters: "" });
    }
  };

  componentDidMount() {
    if (!this.props.taskBundle) {
      this.initializeClusterFilters();
      this.initializeWebsocketSubscription();
    }

    if (
      this.props.task &&
      this.props.selectedTasks &&
      !this.props.isTaskSelected(this.props.task.id)
    ) {
      this.props.selectTasks([this.props.task]);
    }
    if (this.props.taskBundle) {
      this.props.selectTasks(this.props.taskBundle.tasks);
      this.setBoundsToNearbyTask();
    }
  }

  async componentDidUpdate(prevProps) {
    if (!this.props.taskBundle) {
      this.initializeClusterFilters(prevProps);
      this.initializeWebsocketSubscription(prevProps);
    }

    if (
      this.props.selectedTaskCount(this.props.taskInfo.totalCount) > 1 &&
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
      this.props.selectedTaskCount(this.props.taskInfo.totalCount) <= 1
    ) {
      this.setState({ shortcutActive: false });
      this.props.deactivateKeyboardShortcut(
        shortcutGroup,
        "completeTogether",
        this.handleKeyboardShortcuts,
      );
    }

    if (
      _isFinite(this.props.task?.id) &&
      _isFinite(prevProps?.task?.id) &&
      this.props.task.id !== prevProps.task.id
    ) {
      this.props.resetSelectedTasks();
      this.setBoundsToNearbyTask();
    } else if (
      this.props.task &&
      this.props.selectedTasks &&
      !this.props.isTaskSelected(this.props.task.id)
    ) {
      this.props.selectTasks([this.props.task]);
    }
    if (this.props.taskBundle && this.props.taskBundle !== prevProps.taskBundle) {
      await this.props.resetSelectedTasks();
      this.props.selectTasks(this.props.taskBundle.tasks);
      if (!prevProps.taskBundle) {
        this.setBoundsToNearbyTask();
      }
    }
  }

  componentWillUnmount() {
    this.props.resetSelectedTasks();
    const challengeId = this.props.task?.parent?.id;
    if (_isFinite(challengeId)) {
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
          updateBounds={this.updateBounds}
          bundleTasks={this.bundleTasks}
          unbundleTask={this.unbundleTask}
          unbundleTasks={this.unbundleTasks}
          loading={this.props.loading}
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

const ActiveBundle = (props) => {
  const showMarkerPopup = (markerData) => {
    return (
      <Popup
        key={markerData.options.taskId}
        offset={props.task.id === markerData.options.taskId ? [0.5, -16] : [0.5, -5]}
      >
        <div className="marker-popup-content">
          <TaskMarkerContent
            {...props}
            marker={markerData}
            taskId={markerData.options.taskId}
            taskBundleData={props.taskBundle?.tasks}
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
      features: _map(props.taskBundle.tasks, (task) => ({
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
      highlightPrimaryTask={props.task.id}
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
      taskData={
        props.bundledOnly && props.taskBundle ? props.taskBundle?.tasks : props.taskInfo?.tasks
      }
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
    <div className="mr-h-full mr-rounded">
      <div
        className="mr-h-3/4 mr-min-h-80 mr-max-h-screen-80"
        style={{ maxHeight: `${props.widgetLayout.w * 80}px` }}
      >
        {props.loading ? (
          <BusySpinner className="mr-h-full mr-flex mr-items-center" />
        ) : (
          <MapPane>{map}</MapPane>
        )}
        <div className="mr-flex mr-justify-between mr-content-center mr-my-4">
          <button
            className="mr-button mr-button--green-lighter mr-button--small"
            onClick={() => props.setBundledOnly(!props.bundledOnly)}
          >
            {props.bundledOnly ? (
              <FormattedMessage {...messages.displayAllTasksLabel} />
            ) : (
              <FormattedMessage {...messages.displayBundledTasksLabel} />
            )}
          </button>
          <h3 className="mr-text-lg mr-text-center mr-text-pink-light">
            <FormattedMessage
              {...messages.simultaneousTasks}
              values={{ taskCount: props.taskBundle.taskIds.length }}
            />
          </h3>
          <button
            disabled={
              props.bundleEditsDisabled ||
              (props.initialBundle &&
                props.initialBundle?.taskIds?.length === props.taskBundle?.taskIds?.length)
            }
            className="mr-button mr-button--green-lighter mr-button--small"
            style={{
              cursor:
                props.bundleEditsDisabled ||
                (props.initialBundle &&
                  props.initialBundle?.taskIds?.length === props.taskBundle?.taskIds?.length)
                  ? "default"
                  : "pointer",
              opacity:
                props.bundleEditsDisabled ||
                (props.initialBundle &&
                  props.initialBundle?.taskIds?.length === props.taskBundle?.taskIds?.length)
                  ? 0.3
                  : 1,
            }}
            onClick={() => props.unbundleTasks()}
          >
            {!props.initialBundle ? (
              <FormattedMessage {...messages.unbundleTasksLabel} />
            ) : (
              <FormattedMessage {...messages.resetBundleLabel} />
            )}
          </button>
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
        <div className={"mr-px-4"}>{table}</div>
      </div>
    </div>
  );
};

const BuildBundle = (props) => {
  if (props.virtualChallenge || _isFinite(props.virtualChallengeId)) {
    return (
      <div className="mr-text-base">
        <FormattedMessage {...messages.noVirtualChallenges} />
      </div>
    );
  }

  const totalTaskCount = props.taskInfo?.totalCount || props.taskInfo?.tasks?.length;
  const bundleButton =
    !props.taskReadOnly &&
    props.selectedTaskCount(totalTaskCount) > 1 &&
    !props.bundleEditsDisabled ? (
      <button
        className="mr-button mr-button--green-lighter mr-button--small"
        onClick={props.bundleTasks}
      >
        <FormattedMessage {...messages.bundleTasksLabel} />
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
      initialBounds={toLatLngBounds(props.criteria?.boundingBox ?? [])}
      onBulkTaskSelection={props.selectTasks}
      onBulkTaskDeselection={props.deselectTasks}
      fitbBoundsControl
      showSelectMarkersInView
    />
  );

  return (
    <div className="mr-pb-2 mr-h-full mr-rounded">
      <div
        className="mr-h-3/4 mr-min-h-80 mr-max-h-screen-80"
        style={{ maxHeight: `${props.widgetLayout.w * 80}px` }}
      >
        {props.loading ? (
          <BusySpinner className="mr-h-full mr-flex mr-items-center" />
        ) : (
          <MapPane showLasso>{map}</MapPane>
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
          className={`mr-flex mr-space-x-3 mr-items-center ${props.widgetLayout && props.widgetLayout?.w === 4 ? "mr-justify-between" : "mr-justify-end"}`}
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
