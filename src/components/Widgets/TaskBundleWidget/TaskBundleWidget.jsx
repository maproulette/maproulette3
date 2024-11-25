import { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { Popup } from 'react-leaflet'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import _isEqual from 'lodash/isEqual'
import _isEmpty from 'lodash/isEmpty'
import _sum from 'lodash/sum'
import _values from 'lodash/values'
import _pick from 'lodash/pick'
import _map from 'lodash/map'
import bbox from '@turf/bbox'
import { point, featureCollection } from '@turf/helpers'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
       import { buildSearchURL } from '../../../services/SearchCriteria/SearchCriteria'
import MapPane from '../../EnhancedMap/MapPane/MapPane'
import TaskClusterMap from '../../TaskClusterMap/TaskClusterMap'
import TaskPropertyFilter from '../../TaskFilters/TaskPropertyFilter'
import TaskPriorityFilter from '../../TaskFilters/TaskPriorityFilter'
import TaskStatusFilter from '../../TaskFilters/TaskStatusFilter'
import WithSelectedClusteredTasks
       from '../../HOCs/WithSelectedClusteredTasks/WithSelectedClusteredTasks'
import WithBrowsedChallenge from '../../HOCs/WithBrowsedChallenge/WithBrowsedChallenge'
import WithNearbyTasks from '../../HOCs/WithNearbyTasks/WithNearbyTasks'
import WithTaskClusterMarkers from '../../HOCs/WithTaskClusterMarkers/WithTaskClusterMarkers'
import WithChallengeTaskClusters from '../../HOCs/WithChallengeTaskClusters/WithChallengeTaskClusters'
import WithClusteredTasks from '../../HOCs/WithClusteredTasks/WithClusteredTasks'
import WithFilterCriteria from '../../HOCs/WithFilterCriteria/WithFilterCriteria'
import WithTaskPropertyKeys from '../../HOCs/WithTaskPropertyKeys/WithTaskPropertyKeys'
import WithBoundedTasks from '../../HOCs/WithBoundedTasks/WithBoundedTasks'
import WithFilteredClusteredTasks
       from '../../HOCs/WithFilteredClusteredTasks/WithFilteredClusteredTasks'
import WithSavedFilters from '../../HOCs/WithSavedFilters/WithSavedFilters'
import AsMappableTask from '../../../interactions/Task/AsMappableTask'
import AsCooperativeWork from '../../../interactions/Task/AsCooperativeWork'
import WithWebSocketSubscriptions
       from '../../HOCs/WithWebSocketSubscriptions/WithWebSocketSubscriptions'
import { toLatLngBounds } from '../../../services/MapBounds/MapBounds'
import QuickWidget from '../../QuickWidget/QuickWidget'
import BusySpinner from '../../BusySpinner/BusySpinner'
import TaskAnalysisTable from '../../TaskAnalysisTable/TaskAnalysisTable'
import TaskMarkerContent from './TaskMarkerContent'
import Dropdown from '../../Dropdown/Dropdown'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import messages from './Messages'
import WithKeyboardShortcuts from '../../HOCs/WithKeyboardShortcuts/WithKeyboardShortcuts'
import { TaskAction } from '../../../services/Task/TaskAction/TaskAction'

const VALID_STATUS_KEYS = [TaskAction.available, TaskAction.skipped, TaskAction.tooHard]

const descriptor = {
  widgetKey: 'TaskBundleWidget',
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 4,
  defaultWidth: 6,
  minHeight: 12,
  defaultHeight: 14,
}

const ClusterMap = WithChallengeTaskClusters(
  WithTaskClusterMarkers(TaskClusterMap('taskBundling')),
  true,
  true,
  false,
  false
)

const shortcutGroup = 'taskEditing'

export default class TaskBundleWidget extends Component {
  state = {
    shortcutActive: false,
    bundleButtonDisabled: false,
  }

  handleKeyboardShortcuts = (event) => {
    const { activeKeyboardShortcuts, textInputActive, taskReadOnly, keyboardShortcutGroups } = this.props;

    // Return early if any of the following conditions are met:
    // - Shortcut group is not active
    // - Typing in inputs
    // - Modifier keys are pressed
    // - Task is in read-only mode
    if (_isEmpty(activeKeyboardShortcuts[shortcutGroup]) || 
        textInputActive(event) || 
        event.metaKey || event.altKey || event.ctrlKey || 
        taskReadOnly) {
      return;
    }

    const shortcuts = keyboardShortcutGroups.taskEditing;
    if (event.key === shortcuts.completeTogether.key) {
      this.bundleTasks()
    }
  }

  /**
   * Initialize the cluster filters to include tasks from the current challenge
   * and initially within bounds of "nearby" tasks as a starting point for the
   * widget map
   */
  initializeClusterFilters(prevProps={}) {
    // If the nearby tasks loaded, update bounds
    if (_get(this.props, 'nearbyTasks.tasks.length', 0) > 0 &&
        !_isEqual(this.props.nearbyTasks, prevProps.nearbyTasks)) {
      this.setBoundsToNearbyTask()
    }
  }

  initializeWebsocketSubscription(prevProps={}) {
    const challengeId = _get(this.props.task, 'parent.id')
    if (_isFinite(challengeId) && (challengeId !== _get(prevProps.task, 'parent.id'))) {
      this.props.subscribeToChallengeTaskMessages(challengeId)
    }
  }

  bundleTasks = () => {
    if (this.props.taskBundle || this.props.bundleEditsDisabled) {
      return;
    }

    const selectedArray = Array.from(this.props.selectedTasks.selected.values());
    const isCooperative = AsCooperativeWork(this.props.task).isCooperative();

    selectedArray.forEach(item => {
      if (AsCooperativeWork(item).isCooperative() !== isCooperative) {
        throw new Error("Bundle type mismatch, not all tasks are of the same type");
      }
    });

    this.setState({ bundleButtonDisabled: true });
    this.props.createTaskBundle([...this.props.selectedTasks.selected.keys()]);

    setTimeout(() => {
      this.setState({ bundleButtonDisabled: false });
    }, 5000);
  }

  unbundleTask = (task) => {
    const taskId = task.id ?? task.taskId 
    this.props.removeTaskFromBundle(taskId)
    this.props.toggleTaskSelection(task)
  }

  setBoundsToNearbyTask = () => {
    const taskList = _get(this.props, 'nearbyTasks.tasks')

    // Add the current task to the task list so that it always shows
    // up in the bounds.
    const mappableTask = AsMappableTask(this.props.task)
    mappableTask.point = mappableTask.calculateCenterPoint()
    if (taskList) {
      taskList?.push(mappableTask)
    }

    if (!taskList || taskList.length === 0) {
      return
    }

    const nearbyBounds = bbox(featureCollection(
      taskList.map(t => point([t.point.lng, t.point.lat]))
    ))

    this.props.updateTaskFilterBounds(nearbyBounds, _get(this.props, 'mapBounds.zoom', 18))
  }

  saveFilters = () => {
    if(!this.props.criteria) return
    const searchURL = buildSearchURL(this.props.criteria)
    this.props.updateUserAppSetting(this.props.user.id, {'taskBundleFilters': searchURL})
  }

  revertFilters = () => {
    if(this.props.clearAllFilters) {
      this.props.clearAllFilters()
    }
    
    if(this.props.updateUserAppSetting) {
      this.props.updateUserAppSetting(this.props.user.id, {'taskBundleFilters': ''})
    }
  }

  componentDidMount() {
    if (!this.props.taskBundle) {
      this.initializeClusterFilters()
      this.initializeWebsocketSubscription()
    }

    if (this.props.task && this.props.selectedTasks && !this.props.isTaskSelected(this.props.task.id)) {
      this.props.selectTasks([this.props.task])
    }
    if(this.props.taskBundle) {
      this.props.selectTasks(this.props.taskBundle.tasks)
      this.setBoundsToNearbyTask()
    }
  }

  async componentDidUpdate(prevProps) {
    if (!this.props.taskBundle) {
      this.initializeClusterFilters(prevProps)
      this.initializeWebsocketSubscription(prevProps)
    }

    if (this.props.selectedTaskCount(this.props.taskInfo.totalCount) > 1 && this.state.shortcutActive === false) {
      this.setState({ shortcutActive: true })
      this.props.activateKeyboardShortcut(
        shortcutGroup,
        _pick(this.props.keyboardShortcutGroups.taskEditing, 'completeTogether'),
        this.handleKeyboardShortcuts
      )
    } else if (this.state.shortcutActive === true && this.props.selectedTaskCount(this.props.taskInfo.totalCount) <= 1){
      this.setState({ shortcutActive: false })
      this.props.deactivateKeyboardShortcut(shortcutGroup, 'completeTogether', this.handleKeyboardShortcuts)
    }

    if (_isFinite(_get(this.props, 'task.id')) &&
        _isFinite(_get(prevProps, 'task.id')) &&
        this.props.task.id !== prevProps.task.id) {
      this.props.resetSelectedTasks()
      this.setBoundsToNearbyTask()
    }
    else if (this.props.task && this.props.selectedTasks && !this.props.isTaskSelected(this.props.task.id)) {
      this.props.selectTasks([this.props.task])
    }
    if(this.props.taskBundle && this.props.taskBundle !== prevProps.taskBundle) {
      await this.props.resetSelectedTasks()
      this.props.selectTasks(this.props.taskBundle.tasks)
      if(!prevProps.taskBundle){
        this.setBoundsToNearbyTask()
      }
    }
  }

  componentWillUnmount() {
    this.props.resetSelectedTasks()
    const challengeId = _get(this.props.task, 'parent.id')
    if (_isFinite(challengeId)) {
      this.props.unsubscribeFromChallengeTaskMessages(challengeId)
    }

    this.props.deactivateKeyboardShortcut(shortcutGroup, 'completeTogether', this.handleKeyboardShortcuts)
  }

  render() {
    const WidgetContent = this.props.taskBundle ? ActiveBundle : BuildBundle;
    return (
      <QuickWidget
        {...this.props}
        className=""
        widgetTitle={
          <FormattedMessage {...messages.title} />
        }
        noMain
      >
        <WidgetContent
          {...this.props}
          saveFilters={this.saveFilters}
          revertFilters={this.revertFilters}
          bundleTasks={this.bundleTasks}
          unbundleTask={this.unbundleTask}
          loading={this.props.loading}
        />
        {this.props.errorMessage && (
          <div className="mr-text-red">
            <FormattedMessage id={this.props.errorMessage} defaultMessage={this.props.errorMessage} />
          </div>
        )}
      </QuickWidget>
    )
  }
}

const calculateTasksInChallenge = props => {
  const actions = _get(props, 'browsedChallenge.actions')
  if (!actions) {
    return _get(props, 'taskInfo.totalCount') || _get(props, 'taskInfo.tasks.length')
  }

  return _sum(_values(_pick(actions, VALID_STATUS_KEYS)))
}

const ActiveBundle = props => {
  const showMarkerPopup = markerData => {
    return (
      <Popup key={markerData.options.taskId} offset={props.task.id === markerData.options.taskId ? [0.5, -16] :  [0.5, -5]}>
        <div className="marker-popup-content">
          <TaskMarkerContent
            {...props}
            marker={markerData}
            taskId={markerData.options.taskId}
            taskBundleData={_get(props, 'taskBundle.tasks')}
            bundling
            unbundleTask={props.unbundleTask}
            bundleTask={props.bundleTask}
          />
        </div>
      </Popup>
    )
  }

  const bundleCenter = toLatLngBounds(
    bbox({
      type: 'FeatureCollection',
      features: _map(props.taskBundle.tasks, task =>
        ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [task.location.coordinates[0], task.location.coordinates[1]]
          }
        })
      )
    })
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
  )

  const table = (
    <TaskAnalysisTable
      {...props}
      selectedTasks={new Map()}
      taskData={props.bundledOnly && props.taskBundle ? _get(props, 'taskBundle.tasks'): _get(props, 'taskInfo.tasks')}
      totalTaskCount={
        _get(props, 'taskInfo.totalCount') ||
        _get(props, 'taskInfo.tasks.length')
      }
      totalTasksInChallenge={calculateTasksInChallenge(props)}
      showColumns={[
        'featureId',
        'id',
        'status',
        'priority',
        'editBundle',
      ]}
      suppressHeader
      suppressManagement
      suppressTriState
      defaultPageSize={5}
    />
  )

  return (
    <div className="mr-h-full mr-rounded">
      <div className="mr-h-3/4 mr-min-h-80 mr-max-h-screen-80" style={{ maxHeight: `${props.widgetLayout.w * 80}px`}}>
        {props.loading ? (
          <BusySpinner className="mr-h-full mr-flex mr-items-center" />
        ) : (
          <MapPane>{map}</MapPane>
        )}
        {props.errorMessage && (
          <div className="mr-text-red">
            <FormattedMessage {...messages[props.errorMessage]} />
          </div>
        )}
        <h3 className="mr-text-lg mr-text-center mr-text-pink-light mr-mt-4">
          <FormattedMessage
            {...messages.simultaneousTasks}
            values={{ taskCount: props.taskBundle.taskIds.length }}
          />
        </h3>
        <div className="mr-flex mr-justify-between mr-content-center mr-my-4">
          <button
            className="mr-button mr-button--green-lighter mr-button--small mr-mr-2"
            onClick={() => props.setBundledOnly(!props.bundledOnly)}
          >
            {props.bundledOnly ? (
              <FormattedMessage {...messages.displayAllTasksLabel} />
            ) : (
              <FormattedMessage {...messages.displayBundledTasksLabel} />
            )}
          </button>
          {props.initialBundle && (
            <button
              disabled={(props.bundleEditsDisabled || (props.initialBundle && props.initialBundle?.taskIds?.length === props.taskBundle?.taskIds?.length))}
              className="mr-button mr-button--green-lighter mr-button--small mr-mr-2"
              style={{
                cursor: (props.bundleEditsDisabled || (props.initialBundle && props.initialBundle?.taskIds?.length === props.taskBundle?.taskIds?.length)) ? 'default' : 'pointer',
                opacity: (props.bundleEditsDisabled || (props.initialBundle && props.initialBundle?.taskIds?.length === props.taskBundle?.taskIds?.length)) ? 0.3 : 1
              }}
              onClick={() => props.resetTaskBundle()}
            >
              <FormattedMessage {...messages.resetBundleLabel} />
            </button>
          )}
          <button
            disabled={(props.bundleEditsDisabled)}
            className="mr-button mr-button--green-lighter mr-button--small"
            style={{
              cursor: props.bundleEditsDisabled ? 'default' : 'pointer',
              opacity: props.bundleEditsDisabled ? 0.3 : 1
            }}

            onClick={() => props.clearActiveTaskBundle()}
          >
            <FormattedMessage {...messages.unbundleTasksLabel} />
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
                ? 'mr-justify-between'
                : 'mr-justify-end'
            }`}
          >
            {<ClearFiltersControl clearFilters={props.clearAllFilters} />}
            <Dropdown
              className="mr-flex mr-items-center"
              dropdownButton={dropdown => (
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
              dropdownContent={dropdown => (
                <div className="mr-flex mr-flex-col mr-space-y-2">
                  <SaveFiltersControl
                    saveFilters={props.saveFilters}
                    closeDropdown={dropdown.closeDropdown}
                  />
                  <RevertFiltersControl
                    revertFilters={props.revertFilters}
                  />
                </div>
              )}
            />
          </div>
        </div>
        <div className={"mr-px-4"}>{table}</div>
      </div>
    </div>
  )
}

const BuildBundle = props => {
  if (props.virtualChallenge || _isFinite(props.virtualChallengeId)) {
    return (
      <div className="mr-text-base">
        <FormattedMessage {...messages.noVirtualChallenges} />
      </div>
    )
  }

  const totalTaskCount = _get(props, 'taskInfo.totalCount') || _get(props, 'taskInfo.tasks.length')
  const bundleButton = !props.taskReadOnly && props.selectedTaskCount(totalTaskCount) > 1 && !props.bundleEditsDisabled ? (
      <button
        className="mr-button mr-button--green-lighter mr-button--small"
        onClick={props.bundleTasks}
      >
        <FormattedMessage {...messages.bundleTasksLabel} />
      </button>
  ) : null

  const showMarkerPopup = (markerData) => {
    return (
      <Popup key={markerData.options.taskId} offset={props.task.id === markerData.options.taskId ? [0.5, -16] :  [0.5, -5]}>
        <div className="marker-popup-content">
          <TaskMarkerContent
            {...props}
            marker={markerData}
            taskId={markerData.options.taskId}
          />
        </div>
      </Popup>
    )
  }

  const map =
    <ClusterMap
      {...props}
      showMarkerPopup={showMarkerPopup}
      highlightPrimaryTask={props.task.id}
      taskCenter={AsMappableTask(props.task).calculateCenterPoint()}
      boundingBox={_get(props, 'criteria.boundingBox')}
      initialBounds={toLatLngBounds(_get(props, 'criteria.boundingBox', []))}
      onBulkTaskSelection={props.selectTasks}
      onBulkTaskDeselection={props.deselectTasks}
      fitbBoundsControl
      showSelectMarkersInView
    />

  return (
    <div className="mr-pb-2 mr-h-full mr-rounded">
      <div className="mr-h-3/4 mr-min-h-80 mr-max-h-screen-80" style={{ maxHeight: `${props.widgetLayout.w * 80}px`}}>
        {props.loading ?
          <BusySpinner className="mr-h-full mr-flex mr-items-center" /> :
          <MapPane showLasso>{map}</MapPane>
        }
      </div>
      {props.errorMessage && (
        <div className="mr-text-red">
          <FormattedMessage {...messages[props.errorMessage]} />
        </div>
      )}
      <div className={props.widgetLayout && props.widgetLayout?.w === 4 ? "mr-my-4 mr-px-4 mr-space-y-3" : "mr-my-4 mr-px-4 xl:mr-flex xl:mr-justify-between mr-items-center"}>
        {props.initialBundle && (
          <button
            className={`mr-button mr-button--red mr-button--small ${props.bundleEditsDisabled ? 'mr-text-grey-light mr-cursor-default' : 'mr-text-green-lighter'}`} // Conditional classes
            onClick={props.resetTaskBundle}
            disabled={props.bundleEditsDisabled}
          >
            <FormattedMessage {...messages.resetBundleLabel} />
          </button>
        )}
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
        
        <div className={`mr-flex mr-space-x-3 mr-items-center ${props.widgetLayout && props.widgetLayout?.w === 4 ? 'mr-justify-between' : 'mr-justify-end'}`}>
        {<ClearFiltersControl clearFilters={props.clearAllFilters}/>}
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
              <div className='mr-flex mr-flex-col mr-space-y-2'>
                <SaveFiltersControl saveFilters={props.saveFilters} closeDropdown={dropdown.closeDropdown}/>
                <RevertFiltersControl revertFilters={props.revertFilters}/>
              </div>
            )}
          />
        </div>
      </div>
      <div className="mr-px-4">
        <TaskAnalysisTable
          {...props}
          taskData={_get(props, 'taskInfo.tasks')}
          totalTaskCount={totalTaskCount}
          totalTasksInChallenge={ calculateTasksInChallenge(props) }
          showColumns={['selected', 'featureId', 'id', 'status', 'priority', 'comments']}
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
  )
}

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
                    WithWebSocketSubscriptions(
                      WithKeyboardShortcuts(TaskBundleWidget)
                    )
                  ),
                  'filteredClusteredTasks',
                  'taskInfo'
                ), true, false, true, true, 'taskBundleFilters'
              )
            ),
            'clusteredTasks',
            'filteredClusteredTasks',
            {
              includeLocked: false,
            },
            true,
            'taskBundleFilters'
          )
        )
      )
    )
  ), descriptor
)

const RevertFiltersControl = ({revertFilters}) => {
  const handleClick = () => {revertFilters()}
  return (
    <button className="mr-flex mr-items-center mr-text-current hover:mr-text-green-lighter mr-transition-colors"
      onClick={handleClick}>
      <FormattedMessage {...messages.restoreDefaultFiltersLabel} />
    </button>
  )
}

const SaveFiltersControl = ({saveFilters, closeDropdown}) => {
  const handleClick = () => {
    saveFilters() 
    closeDropdown()
  }
  return (
    <button className="mr-flex mr-items-center mr-text-current hover:mr-text-green-lighter mr-transition-colors"
      onClick={handleClick}>
      <FormattedMessage {...messages.saveCurrentFiltersLabel} />
    </button>
  )
}

const ClearFiltersControl = ({clearFilters}) => (
  <button className="mr-flex mr-items-center mr-text-green-lighter"
    onClick={clearFilters}>
    <SvgSymbol sym="close-icon"
      viewBox='0 0 20 20'
      className="mr-fill-current mr-w-5 mr-h-5 mr-mr-1" />
    <FormattedMessage {...messages.clearFiltersLabel} />
  </button>
)
