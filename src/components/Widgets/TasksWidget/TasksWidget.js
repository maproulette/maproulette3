import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { Popup } from 'react-leaflet'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import _isEqual from 'lodash/isEqual'
import _isEmpty from 'lodash/isEmpty'
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
import AsMappableTask from '../../../interactions/Task/AsMappableTask'
import AsCooperativeWork from '../../../interactions/Task/AsCooperativeWork'
import WithWebSocketSubscriptions
       from '../../HOCs/WithWebSocketSubscriptions/WithWebSocketSubscriptions'
import { TaskStatus } from '../../../services/Task/TaskStatus/TaskStatus'
import { TaskAction } from '../../../services/Task/TaskAction/TaskAction'
import { toLatLngBounds } from '../../../services/MapBounds/MapBounds'
import QuickWidget from '../../QuickWidget/QuickWidget'
import BusySpinner from '../../BusySpinner/BusySpinner'
import TaskAnalysisTable from '../../TaskAnalysisTable/TaskAnalysisTable'
import TaskMarkerContent from './TaskMarkerContent'
import messages from './Messages'
import WithKeyboardShortcuts from '../../HOCs/WithKeyboardShortcuts/WithKeyboardShortcuts'

const VALID_STATUS_KEYS = [TaskAction.available, TaskAction.skipped, TaskAction.tooHard]
const VALID_STATUSES =
{
  [TaskStatus.created]: true,
  [TaskStatus.skipped]: true,
  [TaskStatus.tooHard]: true,
}

const descriptor = {
  widgetKey: 'TasksWidget',
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 4,
  defaultWidth: 6,
  minHeight: 12,
  defaultHeight: 14,
}

const ClusterMap = WithChallengeTaskClusters(
  WithTaskClusterMarkers(TaskClusterMap('taskBundling'))
)

const shortcutGroup = 'taskEditing'

export default class TasksWidget extends Component {
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

    if (this.props.task && this.props.selectedTasks && !this.props.isTaskSelected(this.props.task.id)) {
      this.props.selectTasks(this.props.taskBundle.tasks ? this.props.taskBundle.tasks : [this.props.taskBundle])
    }
  }

  componentDidUpdate(prevProps) {
    if (!this.props.taskBundle) {
      this.initializeClusterFilters(prevProps)
      this.initializeWebsocketSubscription(prevProps)
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
        className=""
        widgetTitle={
          <FormattedMessage {...messages.title} />
        }
        noMain
      >
        <WidgetContent
          {...this.props}
          updateBounds={this.updateBounds}
          loading={this.props.loading}
        />
      </QuickWidget>
    )
  }
}

const ActiveBundle = props => {
  if (!props.taskBundle) {
    return null
  }

  const showMarkerPopup = (markerData) => {
    return (
      <Popup key={markerData.options.taskId}>
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

  const boundingBoxData = props.criteria.boundingBox ? 'criteria.boundingBox' : 'workspaceContext.taskMapBounds'

  const map =
  <ClusterMap
    loadingTasks={props.loadingTasks}
    showMarkerPopup={showMarkerPopup}
    taskCenter={AsMappableTask(props.task).calculateCenterPoint()}
    boundingBox={_get(props, boundingBoxData)}
    initialBounds={toLatLngBounds(_get(props, boundingBoxData, []))}
    allowClusterToggle={false}
    hideSearchControl
    showSelectMarkersInView
    {..._omit(props, 'className')}
  />

  return (
    <div className="mr-p-4 mr-h-full mr-rounded">
      <div className="mr-flex mr-justify-between mr-content-center mr-mb-8">
        <h3 className="mr-text-lg mr-text-pink-light">
          <FormattedMessage
            {...messages.simultaneousTasks}
            values={{taskCount: props.taskBundle.taskIds.length}}
          />
        </h3>
      </div>

      <div className="mr-h-2/5 mr-min-h-80 mr-max-h-100">
        {props.loading ?
          <BusySpinner className="mr-h-full mr-flex mr-items-center" /> :
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
    </div>
  )
}

const BuildBundle = props => {
  const showMarkerPopup = (markerData) => {
    return (
      <Popup key={markerData.options.taskId}>
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
      loadingTasks={props.loadingTasks}
      showMarkerPopup={showMarkerPopup}
      taskCenter={AsMappableTask(props.task).calculateCenterPoint()}
      boundingBox={_get(props, 'criteria.boundingBox')}
      initialBounds={toLatLngBounds(_get(props, 'criteria.boundingBox', []))}
      allowClusterToggle={false}
      hideSearchControl
      allowSpidering
      showSelectMarkersInView
      {..._omit(props, 'className')}
    />

  return (
    <div className="mr-pb-2 mr-h-full mr-rounded">
      <div className="mr-h-2/5 mr-min-h-80 mr-max-h-100">
        {props.loading ?
          <BusySpinner className="mr-h-full mr-flex mr-items-center" /> :
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
    </div>
  )
}

registerWidgetType(
  WithSelectedClusteredTasks(
    WithNearbyTasks(
      WithClusteredTasks(
        WithFilteredClusteredTasks(
          WithTaskPropertyKeys(
            WithFilterCriteria(
              WithBoundedTasks(
                WithBrowsedChallenge(
                  WithWebSocketSubscriptions(
                    WithKeyboardShortcuts(TasksWidget)
                  )
                ),
                'nearbyTasks',
                'filteredClusteredTasks',
              ), true, false, true
            )
          ),
          'nearbyTasks',
          'taskClusters',
          'taskInfo',
          'clusteredTasks',
          'filteredClusteredTasks',
          {
            statuses: VALID_STATUSES,
            includeLocked: false,
          }
        )
      )
    )
  ), descriptor
)
