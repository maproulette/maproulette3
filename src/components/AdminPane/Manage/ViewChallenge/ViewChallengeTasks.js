import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _reverse from 'lodash/reverse'
import { ChallengeStatus }
       from '../../../../services/Challenge/ChallengeStatus/ChallengeStatus'
import { TaskStatus,
         keysByStatus,
         messagesByStatus,
         statusLabels }
       from '../../../../services/Task/TaskStatus/TaskStatus'
import { TaskPriority,
         keysByPriority,
         messagesByPriority,
         taskPriorityLabels }
       from '../../../../services/Task/TaskPriority/TaskPriority'
import { MAPBOX_LIGHT,
         layerSourceWithId }
       from '../../../../services/VisibleLayer/LayerSources'
import AsManager from '../../../../interactions/User/AsManager'
import WithBoundedTasks
       from '../../HOCs/WithBoundedTasks/WithBoundedTasks'
import MapPane from '../../../EnhancedMap/MapPane/MapPane'
import DropdownButton from '../../../Bulma/DropdownButton'
import TriStateCheckbox from '../../../Bulma/TriStateCheckbox'
import ConfirmAction from '../../../ConfirmAction/ConfirmAction'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import WithDeactivateOnOutsideClick
       from '../../../HOCs/WithDeactivateOnOutsideClick/WithDeactivateOnOutsideClick'
import ChallengeTaskMap from '../ChallengeTaskMap/ChallengeTaskMap'
import TaskAnalysisTable from '../TaskAnalysisTable/TaskAnalysisTable'
import TaskBuildProgress from './TaskBuildProgress'
import GeographicIndexingNotice from './GeographicIndexingNotice'
import messages from './Messages'

const DeactivatableDropdownButton = WithDeactivateOnOutsideClick(DropdownButton)

/**
 * ViewChallengeTasks displays challenge tasks as both a map and a table,
 * along with filtering controls for showing subsets of tasks.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ViewChallengeTasks extends Component {
  state = {
    bulkUpdating: false,
  }

  componentDidUpdate(prevProps) {
    // When bulk updating, wait until the tasks have been reloaded before turning
    // off the bulkUpdating flag and refreshing any selected tasks.
    if (this.state.bulkUpdating && prevProps.loadingTasks && !this.props.loadingTasks) {
      this.props.refreshSelectedTasks()
      this.setState({bulkUpdating: false})
    }
  }

  takeTaskSelectionAction = action => {
    if (action.statusAction) {
      this.props.selectTasksWithStatus(action.status)
    }
    else if (action.priorityAction) {
      this.props.selectTasksWithPriority(action.priority)
    }
  }

  markAsCreated = () => {
    const tasks = [...this.props.selectedTasks.values()]
    if (tasks.length === 0) {
      return
    }

    this.setState({bulkUpdating: true}) // will be reset by componentDidUpdate
    this.props.applyBulkTaskChanges(
      tasks, {status: TaskStatus.created}
    ).then(() => this.props.refreshChallenge())
  }

  render() {
    if (this.props.challenge.status === ChallengeStatus.building) {
      return <TaskBuildProgress {...this.props} />
    }

    if (this.props.challenge.status === ChallengeStatus.failed) {
      return (
        <div className="challenge-tasks-status title has-centered-children">
          <h3 className="is-danger">
            <FormattedMessage {...messages.tasksFailed} />
          </h3>

          <pre className="challenge-tasks-status__status-message">
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

    const manager = AsManager(this.props.user)

    // Use CSS Modules once supported by create-react-app
    const statusColors = {
      [TaskStatus.created]: '#2281C2',       // $status-created-color
      [TaskStatus.fixed]: '#61CDBB',         // $status-fixed-color
      [TaskStatus.falsePositive]: '#F1E15B', // $status-falsePositive-color
      [TaskStatus.skipped]: '#E8A838',       // $status-skipped-color
      [TaskStatus.deleted]: '#9D6ADC',       // $status-deleted-color
      [TaskStatus.alreadyFixed]: '#97E3D5',  // $status-alreadyFixed-color
      [TaskStatus.tooHard]: '#F47560',       // $status-tooHard-color
    }

    const statusFilters = _map(TaskStatus, status => (
      <div key={status} className="filter-option status-filter is-narrow">
        <div className={classNames("field", keysByStatus[status])}
             onClick={() => this.props.toggleIncludedTaskStatus(status)}>
          <input className="is-checkradio is-circle has-background-color is-success"
                 type="checkbox"
                 checked={this.props.includeTaskStatuses[status]}
                 onChange={() => null} />
          <label>
            <FormattedMessage {...messagesByStatus[status]} />
          </label>
        </div>
      </div>
    ))

    const priorityFilters = _reverse(_map(TaskPriority, priority => (
      <div key={priority} className="filter-option priority-filter is-narrow">
        <div className={classNames("field", keysByPriority[priority])}
             onClick={() => this.props.toggleIncludedTaskPriority(priority)}>
          <input className="is-checkradio is-circle has-background-color is-success"
                 type="checkbox"
                 checked={this.props.includeTaskPriorities[priority]}
                 onChange={() => null} />
          <label>
            <FormattedMessage {...messagesByPriority[priority]} />
          </label>
        </div>
      </div>
    )))

    const filterOptions = {
      includeStatuses: this.props.includeTaskStatuses,
      withinBounds: this.props.mapBounds,
    }


    const localizedStatusLabels = statusLabels(this.props.intl)
    const localizedPriorityLabels = taskPriorityLabels(this.props.intl)

    const taskSelectionActions =
      _map(TaskStatus, status => ({
        key: `status-${status}`,
        text: localizedStatusLabels[keysByStatus[status]],
        status,
        statusAction: true,
      })
    ).concat(
      _map(TaskPriority, priority => ({
        key: `priority-${priority}`,
        text: `${localizedPriorityLabels[keysByPriority[priority]]} ${this.props.intl.formatMessage(messages.priorityLabel)}`,
        priority,
        priorityAction: true,
      }))
    )

    return (
      <div className='admin__manage-tasks'>
        <GeographicIndexingNotice challenge={this.props.challenge} />

        <MapPane>
          <ChallengeTaskMap taskInfo={this.props.taskInfo}
                            setChallengeOwnerMapBounds={this.props.setChallengeOwnerMapBounds}
                            lastBounds={this.props.mapBounds}
                            lastZoom={this.props.mapZoom}
                            statusColors={statusColors}
                            filterOptions={filterOptions}
                            monochromaticClusters
                            defaultLayer={layerSourceWithId(MAPBOX_LIGHT)}
                            {...this.props} />
        </MapPane>

        <div className="filter-set">
          {statusFilters}
        </div>

        <div className="filter-set centered">
          {priorityFilters}
        </div>

        {_get(this.props, 'taskInfo.tasks.length', 0) > 0 &&
         <div className="admin__manage-tasks__task-controls">
           <div className="admin__manage-tasks__task-controls__selection"
                title={this.props.intl.formatMessage(messages.bulkSelectionTooltip)}>
             <label className="checkbox">
               <TriStateCheckbox
                 checked={this.props.allTasksAreSelected()}
                 indeterminate={this.props.someTasksAreSelected()}
                 onClick={() => this.props.toggleAllTasksSelection()}
               />
             </label>
             <DeactivatableDropdownButton options={taskSelectionActions}
                                            onSelect={this.takeTaskSelectionAction}>
               <div className="basic-dropdown-indicator" />
             </DeactivatableDropdownButton>
           </div>
           <div>
             {manager.canWriteProject(this.props.challenge.parent) &&
              <ConfirmAction>
                <button className="button is-rounded is-outlined is-primary"
                        onClick={this.markAsCreated}>
                  <FormattedMessage {...messages.markCreatedLabel} />
                </button>
              </ConfirmAction>
             }
             <a target="_blank"
                 href={`/api/v2/challenge/${_get(this.props, 'challenge.id')}/tasks/extract`}
                 className="button is-outlined is-primary has-svg-icon csv-export"
             >
               <SvgSymbol sym='download-icon' viewBox='0 0 20 20' />
               <FormattedMessage {...messages.exportCSVLabel} />
             </a>
           </div>
         </div>
        }

        <TaskAnalysisTable filterOptions={filterOptions}
                           totalTaskCount={_get(this.props, 'clusteredTasks.tasks.length')}
                           {...this.props} />
      </div>
    )
  }
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
  /** Invoked to toggle filtering of a task status on or off */
  toggleIncludedTaskStatus: PropTypes.func.isRequired,
  /** Latest bounds of the challenge-owner map */
  mapBounds: PropTypes.object,
  /** Latest zoom of the challenge-owner map */
  mapZoom: PropTypes.number,
  /** Invoked when the challenge owner pans or zooms the challenge map */
  setChallengeOwnerMapBounds: PropTypes.func.isRequired,
}

ViewChallengeTasks.defaultProps = {
  loadingChallenge: false,
}

export default WithBoundedTasks(ViewChallengeTasks,
                                'filteredClusteredTasks',
                                'taskInfo')
