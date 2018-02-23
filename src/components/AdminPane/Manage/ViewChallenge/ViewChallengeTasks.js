import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage,
         FormattedRelative } from 'react-intl'
import _get from 'lodash/get'
import _map from 'lodash/map'
import { ChallengeStatus }
       from '../../../../services/Challenge/ChallengeStatus/ChallengeStatus'
import { TaskStatus,
         keysByStatus,
         messagesByStatus } from '../../../../services/Task/TaskStatus/TaskStatus'
import { MAPBOX_LIGHT,
         layerSourceWithName }
       from '../../../../services/VisibleLayer/LayerSources'
import WithMapBounds from '../../../HOCs/WithMapBounds/WithMapBounds'
import WithBoundedTasks
       from '../../HOCs/WithBoundedTasks/WithBoundedTasks'
import MapPane from '../../../EnhancedMap/MapPane/MapPane'
import ChallengeTaskMap from '../ChallengeTaskMap/ChallengeTaskMap'
import TaskAnalysisTable from '../TaskAnalysisTable/TaskAnalysisTable'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import messages from './Messages'

// Setup child components with necessary HOCs
const BoundedTaskTable =
  WithBoundedTasks(TaskAnalysisTable, 'filteredClusteredTasks', 'taskInfo')

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
        </div>
      )
    }

    // Only use challenge-owner map bounds and zoom if they've been previously
    // saved for this challenge.
    let mapBounds = null
    let mapZoom = null
    const challengeOwnerBounds = _get(this.props.mapBounds, 'challengeOwner')
    if (challengeOwnerBounds &&
        challengeOwnerBounds.challengeId === this.props.challenge.id) {
      mapBounds = challengeOwnerBounds.bounds
      mapZoom = challengeOwnerBounds.zoom
    }

    // Use CSS Modules once supported by create-react-app
    const statusColors = {
      [TaskStatus.created]: '#0082C8',       // $status-created-color
      [TaskStatus.fixed]: '#3CB44B',         // $status-fixed-color
      [TaskStatus.falsePositive]: '#F58231', // $status-falsePositive-color
      [TaskStatus.skipped]: '#FFE119',       // $status-skipped-color
      [TaskStatus.deleted]: '#46F0F0',       // $status-deleted-color
      [TaskStatus.alreadyFixed]: '#911EB4',  // $status-alreadyFixed-color
      [TaskStatus.tooHard]: '#E6194B',       // $status-tooHard-color
    }

    const statusFilters = _map(TaskStatus, status => (
      <div key={status} className="status-filter is-narrow">
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

    const filterOptions = {
      includeStatuses: this.props.includeTaskStatuses,
      withinBounds: mapBounds,
    }

    return (
      <div className='admin__manage-tasks'>
        <div className="status-filter-options">
          {statusFilters}
        </div>

        <MapPane>
          <ChallengeTaskMap taskInfo={this.props.filteredClusteredTasks}
                            setChallengeOwnerMapBounds={this.props.setChallengeOwnerMapBounds}
                            lastBounds={mapBounds}
                            lastZoom={mapZoom}
                            statusColors={statusColors}
                            filterOptions={filterOptions}
                            monochromaticClusters
                            defaultLayer={layerSourceWithName(MAPBOX_LIGHT)}
                            {...this.props} />
        </MapPane>
        <BoundedTaskTable filterOptions={filterOptions}
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
  /** Latest map bounds */
  mapBounds: PropTypes.object.isRequired,
  /** Invoked when the challenge owner pans or zooms the challenge map */
  setChallengeOwnerMapBounds: PropTypes.func.isRequired,
}

ViewChallengeTasks.defaultProps = {
  loadingChallenge: false,
}

export default WithMapBounds(ViewChallengeTasks)
