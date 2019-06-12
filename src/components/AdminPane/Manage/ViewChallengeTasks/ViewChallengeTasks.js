import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _reverse from 'lodash/reverse'
import _noop from 'lodash/noop'
import { ChallengeStatus }
       from '../../../../services/Challenge/ChallengeStatus/ChallengeStatus'
import { TaskStatus,
         keysByStatus,
         messagesByStatus,
         statusLabels }
       from '../../../../services/Task/TaskStatus/TaskStatus'
import { TaskReviewStatusWithUnset,
        keysByReviewStatus,
        messagesByReviewStatus,
        reviewStatusLabels }
      from '../../../../services/Task/TaskReview/TaskReviewStatus'
import { TaskPriority,
         keysByPriority,
         messagesByPriority,
         taskPriorityLabels }
       from '../../../../services/Task/TaskPriority/TaskPriority'
import AsManager from '../../../../interactions/User/AsManager'
import WithBoundedTasks
       from '../../HOCs/WithBoundedTasks/WithBoundedTasks'
import MapPane from '../../../EnhancedMap/MapPane/MapPane'
import DropdownButton from '../../../Bulma/DropdownButton'
import TriStateCheckbox from '../../../Bulma/TriStateCheckbox'
import ConfirmAction from '../../../ConfirmAction/ConfirmAction'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import IntervalRender from '../../../IntervalRender/IntervalRender'
import WithDeactivateOnOutsideClick
       from '../../../HOCs/WithDeactivateOnOutsideClick/WithDeactivateOnOutsideClick'
import ChallengeTaskMap from '../ChallengeTaskMap/ChallengeTaskMap'
import TaskAnalysisTable from '../TaskAnalysisTable/TaskAnalysisTable'
import TaskBuildProgress from './TaskBuildProgress'
import GeographicIndexingNotice from './GeographicIndexingNotice'
import messages from './Messages'
import { geoJson } from 'leaflet'
import Dropdown from '../../../Dropdown/Dropdown'

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
    initialBounds: null,
  }

  componentDidUpdate(prevProps) {
    if (!this.state.initialBounds) {
      const bounding = _get(this.props, 'challenge.bounding.bounding') ||
                       _get(this.props, 'challenge.bounding')

      if (bounding) {
        this.setState({initialBounds: {mapBounds: geoJson(bounding).getBounds(), mapZoom: this.props.mapZoom}})
      }
      else {
        this.setState({initialBounds: {mapBounds: this.props.mapBounds, mapZoom: this.props.mapZoom}})
      }
    }
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
      tasks, {status: TaskStatus.created,
              mappedOn: null,
              reviewStatus: null,
              reviewRequestedBy: null,
              reviewedBy: null,
              reviewedAt: null}

    ).then(() => this.props.refreshChallenge())
  }

  resetMapBounds = () => {
    this.props.setChallengeOwnerMapBounds(this.props.challenge.id,
                                          this.state.initialBounds.mapBounds,
                                          this.state.initialBounds.mapZoom)
  }

  render() {
    if (this.props.challenge.status === ChallengeStatus.building) {
      return <IntervalRender><TaskBuildProgress {...this.props} /></IntervalRender>
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
      <li key={status}>
        <label className="mr-flex mr-items-center">
          <input className="mr-mr-2"
            type="checkbox"
            checked={this.props.includeTaskStatuses[status]}
            onChange={() => this.props.toggleIncludedTaskStatus(status)} />
           <FormattedMessage {...messagesByStatus[status]} />
        </label>
      </li>
    ))

    const reviewStatusFilters = _map(TaskReviewStatusWithUnset, status => (
      <li key={status}>
        <label className="mr-flex mr-items-center">
          <input className="mr-mr-2"
            type="checkbox"
            checked={this.props.includeTaskReviewStatuses[status]}
            onChange={() => this.props.toggleIncludedTaskReviewStatus(status)} />
          <FormattedMessage {...messagesByReviewStatus[status]} />
        </label>
      </li>
    ))

    const priorityFilters = _reverse(_map(TaskPriority, priority => (
      <li key={priority}>
        <label className="mr-flex mr-items-center">
          <input className="mr-mr-2"
            type="checkbox"
            checked={this.props.includeTaskPriorities[priority]}
            onChange={() => this.props.toggleIncludedTaskPriority(priority)} />
          <FormattedMessage {...messagesByPriority[priority]} />
        </label>
      </li>
    )))

    const filterOptions = {
      includeStatuses: this.props.includeTaskStatuses,
      includeReviewStatuses: this.props.includeTaskReviewStatuses,
      withinBounds: this.props.mapBounds,
    }


    const localizedStatusLabels = statusLabels(this.props.intl)
    const localizedReviewStatusLabels = reviewStatusLabels(this.props.intl)
    const localizedPriorityLabels = taskPriorityLabels(this.props.intl)

    const taskSelectionActions =
      _map(TaskStatus, status => ({
        key: `status-${status}`,
        text: localizedStatusLabels[keysByStatus[status]],
        status,
        statusAction: true,
      })
    ).concat(
      _map(TaskReviewStatusWithUnset, status => ({
        key: `review-status-${status}`,
        text: localizedReviewStatusLabels[keysByReviewStatus[status]],
        status,
        statusAction: true,
      }))
    ).concat(
      _map(TaskPriority, priority => ({
        key: `priority-${priority}`,
        text: `${localizedPriorityLabels[keysByPriority[priority]]} ${this.props.intl.formatMessage(messages.priorityLabel)}`,
        priority,
        priorityAction: true,
      }))
    )

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
            {...this.props} />
        </MapPane>

        <div className="mr-my-4 xl:mr-flex mr-justify-between">
          <ul className="mr-mb-4 xl:mr-mb-0 md:mr-flex">
            <li className="md:mr-mr-8">
              <Dropdown
                className="mr-dropdown--right"
                dropdownButton={dropdown => (
                  <button onClick={dropdown.toggleDropdownVisible} className="mr-flex mr-items-center mr-text-blue-light">
                    <span className="mr-text-base mr-uppercase mr-mr-1">
                      <FormattedMessage {...messages.filterByStatusLabel} />
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
                    {statusFilters}
                  </ul>
                }
              />            
            </li>
            <li className="md:mr-mr-8">
              <Dropdown
                className="mr-dropdown--right"
                dropdownButton={dropdown => (
                  <button onClick={dropdown.toggleDropdownVisible} className="mr-flex mr-items-center mr-text-blue-light">
                    <span className="mr-text-base mr-uppercase mr-mr-1">
                    <FormattedMessage {...messages.filterByReviewStatusLabel} />
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
                    {reviewStatusFilters}
                  </ul>
                }
              />
            </li>
            <li>
              <Dropdown
                className="mr-dropdown--right"
                dropdownButton={dropdown => (
                  <button onClick={dropdown.toggleDropdownVisible} className="mr-flex mr-items-center mr-text-blue-light">
                    <span className="mr-text-base mr-uppercase mr-mr-1">
                      <FormattedMessage {...messages.sortByPriorityLabel} />
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
                    {priorityFilters}
                  </ul>
                }
              />
            </li>
          </ul>

          {_get(this.props, 'clusteredTasks.tasks.length') !== _get(this.props, 'taskInfo.tasks.length', 0) ? clearFiltersControl : null}
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
                 onChange={_noop}
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
                        disabled={!this.props.someTasksAreSelected() && !this.props.allTasksAreSelected()}
                        onClick={this.markAsCreated}>
                  <FormattedMessage {...messages.markCreatedLabel} />
                </button>
              </ConfirmAction>
             }
             <a target="_blank"
                rel="noopener noreferrer"
                href={`${process.env.REACT_APP_MAP_ROULETTE_SERVER_URL}/api/v2/challenge/${_get(this.props, 'challenge.id')}/tasks/extract`}
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

export default WithBoundedTasks(ViewChallengeTasks,
                                'filteredClusteredTasks',
                                'taskInfo')
