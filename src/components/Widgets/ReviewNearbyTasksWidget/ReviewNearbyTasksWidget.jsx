import { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { Popup } from 'react-leaflet'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import _isEqual from 'lodash/isEqual'
import bbox from '@turf/bbox'
import { point, featureCollection } from '@turf/helpers'
import { WidgetDataTarget, registerWidgetType } from '../../../services/Widget/Widget'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import MapPane from '../../EnhancedMap/MapPane/MapPane'
import TaskClusterMap from '../../TaskClusterMap/TaskClusterMap'
import TaskPropertyFilter from '../../TaskFilters/TaskPropertyFilter'
import TaskPriorityFilter from '../../TaskFilters/TaskPriorityFilter'
import TaskReviewStatusFilter from '../../TaskFilters/TaskReviewStatusFilter'
import TaskStatusFilter from '../../TaskFilters/TaskStatusFilter'
import WithSelectedClusteredTasks from '../../HOCs/WithSelectedClusteredTasks/WithSelectedClusteredTasks'
import WithBrowsedChallenge from '../../HOCs/WithBrowsedChallenge/WithBrowsedChallenge'
import WithNearbyTasks from '../../HOCs/WithNearbyTasks/WithNearbyTasks'
import WithTaskClusterMarkers from '../../HOCs/WithTaskClusterMarkers/WithTaskClusterMarkers'
import WithChallengeTaskClusters from '../../HOCs/WithChallengeTaskClusters/WithChallengeTaskClusters'
import WithClusteredTasks from '../../HOCs/WithClusteredTasks/WithClusteredTasks'
import WithFilterCriteria from '../../HOCs/WithFilterCriteria/WithFilterCriteria'
import WithTaskPropertyKeys from '../../HOCs/WithTaskPropertyKeys/WithTaskPropertyKeys'
import WithBoundedTasks from '../../HOCs/WithBoundedTasks/WithBoundedTasks'
import WithFilteredClusteredTasks from '../../HOCs/WithFilteredClusteredTasks/WithFilteredClusteredTasks'
import AsMappableTask from '../../../interactions/Task/AsMappableTask'
import WithWebSocketSubscriptions from '../../HOCs/WithWebSocketSubscriptions/WithWebSocketSubscriptions'
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
  minWidth: 8,
  defaultWidth: 8,
  minHeight: 10,
  defaultHeight: 11,
};

const ClusterMap = WithChallengeTaskClusters(
  WithTaskClusterMarkers(TaskClusterMap('taskBundling')),
  true,
  true,
  false,
  false
);

export default class ReviewNearbyTasksWidget extends Component {
  constructor(props) {
    super(props);

    // Define the initial state
    this.state = {
      currentSelectedTasks: [],
    };
  }
  /**
   * Initialize the cluster filters to include tasks from the current challenge
   * and initially within bounds of "nearby" tasks as a starting point for the
   * widget map
   */
  initializeClusterFilters(prevProps = {}) {
    if (
      (this.props.nearbyTasks?.tasks?.length ?? 0) > 0 &&
      !_isEqual(this.props.nearbyTasks, prevProps.nearbyTasks)
    ) {
      this.setBoundsToNearbyTask();
    }
  }

  initializeWebsocketSubscription(prevProps = {}) {
    const challengeId = this.props.task?.parent?.id;
    if (
      _isFinite(challengeId) &&
      challengeId !== (prevProps.task?.parent?.id)
    ) {
      this.props.subscribeToChallengeTaskMessages(challengeId);
    }
  }

  updateBounds = (challengeId, bounds, zoom) => {
    this.props.updateTaskFilterBounds(bounds, zoom);
  };

  setBoundsToNearbyTask = () => {
    const taskList = this.props.nearbyTasks?.tasks;
    const mappableTask = AsMappableTask(this.props.task);
    mappableTask.point = mappableTask.calculateCenterPoint();
    
    if (taskList) {
      taskList?.push(mappableTask)
    }
    
    if (!taskList || taskList.length === 0) {
      return
    }

    const nearbyBounds = bbox(
      featureCollection(
        taskList.map((t) => point([t.point.lng, t.point.lat]))
      )
    );

    this.updateBounds(
      this.props.challengeId,
      nearbyBounds,
      this.props.mapBounds?.zoom ?? 18
    );
  };

  componentDidMount() {
    this.props.selectTasks(
      this.props.taskBundle
        ? this.props.taskBundle.tasks
        : [this.props.task]
    );

    if (!this.props.taskBundle) {
      this.initializeClusterFilters();
      this.initializeWebsocketSubscription();
    }
  }

  async componentDidUpdate(prevProps) {
    if (this.state.currentSelectedTasks.length === 0) {
      this.setState({ currentSelectedTasks: this.props.selectedTasks });
    }

    if (!this.props.taskBundle) {
      this.initializeClusterFilters(prevProps);
      this.initializeWebsocketSubscription(prevProps);
    }

    if (
      _isFinite(this.props.task?.id) &&
      _isFinite(prevProps?.task?.id) &&
      this.props.task.id !== prevProps.task.id
    ) {
      this.props.resetSelectedTasks();
      this.setBoundsToNearbyTask()
    } else if (
      this.props.taskBundle &&
      this.props.taskBundle !== prevProps.taskBundle
    ) {
      await this.props.resetSelectedTasks()
      this.props.selectTasks(this.props.taskBundle.tasks)
    }
  }  

  componentWillUnmount() {
    this.props.resetSelectedTasks()
    const challengeId = this.props.task?.parent?.id
    if (_isFinite(challengeId)) {
      this.props.unsubscribeFromChallengeTaskMessages(challengeId)
    }
  }

  render() {
    const showMarkerPopup = (markerData) => {
      return (
        <Popup key={markerData.options.taskId} offset={ [0.5, -5]}>
          <div className="marker-popup-content">
            <TaskMarkerContent
              {...this.props}
              marker={markerData}
              taskId={markerData.options.taskId}
            />
          </div>
        </Popup>
      );
    };

    const boundingBoxData = this.props.criteria.boundingBox
      ? 'criteria.boundingBox'
      : 'workspaceContext.taskMapBounds';

    const map = (
      <ClusterMap
        {...this.props}
        loadingTasks={this.props.loadingTasks}
        highlightPrimaryTask={this.props.task.id}
        showMarkerPopup={showMarkerPopup}
        taskCenter={AsMappableTask(this.props.task).calculateCenterPoint()}
        boundingBox={_get(this.props, boundingBoxData)}
        initialBounds={toLatLngBounds(_get(this.props, boundingBoxData, []))}
        showSelectMarkersInView
        selectedTasks={this.state.currentSelectedTasks}
      />
    );

    const clearFiltersControl = (
      <button className="mr-flex mr-items-center mr-text-green-lighter"
        onClick={() => {
          this.props.clearAllFilters()
        }}>
        <SvgSymbol sym="close-icon"
          viewBox='0 0 20 20'
          className="mr-fill-current mr-w-5 mr-h-5 mr-mr-1" />
        <FormattedMessage {...messages.clearFiltersLabel} />
      </button>
    )

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
            {this.props.taskBundle ? (
              <div className="mr-flex mr-justify-between mr-content-center mr-mb-2 mr-flex-1">
                <h3 className="mr-text-lg mr-text-pink-light">
                  <FormattedMessage
                    {...messages.simultaneousTasks}
                    values={{ taskCount: this.props.taskBundle.taskIds.length }}
                  />
                </h3>
              </div>
            ) : null}
          <div className="mr-h-2/5 mr-min-h-80 mr-max-h-100">
            {this.props.loading ? (
              <BusySpinner className="mr-h-full mr-flex mr-items-center" />
            ) : (
              <MapPane showLasso>{map}</MapPane>
            )}
          </div>
          <div className="mr-my-4 mr-px-4 xl:mr-justify-between xl:mr-flex mr-items-center">
            <div className='mr-flex mr-items-center'>
              <p className="mr-text-base mr-uppercase mr-text-mango mr-mr-8">
                <FormattedMessage {...messages.filterListLabel} />
              </p>
              <ul className="md:mr-space-x-6 md:mr-flex mr-items-center">
                <li>
                  <TaskStatusFilter {...this.props} />
                </li>
                <li>
                  <TaskReviewStatusFilter {...this.props} />
                </li>
                <li>
                  <TaskPriorityFilter {...this.props} />
                </li>
                <li>
                  <TaskPropertyFilter {...this.props} />
                </li>
              </ul>
            </div>
            <div className='mr-flex mr-justify-end'>
              {clearFiltersControl}
            </div>
          </div>
        </div>
      </QuickWidget>
    );
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
                'filteredClusteredTasks'
              ),
              true,
              false,
              true,
              false
            )
          ),
          'nearbyTasks',
          // 'taskClusters',
          'filteredClusteredTasks',
          {
            includeLocked: false,
          },
          false
        )
      )
    )
  ),
  descriptor
);
