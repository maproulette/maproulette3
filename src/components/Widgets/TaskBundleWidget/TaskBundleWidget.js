import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import _isEqual from 'lodash/isEqual'
import _map from 'lodash/map'
import _reverse from 'lodash/reverse'
import _uniq from 'lodash/uniq'
import bbox from '@turf/bbox'
import { point, featureCollection } from '@turf/helpers'
import { TaskStatus, messagesByStatus, TaskStatusColors }
       from '../../../services/Task/TaskStatus/TaskStatus'
import { TaskPriority, messagesByPriority }
       from '../../../services/Task/TaskPriority/TaskPriority'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import MapPane from '../../EnhancedMap/MapPane/MapPane'
import WithNearbyTasks from '../../HOCs/WithNearbyTasks/WithNearbyTasks'
import WithClusteredTasks from '../../HOCs/WithClusteredTasks/WithClusteredTasks'
import WithBoundedTasks from '../../HOCs/WithBoundedTasks/WithBoundedTasks'
import WithFilteredClusteredTasks
       from '../../HOCs/WithFilteredClusteredTasks/WithFilteredClusteredTasks'
import AsMappableTask from '../../../interactions/Task/AsMappableTask'
import ChallengeTaskMap from '../../ChallengeTaskMap/ChallengeTaskMap'
import QuickWidget from '../../QuickWidget/QuickWidget'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import BusySpinner from '../../BusySpinner/BusySpinner'
import Dropdown from '../../Dropdown/Dropdown'
import TaskAnalysisTable from '../../TaskAnalysisTable/TaskAnalysisTable'
import messages from './Messages'

const descriptor = {
  widgetKey: 'TaskBundleWidget',
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 4,
  defaultWidth: 6,
  minHeight: 12,
  defaultHeight: 14,
}

const TaskMap = ChallengeTaskMap('taskBundling')

export default class TaskBundleWidget extends Component {
  state = {
    loading: false,
  }

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
    // If the challenge id or task id changed, refetch fresh clusters for now
    // TODO: use websockets to manage ongoing updates to avoid full refetch
    const challengeId = _get(this.props.task, 'parent.id')
    if (_isFinite(challengeId) &&
        (challengeId !== _get(prevProps.task, 'parent.id') ||
         this.props.task.id !== _get(prevProps, 'task.id'))) {
      this.fetchClusters()
    }

    // If the nearby tasks loaded, update bounds
    if (_get(this.props, 'nearbyTasks.tasks.length', 0) > 0 &&
        !_isEqual(this.props.nearbyTasks, prevProps.nearbyTasks)) {
      const taskList = _get(this.props, 'nearbyTasks.tasks')
      taskList.push(AsMappableTask(this.props.task))
      this.setBoundsToNearbyTask(taskList)
    }
  }

  unbundleTasks = async () => {
    await this.fetchClusters()
    this.props.removeTaskBundle(this.props.taskBundle.bundleId, this.props.task.id)
    this.props.resetSelectedTasks()
  }

  fetchClusters = () => {
    this.setState({loading: true})
    return this.props.fetchClusteredTasks(
        this.props.task.parent.id,
        false,
        [TaskStatus.created, TaskStatus.skipped, TaskStatus.tooHard],
        15000,
        true
      ).then(() => {
        this.setState({loading: false})
      })
  }

  updateBounds = (challengeId, bounds, zoom) => {
    this.props.updateLocalMapBounds(challengeId, bounds, zoom)
    this.props.augmentClusteredTasks(challengeId, false, {boundingBox: bounds})
  }

  setBoundsToNearbyTask = (taskList) => {
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
    this.setState({loading: false})
  }

  componentDidMount() {
    if (!this.props.taskBundle) {
      this.initializeClusterFilters()
    }
  }

  componentDidUpdate(prevProps) {
    if (!this.props.taskBundle) {
      this.initializeClusterFilters(prevProps)
    }

    if (_isFinite(_get(this.props, 'task.id')) &&
        _isFinite(_get(prevProps, 'task.id')) &&
        this.props.task.id !== prevProps.task.id) {
      this.props.resetSelectedTasks()
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
          loading={this.state.loading}
        />
      </QuickWidget>
    )
  }
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
        totalTaskCount={props.taskBundle.taskIds.length}
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

  const statusColors =
    Object.assign({}, TaskStatusColors, {[TaskStatus.created]: '#2281C2'})

  const filterOptions = {
    includeStatuses: props.includeTaskStatuses,
    includeReviewStatuses: props.includeTaskReviewStatuses,
    withinBounds: props.mapBounds,
  }

  const bundleButton = selectedTasks.size > 1 ? (
    <button
      className="mr-button mr-button--green mr-button--small"
      onClick={props.bundleTasks}
    >
      <FormattedMessage {...messages.bundleTasksLabel} />
    </button>
  ) : null

  return (
    <div className="mr-bg-white mr-pb-2 mr-h-full mr-rounded">
      <div className="mr-h-2/5 mr-max-h-100">
        {props.loading ?
          <BusySpinner lightMode className="mr-h-full mr-flex mr-items-center" /> :
          <MapPane>
            <TaskMap
              {...props}
              selectedTasks={selectedTasks}
              taskInfo={props.taskInfo}
              mapBounds={props.mapBounds}
              setMapBounds={props.updateBounds}
              lastBounds={props.mapBounds}
              lastZoom={props.mapZoom}
              statusColors={statusColors}
              filterOptions={filterOptions}
              taskMarkerContent={TaskMarkerContent}
              monochromaticClusters
              highlightPrimaryTask
              initiallyUnclustered
              className=''
            />
          </MapPane>
        }
      </div>
      <div className="mr-my-4 mr-px-4 xl:mr-flex mr-justify-between">
        <ul className="mr-mb-4 xl:mr-mb-0 md:mr-flex">
          <li className="md:mr-mr-8">
            <FilterDropdown
              title={<FormattedMessage {...messages.filterByStatusLabel} />}
              filters={
                _map([TaskStatus.created, TaskStatus.skipped, TaskStatus.tooHard], status => (
                  <li key={status}>
                    <label className="mr-flex mr-items-center">
                      <input className="mr-mr-2"
                        type="checkbox"
                        checked={props.includeTaskStatuses[status]}
                        onChange={() => props.toggleIncludedTaskStatus(status)} />
                      <FormattedMessage {...messagesByStatus[status]} />
                    </label>
                  </li>
                ))
              }
            />
          </li>
          <li className="md:mr-mr-8">
            <FilterDropdown
              title={<FormattedMessage {...messages.filterByPriorityLabel} />}
              filters={
                _reverse(_map(TaskPriority, priority => (
                  <li key={priority}>
                    <label className="mr-flex mr-items-center">
                      <input className="mr-mr-2"
                        type="checkbox"
                        checked={props.includeTaskPriorities[priority]}
                        onChange={() => props.toggleIncludedTaskPriority(priority)} />
                      <FormattedMessage {...messagesByPriority[priority]} />
                    </label>
                  </li>
                )))
              }
            />
          </li>
        </ul>
      </div>
      <div className="mr-px-4 mr-h-half mr-overflow-y-auto">
        <TaskAnalysisTable
          {...props}
          selectedTasks={selectedTasks}
          filterOptions={filterOptions}
          totalTaskCount={_get(props, 'clusteredTasks.tasks.length')}
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

const FilterDropdown = props => {
  return (
    <Dropdown
      className="mr-dropdown--right"
      dropdownButton={dropdown => (
        <button
          className="mr-flex mr-items-center mr-text-blue-light"
          onClick={dropdown.toggleDropdownVisible}
        >
          <span className="mr-text-base mr-uppercase mr-mr-1">
            {props.title}
          </span>
          <SvgSymbol
            sym="icon-cheveron-down"
            viewBox="0 0 20 20"
            className="mr-fill-current mr-w-5 mr-h-5"
          />
        </button>
      )}
      dropdownContent={() =>
        <ul className="mr-list-dropdown">
          {props.filters}
        </ul>
      }
    />
  )
}

const TaskMarkerContent = props => {
  return (
    <div className="mr-flex mr-justify-center">
      <div className="mr-flex-col mr-w-full">
        <div className="mr-flex">
          <div className="mr-w-1/2 mr-mr-2 mr-text-right"><FormattedMessage {...messages.nameLabel} /></div>
          <div className="mr-w-1/2 mr-text-left">{props.marker.options.name}</div>
        </div>
        <div className="mr-flex">
          <div className="mr-w-1/2 mr-mr-2 mr-text-right"><FormattedMessage {...messages.taskIdLabel} /></div>
          <div className="mr-w-1/2 mr-text-left">{props.marker.options.taskId}</div>
        </div>
        <div className="mr-flex">
          <div className="mr-w-1/2 mr-mr-2 mr-text-right"><FormattedMessage {...messages.statusLabel} /></div>
          <div className="mr-w-1/2 mr-text-left">
            {props.intl.formatMessage(messagesByStatus[props.marker.options.status])}
          </div>
        </div>
        <div className="mr-flex">
          <div className="mr-w-1/2 mr-mr-2 mr-text-right"><FormattedMessage {...messages.priorityLabel} /></div>
          <div className="mr-w-1/2 mr-text-left">
            {props.intl.formatMessage(messagesByPriority[props.marker.options.priority])}
          </div>
        </div>
        <div className="mr-flex mr-justify-center mr-mt-2">
          <span>
            <label>
              {props.marker.options.taskId !== props.task.id ?
               <input
                 type="checkbox"
                 className="mr-mr-1"
                 checked={props.selectedTasks.has(props.marker.options.taskId)}
                 onChange={() => props.toggleTaskSelectionById(props.marker.options.taskId)}
               /> :
               <span className="mr-mr-1">✓</span>
              }
              <FormattedMessage {...messages.selectedLabel} />
              {props.marker.options.taskId === props.task.id &&
                <span className="mr-ml-1"><FormattedMessage {...messages.currentTask} /></span>
              }
            </label>
           </span>
        </div>
      </div>
    </div>
  )
}

registerWidgetType(
  WithNearbyTasks(
    WithClusteredTasks(
      WithFilteredClusteredTasks(
        WithBoundedTasks(
          TaskBundleWidget,
          'filteredClusteredTasks',
          'taskInfo'
        ),
        'clusteredTasks',
        'filteredClusteredTasks'
      )
    )
  ), descriptor
)
