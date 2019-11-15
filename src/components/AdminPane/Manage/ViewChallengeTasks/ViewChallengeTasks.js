import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { Popup } from 'react-leaflet'
import _get from 'lodash/get'
import { ChallengeStatus }
       from '../../../../services/Challenge/ChallengeStatus/ChallengeStatus'
import { TaskStatus,
         messagesByStatus }
       from '../../../../services/Task/TaskStatus/TaskStatus'
import { messagesByPriority }
       from '../../../../services/Task/TaskPriority/TaskPriority'
import { toLatLngBounds } from '../../../../services/MapBounds/MapBounds'
import AsManager from '../../../../interactions/User/AsManager'
import WithBoundedTasks
       from '../../../HOCs/WithBoundedTasks/WithBoundedTasks'
import WithFilterCriteria
      from '../../../HOCs/WithFilterCriteria/WithFilterCriteria'
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
  }

  takeTaskSelectionAction = action => {
    if (action.statusAction) {
      this.props.selectTasksWithStatus(action.status)
    }
    else if (action.priorityAction) {
      this.props.selectTasksWithPriority(action.priority)
    }
  }

  changeStatus = (newStatus = TaskStatus.created) => {
    const tasks = [...this.props.selectedTasks.values()]
    if (tasks.length === 0) {
      return
    }

    this.setState({bulkUpdating: true})
    this.props.applyBulkTaskChanges(
      tasks, {status: parseInt(newStatus),
              mappedOn: null,
              reviewStatus: null,
              reviewRequestedBy: null,
              reviewedBy: null,
              reviewedAt: null}

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
      <Popup>
        <div className="marker-popup-content">
          <TaskData marker={markerData} taskId={markerData.options.taskId} {...this.props} />
        </div>
      </Popup>
    )
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

    if (_get(this.props, 'challenge.actions.total', 0) === 0) {
      return (
        <div className="challenge-tasks-status title has-centered-children">
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
      <button className="mr-flex mr-items-center mr-text-blue-light"
        onClick={() => {
          this.props.clearAllFilters()
          this.resetMapBounds()
        }}>
        <SvgSymbol sym="close-icon"
          viewBox='0 0 20 20'
          className="mr-fill-current mr-w-5 mr-h-5 mr-mr-1" />
        <FormattedMessage {...messages.clearFiltersLabel} />
      </button>
    )

    const map =
        <ClusterMap
          updateBounds={this.mapBoundsUpdated}
          loadingTasks={this.props.loadingTasks}
          showMarkerPopup={this.showMarkerPopup}
          allowClusterToggle
          initialBounds={this.state.boundsReset ?
            toLatLngBounds(_get(this.props, 'criteria.boundingBox')) : null}
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

        <div className="mr-my-4 xl:mr-flex mr-justify-between">
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

            {calculateTasksInChallenge(this.props) !== _get(this.props, 'taskInfo.totalCount', 0) ? clearFiltersControl : null}
          </div>

          <TaskAnalysisTable
            taskData={_get(this.props, 'taskInfo.tasks')}
            changeStatus={this.changeStatus}
            totalTaskCount={_get(this.props, 'taskInfo.totalCount')}
            totalTasksInChallenge={ calculateTasksInChallenge(this.props) }
            loading={this.props.loadingChallenge}
            {...this.props}
          />
      </div>
    )
  }
}

const calculateTasksInChallenge = props => {
  const actions = _get(props, 'challenge.actions')
  if (!actions) {
    return _get(props, 'taskInfo.totalCount')
  }

  return actions.total
}

const TaskMarkerContent = props => {
  const manager = AsManager(props.user)
  const taskBaseRoute =
    `/admin/project/${props.challenge.parent.id}` +
    `/challenge/${_get(props.challenge, 'id')}/task/${props.marker.options.taskId}`

  return (
    <React.Fragment>
      <div className="mr-text-center mr-mt-5">
        {
          props.intl.formatMessage(messages.nameLabel)
        } {
          (props.marker.options.name || _get(props.task, 'name') || _get(props.task, 'title'))
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
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a onClick={() => props.history.push(`${taskBaseRoute}/inspect`)}>
            {props.intl.formatMessage(messages.inspectTaskLabel)}
          </a>
        </div>

        {manager.canWriteProject(props.challenge.parent) &&
          <div>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a onClick={() => props.history.push(`${taskBaseRoute}/edit`)}>
              {props.intl.formatMessage(messages.editTaskLabel)}
            </a>
          </div>
        }
      </div>
    </React.Fragment>
  )
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
  /** Object enumerating whether each task status filter is on or off. */
  includeTaskStatuses: PropTypes.object,
  /** Object enumerating whether each task review status filter is on or off. */
  includeTaskReviewStatuses: PropTypes.object,
  /** Invoked to toggle filtering of a task status on or off */
  toggleIncludedTaskStatus: PropTypes.func.isRequired,
  /** Invoked to toggle filtering of a task review status on or off */
  toggleIncludedTaskReviewStatus: PropTypes.func.isRequired,
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

export default WithBoundedTasks(
                  WithFilterCriteria(ViewChallengeTasks),
                  'filteredClusteredTasks',
                  'taskInfo')
