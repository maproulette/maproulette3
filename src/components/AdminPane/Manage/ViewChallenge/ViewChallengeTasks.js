import React, { Component } from 'react'
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
import WithBoundedTasks
       from '../../HOCs/WithBoundedTasks/WithBoundedTasks'
import MapPane from '../../../EnhancedMap/MapPane/MapPane'
import ChallengeTaskMap from '../ChallengeTaskMap/ChallengeTaskMap'
import TaskAnalysisTable from '../TaskAnalysisTable/TaskAnalysisTable'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import messages from './Messages'

const BoundedTaskTable =
  WithBoundedTasks(TaskAnalysisTable, 'filteredClusteredTasks', 'taskInfo')

export default class ViewChallengeTasks extends Component {
  state = {
    mapBounds: null,
    mapZoom: null,
    renderingProgress: null,
  }

  /** Invoked by the map when the user pans or zooms */
  updateMapBounds = (challengeId, bounds, zoom) =>
    this.setState({mapBounds: bounds, mapZoom: zoom})

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
                    onClick={this.props.refreshStatus}>
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
             onClick={() => this.props.toggleIncludedStatus(status)}>
          <input className="is-checkradio is-circle has-background-color is-success"
                 type="checkbox"
                 checked={this.props.includeStatuses[status]}
                 onChange={() => null} />
          <label>
            <FormattedMessage {...messagesByStatus[status]} />
          </label>
        </div>
      </div>
    ))

    const filterOptions = {
      includeStatuses: this.props.includeStatuses,
      withinBounds: this.state.mapBounds,
    }

    return (
      <div className='admin__manage-tasks'>
        <div className="status-filter-options">
          {statusFilters}
        </div>

        <MapPane>
          <ChallengeTaskMap taskInfo={this.props.filteredClusteredTasks}
                            setChallengeMapBounds={this.updateMapBounds}
                            lastBounds={this.state.mapBounds}
                            lastZoom={this.state.mapZoom}
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
