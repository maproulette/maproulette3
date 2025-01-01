import { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { Popup } from 'react-leaflet'
import { ChallengeStatus }
       from '../../../../services/Challenge/ChallengeStatus/ChallengeStatus'
import { TaskStatus,
         messagesByStatus }
       from '../../../../services/Task/TaskStatus/TaskStatus'
import { messagesByPriority, TaskPriority }
       from '../../../../services/Task/TaskPriority/TaskPriority'
import { toLatLngBounds } from '../../../../services/MapBounds/MapBounds'
import AsManager from '../../../../interactions/User/AsManager'
import WithBoundedTasks
       from '../../../HOCs/WithBoundedTasks/WithBoundedTasks'
import WithFilterCriteria
      from '../../../HOCs/WithFilterCriteria/WithFilterCriteria'
import WithTaskPropertyKeys
      from '../../../HOCs/WithTaskPropertyKeys/WithTaskPropertyKeys'
import WithChallengeTaskClusters
      from '../../../HOCs/WithChallengeTaskClusters/WithChallengeTaskClusters'
import WithTaskClusterMarkers
      from '../../../HOCs/WithTaskClusterMarkers/WithTaskClusterMarkers'
import WithLoadedTask
      from '../../../HOCs/WithLoadedTask/WithLoadedTask'
import TaskClusterMap from '../../../TaskClusterMap/TaskClusterMap'
import MapPane from '../../../EnhancedMap/MapPane/MapPane'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import IntervalRender from '../../../IntervalRender/IntervalRender'
import TaskAnalysisTable from '../../../TaskAnalysisTable/TaskAnalysisTable'
import TaskPriorityFilter from '../../../TaskFilters/TaskPriorityFilter'
import TaskStatusFilter from '../../../TaskFilters/TaskStatusFilter'
import TaskReviewStatusFilter from '../../../TaskFilters/TaskReviewStatusFilter'
import TaskPropertyFilter from '../../../TaskFilters/TaskPropertyFilter'
import TaskBuildProgress from './TaskBuildProgress'
import GeographicIndexingNotice from './GeographicIndexingNotice'
import messages from './Messages'

const ClusterMap = WithChallengeTaskClusters(
                     WithTaskClusterMarkers(TaskClusterMap('challengeOwner')))

/**
 * ViewChallengeTasks displays challenge tasks as both a map and a table,
 * along with filtering controls for showing subsets of tasks.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ViewChallengeTasks extends Component {
  state = {
    bulkUpdating: false,
    boundsReset: false,
    showPriorityBounds: false,
  }

  changeStatus = (selectedTasks, newStatus = TaskStatus.created) => {
    if (!selectedTasks.allSelected && selectedTasks.selected.size === 0) {
      return // Nothing to do
    }

    this.setState({bulkUpdating: true})
    // If all tasks are selected (so beyond what is being viewed on current page)
    if (selectedTasks.allSelected) {
      this.props.applyBulkTaskStatusChange(
        parseInt(newStatus),
        this.props.challenge.id,
        this.props.criteria,
        [...selectedTasks.deselected.keys()]
      ).then(() => {
        this.props.refreshChallenge()
        this.props.refreshTasks()
        this.setState({bulkUpdating: false})
      })
    }
    else { // Otherwise only apply to selected tasks
      this.props.applyBulkTaskChanges([...this.props.selectedTasks.selected.values()], {
        status: parseInt(newStatus),
        mappedOn: null,
        reviewStatus: null,
        reviewRequestedBy: null,
        reviewedBy: null,
        reviewedAt: null
      }).then(() => {
        this.props.refreshChallenge()
        this.props.refreshTasks()
        this.setState({bulkUpdating: false})
      })
    }
  }

  removeReviewRequests = selectedTasks => {
    if (!selectedTasks.allSelected && selectedTasks.selected.size === 0) {
      return // Nothing to do
    }

    this.setState({bulkUpdating: true})
    this.props.removeReviewRequest(
      this.props.challenge.id,
      selectedTasks.allSelected ? null : [...selectedTasks.selected.keys()],
      this.props.criteria,
      selectedTasks.allSelected ? [...selectedTasks.deselected.keys()] : null,
      false
    ).then(() => {
      this.props.refreshChallenge()
      this.props.refreshTasks()
      this.setState({bulkUpdating: false})
    })
  }

  removeMetaReviewRequests = selectedTasks => {
    if (!selectedTasks.allSelected && selectedTasks.selected.size === 0) {
      return // Nothing to do
    }

    this.setState({bulkUpdating: true})
    this.props.removeReviewRequest(
      this.props.challenge.id,
      selectedTasks.allSelected ? null : [...selectedTasks.selected.keys()],
      this.props.criteria,
      selectedTasks.allSelected ? [...selectedTasks.deselected.keys()] : null,
      true
    ).then(() => {
      this.props.refreshChallenge()
      this.props.refreshTasks()
      this.setState({bulkUpdating: false})
    })
  }

  resetMapBounds = () => {
    this.setState({boundsReset: true})
    this.props.clearMapBounds(this.props.searchGroup)
  }

  mapBoundsUpdated = (challengeId, bounds, zoom) => {
    this.props.setChallengeOwnerMapBounds(challengeId, bounds, zoom)
    this.props.updateTaskFilterBounds(bounds, zoom)
    this.setState({boundsReset: false})
  }

  showMarkerPopup = markerData => {
    const TaskData = WithLoadedTask(TaskMarkerContent)
    return (
      <Popup offset={[0.5, -5]}>
        <div className="marker-popup-content">
          <TaskData marker={markerData} taskId={markerData.options.taskId} {...this.props} />
        </div>
      </Popup>
    )
  }

  // Finds all the 'bounds' type rules on the challenge to show as
  // bounding box overlays on the map.
  findPriorityBounds = challenge => {
    const parseBoundsRule = (rule, priorityLevel, priorityBounds) => {
      if (rule.rules) {
        return rule.rules.map((r) => parseBoundsRule(r, priorityLevel, priorityBounds))
      }
      if (rule.type === "bounds") {
        return priorityBounds.push(
          {boundingBox: rule.value.replace("location.", ""), priorityLevel})
      }
    }

    let priorityBounds = []
    parseBoundsRule(challenge.highPriorityRule, TaskPriority.high, priorityBounds)
    parseBoundsRule(challenge.mediumPriorityRule, TaskPriority.medium, priorityBounds)
    parseBoundsRule(challenge.lowPriorityRule, TaskPriority.low, priorityBounds)

    return priorityBounds
  }

  render() {
    if (this.props.challenge.status === ChallengeStatus.building) {
      return <IntervalRender><TaskBuildProgress {...this.props} /></IntervalRender>
    }

    if (this.props.challenge.status === ChallengeStatus.failed) {
      return (
        <div>
          <h3 className="mr-text-red">
            <FormattedMessage {...messages.tasksFailed} />
          </h3>

          <pre className="mr-text-grey-light">
            {this.props.challenge.statusMessage}
          </pre>
        </div>
      )
    }

    if ((this.props.challenge?.actions?.total ?? 0) === 0) {
      return (
        <div className="mr-flex mr-justify-center mr-text-grey-lighter">
          <h3>
            <FormattedMessage {...messages.tasksNone} />
          </h3>
        </div>
      )
    }

    if (this.state.bulkUpdating) {
      return (
        <div className="pane-loading">
          <BusySpinner />
        </div>
      )
    }

    const clearFiltersControl = (
      <button className="mr-flex mr-items-center mr-text-green-lighter"
        onClick={() => {
          this.props.clearAllFilters()
          this.resetMapBounds()
        }}>
        <SvgSymbol sym="close-icon"
          viewBox='0 0 20 20'
          className="mr-fill-current mr-w-5 mr-h-5 mr-mr-1" />
          <span>
            <FormattedMessage {...messages.clearFiltersLabel} />
          </span>
      </button>
    )

    const map =
        <ClusterMap
          showLasso
          updateBounds={this.mapBoundsUpdated}
          onBulkTaskSelection={this.props.selectTasks}
          onBulkTaskDeselection={this.props.deselectTasks}
          loadingTasks={this.props.loadingTasks}
          showMarkerPopup={this.showMarkerPopup}
          togglePriorityBounds={() => this.setState({showPriorityBounds: !this.state.showPriorityBounds})}
          showPriorityBounds={this.state.showPriorityBounds}
          priorityBounds={this.findPriorityBounds(this.props.challenge)}
          initialBounds={this.state.boundsReset ?
            toLatLngBounds(this.props.criteria?.boundingBox) : null}
          {...this.props}
        />

    this.boundsReset = false

    return (
      <div className='admin__manage-tasks'>
        <GeographicIndexingNotice challenge={this.props.challenge} />

        <div className="mr-h-100">
          <MapPane>
            {map}
          </MapPane>
        </div>

        <div className="mr-my-4 mr-space-y-3">
          <div className='xl:mr-flex xl:mr-justify-between xl:mr-flex-1 mr-px-2 xl:mr-px-4'>
            <div className='mr-flex'>
              <p className="mr-text-center mr-text-base mr-uppercase mr-text-mango mr-mr-8">
                <FormattedMessage {...messages.filterListLabel} />
              </p>
              <ul className="mr-mb-4 xl:mr-mb-0 mr-flex mr-items-center mr-space-x-4 xl:mr-space-x-8">
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

          <TaskAnalysisTable
            taskData={this.props.taskInfo?.tasks}
            changeStatus={this.changeStatus}
            removeReviewRequests={this.removeReviewRequests}
            removeMetaReviewRequests={this.removeMetaReviewRequests}
            totalTaskCount={this.props.taskInfo?.totalCount}
            totalTasksInChallenge={ calculateTasksInChallenge(this.props) }
            loading={this.props.loadingChallenge}
            {...this.props}
          />
      </div>
    );
  }
}

const calculateTasksInChallenge = props => {
  const actions = props.challenge?.actions
  if (!actions) {
    return props.taskInfo?.totalCount;
  }

  return actions.total
}

const TaskMarkerContent = props => {
  const manager = AsManager(props.user)
  const taskBaseRoute =
    `/admin/project/${props.challenge.parent.id}` +
    `/challenge/${props.challenge?.id}/task/${props.marker.options.taskId}`

  return (
    <Fragment>
      <div className="mr-text-center mr-mt-5">
        {
          props.intl.formatMessage(messages.nameLabel)
        } {
          (props.marker.options.name || (props.task?.name) || (props.task?.title))
        }
      </div>
      <div className="mr-text-center">
        {
          props.intl.formatMessage(messages.statusLabel)
        } {
          props.intl.formatMessage(messagesByStatus[props.marker.options.taskStatus])
        }
      </div>
      <div className="mr-text-center">
        {
          props.intl.formatMessage(messages.priorityLabel)
        }: {
          props.intl.formatMessage(messagesByPriority[props.marker.options.taskPriority])
        }
      </div>

      {props.loading &&
        <div>
          <BusySpinner />
        </div>
      }

      <div className="marker-popup-content__links">
        <div>
          <a onClick={() => props.history.push({
            pathname: `${taskBaseRoute}/inspect`,
            state: props.criteria
          })}>
            {props.intl.formatMessage(messages.inspectTaskLabel)}
          </a>
        </div>

        {manager.canWriteProject(props.challenge.parent) &&
          <div>
            <a onClick={() => props.history.push({
              pathname: `${taskBaseRoute}/edit`,
              state: props.criteria
            })}>
              {props.intl.formatMessage(messages.editTaskLabel)}
            </a>
          </div>
        }
      </div>
    </Fragment>
  );
}

ViewChallengeTasks.propTypes = {
  /** The tasks to display */
  filteredClusteredTasks: PropTypes.shape({
    challengeId: PropTypes.number,
    loading: PropTypes.bool,
    tasks: PropTypes.array,
  }),
  /** Challenge the tasks belong to */
  challenge: PropTypes.object,
  /** Set to true if challenge data is loading */
  loadingChallenge: PropTypes.bool,
  /** Invoked to refresh the challenge and task data */
  refreshChallenge: PropTypes.func.isRequired,
  /** Object enumerating whether each task review status filter is on or off. */
  includeTaskReviewStatuses: PropTypes.object,
  /** Object enumerating whether each meta review status filter is on or off. */
  includeMetaReviewStatuses: PropTypes.object,
  /** Invoked to toggle filtering of a task status on or off */
  toggleIncludedTaskStatus: PropTypes.func.isRequired,
  /** Invoked to toggle filtering of a task review status on or off */
  toggleIncludedTaskReviewStatus: PropTypes.func.isRequired,
  /** Invoked to toggle filtering of a meta review status on or off */
  toggleIncludedMetaReviewStatus: PropTypes.func.isRequired,
  /** Latest bounds of the challenge-owner map */
  mapBounds: PropTypes.object,
  /** Latest zoom of the challenge-owner map */
  mapZoom: PropTypes.number,
  /** Invoked when the challenge owner pans or zooms the challenge map */
  setChallengeOwnerMapBounds: PropTypes.func.isRequired,
  /** Clears any applied filters */
  clearAllFilters: PropTypes.func.isRequired,
}

ViewChallengeTasks.defaultProps = {
  loadingChallenge: false,
}

export default
WithBoundedTasks(
  WithTaskPropertyKeys(
    WithFilterCriteria(ViewChallengeTasks, false)
  ),
  'filteredClusteredTasks',
  'taskInfo'
)
