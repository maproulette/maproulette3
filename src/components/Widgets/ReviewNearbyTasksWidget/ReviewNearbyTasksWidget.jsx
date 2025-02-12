import bbox from "@turf/bbox";
import { featureCollection, point } from "@turf/helpers";
import _isEqual from "lodash/isEqual";
import _isFinite from "lodash/isFinite";
import _map from "lodash/map";
import _pick from "lodash/pick";
import _sum from "lodash/sum";
import _values from "lodash/values";
import { Component } from "react";
import { FormattedMessage } from "react-intl";
import { Popup } from "react-leaflet";
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
import TaskClusterMap from "../../TaskClusterMap/TaskClusterMap";
import TaskPriorityFilter from "../../TaskFilters/TaskPriorityFilter";
import TaskPropertyFilter from "../../TaskFilters/TaskPropertyFilter";
import TaskStatusFilter from "../../TaskFilters/TaskStatusFilter";
import messages from "./Messages";
import TaskMarkerContent from "./TaskMarkerContent";

const VALID_STATUS_KEYS = [TaskAction.available, TaskAction.skipped, TaskAction.tooHard];

const descriptor = {
  widgetKey: "ReviewNearbyTasksWidget",
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

export default class ReviewNearbyTasksWidget extends Component {
  /**
   * Initialize the cluster filters to include tasks from the current challenge
   * and initially within bounds of "nearby" tasks as a starting point for the
   * widget map
   */
  initializeClusterFilters(prevProps = {}) {
    if (this.props.taskBundle) {
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
    } else if (
      (this.props.nearbyTasks?.tasks?.length || 0) > 0 &&
      !_isEqual(this.props.nearbyTasks, prevProps.nearbyTasks) &&
      !this.props.taskBundle
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
  }

  componentWillUnmount() {
    this.props.resetSelectedTasks();
    const challengeId = this.props.task?.parent?.id;
    if (_isFinite(challengeId)) {
      this.props.unsubscribeFromChallengeTaskMessages(challengeId);
    }
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
  const { task, taskBundle, bundleEditsDisabled, initialBundle, widgetLayout } = props;
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

  return (
    <div className="mr-flex mr-flex-col mr-h-full">
      <div className="mr-flex-grow mr-min-h-0">
        {props.loading ? (
          <BusySpinner className="mr-h-full mr-flex mr-items-center" />
        ) : (
          <MapPane>{map}</MapPane>
        )}
      </div>
      <div className="mr-flex mr-content-center mr-my-4">
        <button
          className="mr-button mr-button--green-lighter mr-button--small mr-mr-2"
          onClick={() => props.setBundledOnly(!props.bundledOnly)}
        >
          <FormattedMessage
            {...messages[props.bundledOnly ? "displayAllTasksLabel" : "displayBundledTasksLabel"]}
          />
        </button>
        <h3 className="mr-text-lg mr-text-center mr-text-pink-light mr-mt-4 mr-ml-4 mr-mb-2">
          <FormattedMessage
            {...messages.simultaneousTasks}
            values={{ taskCount: taskBundle?.taskIds.length }}
          />
        </h3>
      </div>
      <div
        className={
          widgetLayout && widgetLayout?.w === 4
            ? "mr-px-4 mr-space-y-3"
            : "mr-px-4 xl:mr-flex xl:mr-justify-between mr-items-center"
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
  } = props;

  if (virtualChallenge || _isFinite(virtualChallengeId)) {
    return (
      <div className="mr-text-base">
        <FormattedMessage {...messages.noVirtualChallenges} />
      </div>
    );
  }

  const totalTaskCount = taskInfo?.totalCount || taskInfo?.tasks?.length;

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
      fitbBoundsControl
      showSelectMarkersInView
    />
  );

  return (
    <div className="mr-flex mr-flex-col mr-h-full">
      <div className="mr-flex-grow mr-min-h-0">
        {props.loading ? (
          <BusySpinner className="mr-h-full mr-flex mr-items-center" />
        ) : (
          <MapPane showLasso>{map}</MapPane>
        )}
      </div>
      <div
        className={
          props.widgetLayout && props.widgetLayout?.w === 4
            ? "mr-px-4 mr-space-y-3"
            : "mr-px-4 xl:mr-flex xl:mr-justify-between mr-items-center"
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
                    WithWebSocketSubscriptions(WithKeyboardShortcuts(ReviewNearbyTasksWidget)),
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
