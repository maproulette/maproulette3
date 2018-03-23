import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage,
         FormattedRelative } from 'react-intl'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _reverse from 'lodash/reverse'
import _isUndefined from 'lodash/isUndefined'
import { ChallengeStatus }
       from '../../../../services/Challenge/ChallengeStatus/ChallengeStatus'
import { TaskStatus,
         keysByStatus,
         messagesByStatus }
       from '../../../../services/Task/TaskStatus/TaskStatus'
import { TaskPriority,
         keysByPriority,
         messagesByPriority }
       from '../../../../services/Task/TaskPriority/TaskPriority'
import { MAPBOX_LIGHT,
         layerSourceWithId }
       from '../../../../services/VisibleLayer/LayerSources'
import WithBoundedTasks
       from '../../HOCs/WithBoundedTasks/WithBoundedTasks'
import MapPane from '../../../EnhancedMap/MapPane/MapPane'
import ChallengeTaskMap from '../ChallengeTaskMap/ChallengeTaskMap'
import TaskAnalysisTable from '../TaskAnalysisTable/TaskAnalysisTable'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import messages from './Messages'

/**
 * ViewChallengeTasks displays challenge tasks as both a map and a table,
 * along with filtering controls for showing subsets of tasks.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ViewChallengeTasks extends Component {
  render() {
    if (this.props.challenge.status === ChallengeStatus.building) {
      return (
        <div>
          <div className="challenge-tasks-status">
            <h3><FormattedMessage {...messages.tasksBuilding} /></h3>

            <div className="since-when">
              <FormattedMessage {...messages.asOf} /> <FormattedRelative value={new Date(this.props.challenge._meta.fetchedAt)} />
            </div>

            <button className={classNames("button is-primary is-outlined has-svg-icon refresh-control",
                                          {"is-loading": this.props.loadingChallenge})}
                    onClick={this.props.refreshChallengeStatus}>
              <SvgSymbol viewBox='0 0 20 20' sym="refresh-icon" />
              <FormattedMessage {...messages.refreshStatusLabel} />
            </button>
          </div>
        </div>
      )
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

    if (_isUndefined(this.props.challenge.status) ||
        this.props.challenge.status === ChallengeStatus.none) {
      return (
        <div className="challenge-tasks-status title has-centered-children">
          <h3>
            <FormattedMessage {...messages.tasksNone} />
          </h3>
        </div>
      )
    }

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

    return (
      <div className='admin__manage-tasks'>
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
  /** Invoked to refresh the status of the challenge */
  refreshChallengeStatus: PropTypes.func.isRequired,
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
