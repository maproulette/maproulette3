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
import TaskReviewStatusFilter from '../../TaskFilters/TaskReviewStatusFilter'
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
import WithWebSocketSubscriptions
       from '../../HOCs/WithWebSocketSubscriptions/WithWebSocketSubscriptions'
import { toLatLngBounds } from '../../../services/MapBounds/MapBounds'
import QuickWidget from '../../QuickWidget/QuickWidget'
import BusySpinner from '../../BusySpinner/BusySpinner'
import TaskMarkerContent from './TaskMarkerContent'
import messages from './Messages'
import WithKeyboardShortcuts from '../../HOCs/WithKeyboardShortcuts/WithKeyboardShortcuts'

const descriptor = {
  widgetKey: 'ReviewNearbyTasksWidget',
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 7,
  defaultWidth: 7,
  minHeight: 10,
  defaultHeight: 11,
}

const ClusterMap = WithChallengeTaskClusters(
  WithTaskClusterMarkers(TaskClusterMap('taskBundling'))
)

export default class ReviewNearbyTasksWidget extends Component {
  constructor(props) {
    super(props);

    // Define the initial state
    this.state = {
      currentSelectedTasks: []
    };
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
    this.props.selectTasks(this.props.taskBundle ? this.props.taskBundle.tasks : [this.props.task])
    if (!this.props.taskBundle) {
      this.initializeClusterFilters()
      this.initializeWebsocketSubscription()
    }
  }

  componentDidUpdate(prevProps) {
    if(this.state.currentSelectedTasks.length === 0) {
      this.setState({currentSelectedTasks: this.props.selectedTasks})
    }

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
    if (_isFinite(_get(this.props, 'task.id')) &&
        _isFinite(_get(prevProps, 'task.id')) &&
        this.props.task.id !== prevProps.task.id) {
          this.props.resetSelectedTasks()
    }
    else if (this.props.task && this.props.selectedTasks && !this.props.isTaskSelected(this.props.task.id)) {
      this.props.selectTasks([this.props.task])
}
  }

  render() {
    const showMarkerPopup = (markerData) => {
      return (
        <Popup key={markerData.options.taskId}>
          <div className="marker-popup-content">
            <TaskMarkerContent
              {...this.props}
              marker={markerData}
              taskId={markerData.options.taskId}
            />
          </div>
        </Popup>
      )
    }

    const boundingBoxData = this.props.criteria.boundingBox ? 'criteria.boundingBox' : 'workspaceContext.taskMapBounds'
  
    const map =
    <ClusterMap
      loadingTasks={this.props.loadingTasks}
      highlightPrimaryTask={this.props.task.id}
      showMarkerPopup={showMarkerPopup}
      taskCenter={AsMappableTask(this.props.task).calculateCenterPoint()}
      boundingBox={_get(this.props, boundingBoxData)}
      initialBounds={toLatLngBounds(_get(this.props, boundingBoxData, []))}
      hideSearchControl
      allowSpidering
      hideLasso={true}
      showSelectMarkersInView
      {..._omit(this.props, 'className')}
      selectedTasks={this.state.currentSelectedTasks}
    />

    return (
      <QuickWidget
        {...this.props}
        className=""
        widgetTitle={
          <FormattedMessage {...messages.title} />
        }
        noMain
      >
       <div className="mr-pb-2 mr-h-full mr-rounded">
         {this.props.taskBundle ? <div className="mr-flex mr-justify-between mr-content-center mr-mb-2">
            <h3 className="mr-text-lg mr-text-pink-light">
              <FormattedMessage
                {...messages.simultaneousTasks}
                values={{taskCount: this.props.taskBundle.taskIds.length}}
              />
            </h3>
          </div> : null}
            <div className="mr-h-2/5 mr-min-h-80 mr-max-h-100">
              {this.props.loading ?
                <BusySpinner className="mr-h-full mr-flex mr-items-center" /> :
                <MapPane showLasso>{map}</MapPane>
              }
            </div>
            <div className="mr-my-4 mr-px-4 xl:mr-flex mr-justify-between">
              <ul className="mr-mb-4 xl:mr-mb-0 md:mr-flex">
                <li className="md:mr-mr-8">
                  <TaskStatusFilter {...this.props} />
                </li>
                <li className="md:mr-mr-8">
                  <TaskReviewStatusFilter {...this.props} />
                </li>
                <li className="md:mr-mr-8">
                  <TaskPriorityFilter {...this.props} />
                </li>
                <li>
                  <TaskPropertyFilter {...this.props} />
                </li>
              </ul>
            </div>
          </div>
      </QuickWidget>
    )
  }
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
                    WithKeyboardShortcuts(ReviewNearbyTasksWidget)
                  )
                ),
                'nearbyTasks',
                'filteredClusteredTasks',
              ), true, false, true
            )
          ),
          'nearbyTasks',
          'taskClusters',
          'filteredClusteredTasks',
          {
            includeLocked: false,
          }
        )
      )
    )
  ), descriptor
)
