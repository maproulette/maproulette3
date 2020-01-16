import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { Popup } from 'react-leaflet'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import _isEqual from 'lodash/isEqual'
import _uniq from 'lodash/uniq'
import _sum from 'lodash/sum'
import _values from 'lodash/values'
import _pick from 'lodash/pick'
import _omit from 'lodash/omit'
import bbox from '@turf/bbox'
import { point, featureCollection } from '@turf/helpers'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import MapPane from '../../EnhancedMap/MapPane/MapPane'
import TaskClusterMap from '../../TaskClusterMap/TaskClusterMap'
import TaskPropertyFilter from '../../TaskFilters/TaskPropertyFilter'
import TaskPriorityFilter from '../../TaskFilters/TaskPriorityFilter'
import TaskStatusFilter from '../../TaskFilters/TaskStatusFilter'
import WithBrowsedChallenge from '../../HOCs/WithBrowsedChallenge/WithBrowsedChallenge'
import WithNearbyTasks from '../../HOCs/WithNearbyTasks/WithNearbyTasks'
import WithTaskClusterMarkers from '../../HOCs/WithTaskClusterMarkers/WithTaskClusterMarkers'
import WithChallengeTaskClusters from '../../HOCs/WithChallengeTaskClusters/WithChallengeTaskClusters'
import WithClusteredTasks from '../../HOCs/WithClusteredTasks/WithClusteredTasks'
import WithFilterCriteria from '../../HOCs/WithFilterCriteria/WithFilterCriteria'
import WithBoundedTasks from '../../HOCs/WithBoundedTasks/WithBoundedTasks'
import WithFilteredClusteredTasks
       from '../../HOCs/WithFilteredClusteredTasks/WithFilteredClusteredTasks'
import AsMappableTask from '../../../interactions/Task/AsMappableTask'
import WithWebSocketSubscriptions
       from '../../HOCs/WithWebSocketSubscriptions/WithWebSocketSubscriptions'
import { TaskStatus } from '../../../services/Task/TaskStatus/TaskStatus'
import { TaskAction } from '../../../services/Task/TaskAction/TaskAction'
import QuickWidget from '../../QuickWidget/QuickWidget'
import BusySpinner from '../../BusySpinner/BusySpinner'
import TaskAnalysisTable from '../../TaskAnalysisTable/TaskAnalysisTable'
import TaskMarkerContent from './TaskMarkerContent'
import messages from './Messages'

const VALID_STATUS_KEYS = [TaskAction.available, TaskAction.skipped, TaskAction.tooHard]
const VALID_STATUSES =
{
  [TaskStatus.created]: true,
  [TaskStatus.skipped]: true,
  [TaskStatus.tooHard]: true,
}

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
                     WithTaskClusterMarkers(TaskClusterMap('taskBundling')))


export default class TaskBundleWidget extends Component {
  bundleTasks = () => {
    this.props.createTaskBundle(
      _uniq([this.props.task.id].concat([...this.props.selectedTasks.keys()]))
    )
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
    if (_isFinite(challengeId) &&
       (challengeId !== _get(prevProps.task, 'parent.id'))) {
      this.props.subscribeToChallengeTaskMessages(challengeId)
    }
  }

  unbundleTasks = async () => {
    this.props.removeTaskBundle(this.props.taskBundle.bundleId, this.props.task.id)
    this.props.resetSelectedTasks()
  }

  updateBounds = (challengeId, bounds, zoom) => {
    this.props.updateTaskFilterBounds(bounds, zoom)
  }

  setBoundsToNearbyTask = () => {
    const taskList = _get(this.props, 'nearbyTasks.tasks')

    // Add the current task to the task list so that it always shows
    // up in the bounds.
    const mappableTask = AsMappableTask(this.props.task)
    mappableTask.point = mappableTask.calculateCenterPoint()
    taskList.push(mappableTask)

    if (taskList.length === 0) {
      return
    }

    const nearbyBounds = bbox(featureCollection(
      taskList.map(t => point([t.point.lng, t.point.lat]))
    ))

    this.updateBounds(
      this.props.challengeId,
      nearbyBounds,
      _get(this.props, 'mapBounds.zoom', 18)
    )
  }

  componentDidMount() {
    if (!this.props.taskBundle) {
      this.initializeClusterFilters()
      this.initializeWebsocketSubscription()
    }
  }

  componentDidUpdate(prevProps) {
    if (!this.props.taskBundle) {
      this.initializeClusterFilters(prevProps)
      this.initializeWebsocketSubscription(prevProps)
    }

    if (_isFinite(_get(this.props, 'task.id')) &&
        _isFinite(_get(prevProps, 'task.id')) &&
        this.props.task.id !== prevProps.task.id) {
      this.props.resetSelectedTasks()
    }
  }

  componentWillUnmount() {
    const challengeId = _get(this.props.task, 'parent.id')
    if (_isFinite(challengeId)) {
      this.props.unsubscribeFromChallengeTaskMessages(challengeId)
    }
  }

  render() {
    const WidgetContent = _get(this.props, 'taskBundle.tasks.length', 0) > 0 ?
                          ActiveBundle : BuildBundle
    return (
      <QuickWidget
        {...this.props}
        className="mr-bg-transparent"
        widgetTitle={
          <FormattedMessage {...messages.title} />
        }
        noMain
      >
        <WidgetContent
          {...this.props}
          updateBounds={this.updateBounds}
          bundleTasks={this.bundleTasks}
          unbundleTasks={this.unbundleTasks}
          loading={this.props.loading}
          skipInitialFetch
        />
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
  if (!props.taskBundle) {
    return null
  }

  return (
    <div className="mr-bg-white mr-p-4 mr-h-full mr-rounded">
      <div className="mr-flex mr-justify-between mr-content-center mr-mb-8">
        <h3 className="mr-text-lg mr-text-blue">
          <FormattedMessage
            {...messages.simultaneousTasks}
            values={{taskCount: props.taskBundle.taskIds.length}}
          />
        </h3>
        {!props.disallowBundleChanges &&
          <button
            className="mr-button mr-button--green mr-button--small"
            onClick={() => {
              props.unbundleTasks()
            }}
          >
            <FormattedMessage {...messages.unbundleTasksLabel} />
          </button>
        }
      </div>

      <TaskAnalysisTable
        {...props}
        taskInfo={{
          challengeId: props.challengeId,
          loading: false,
          tasks: props.taskBundle.tasks,
        }}
        selectedTasks={new Map()}
        taskData={_get(props, 'taskBundle.tasks')}
        totalTaskCount={_get(props, 'taskInfo.totalCount') || _get(props, 'taskInfo.tasks.length')}
        totalTasksInChallenge={ calculateTasksInChallenge(props) }
        showColumns={['featureId', 'id', 'status', 'priority']}
        taskSelectionStatuses={[TaskStatus.created, TaskStatus.skipped, TaskStatus.tooHard]}
        taskSelectionReviewStatuses={[]}
        suppressHeader
        suppressManagement
        defaultPageSize={5}
      />
    </div>
  )
}

const BuildBundle = props => {
  if (props.disallowBundleChanges || props.task.reviewStatus) {
    return (
      <div className="mr-text-base">
        <FormattedMessage {...messages.disallowBundling} />
      </div>
    )
  }

  if (props.task.suggestedFix) {
    return (
      <div className="mr-text-base">
        <FormattedMessage {...messages.noSuggestedFixes} />
      </div>
    )
  }

  if (props.virtualChallenge || _isFinite(props.virtualChallengeId)) {
    return (
      <div className="mr-text-base">
        <FormattedMessage {...messages.noVirtualChallenges} />
      </div>
    )
  }

  // Force the current task to always show as selected
  const selectedTasks = new Map(props.selectedTasks)
  selectedTasks.set(props.task.id, props.task)

  const bundleButton = selectedTasks.size > 1 ? (
    <button
      className="mr-button mr-button--green mr-button--small"
      onClick={props.bundleTasks}
    >
      <FormattedMessage {...messages.bundleTasksLabel} />
    </button>
  ) : null

  const showMarkerPopup = (markerData) => {
    return (
      <Popup key={markerData.options.taskId}>
        <div className="marker-popup-content">
          <TaskMarkerContent marker={markerData} taskId={markerData.options.taskId}
                    selectedTasks={selectedTasks} {..._omit(props, 'selectedTasks')} />
        </div>
      </Popup>
    )
  }

  const map =
    <ClusterMap
      loadingTasks={props.loadingTasks}
      showMarkerPopup={showMarkerPopup}
      highlightPrimaryTask={props.task.id}
      chosenTasks={selectedTasks}
      boundingBox={_get(props, 'criteria.boundingBox')}
      onBulkTaskSelection={props.selectTasksById}
      allowClusterToggle={false}
      hideSearchControl
      {..._omit(props, 'selectedTasks', 'className')}
    />

  return (
    <div className="mr-bg-white mr-pb-2 mr-h-full mr-rounded">
      <div className="mr-h-2/5 mr-max-h-100">
        {props.loading ?
          <BusySpinner lightMode className="mr-h-full mr-flex mr-items-center" /> :
          <MapPane showLasso>{map}</MapPane>
        }
      </div>
      <div className="mr-my-4 mr-px-4 xl:mr-flex mr-justify-between">
        <ul className="mr-mb-4 xl:mr-mb-0 md:mr-flex">
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
      <div className="mr-px-4 mr-h-half mr-overflow-y-auto">
        <TaskAnalysisTable
          {...props}
          selectedTasks={selectedTasks}
          taskData={_get(props, 'taskInfo.tasks')}
          totalTaskCount={_get(props, 'taskInfo.totalCount') || _get(props, 'taskInfo.tasks.length')}
          totalTasksInChallenge={ calculateTasksInChallenge(props) }
          showColumns={['selected', 'featureId', 'id', 'status', 'priority']}
          taskSelectionStatuses={[TaskStatus.created, TaskStatus.skipped, TaskStatus.tooHard]}
          taskSelectionReviewStatuses={[]}
          customHeaderControls={bundleButton}
          suppressManagement
          showSelectionCount
          highlightPrimaryTask
          defaultPageSize={5}
        />
      </div>
    </div>
  )
}

registerWidgetType(
  WithNearbyTasks(
    WithClusteredTasks(
      WithFilteredClusteredTasks(
        WithFilterCriteria(
          WithBoundedTasks(
            WithBrowsedChallenge(
              WithWebSocketSubscriptions(
                TaskBundleWidget,
              )
            ),
            'filteredClusteredTasks',
            'taskInfo'
          )
        ),
        'clusteredTasks',
        'filteredClusteredTasks',
        {
          statuses: VALID_STATUSES,
          includeLocked: false,
        }
      )
    )
  ), descriptor
)
