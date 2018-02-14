import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage, injectIntl } from 'react-intl'
import _get from 'lodash/get'
import _map from 'lodash/map'
import { Link } from 'react-router-dom'
import { TaskStatus,
         keysByStatus,
         messagesByStatus } from '../../../../services/Task/TaskStatus/TaskStatus'
import { MAPBOX_LIGHT,
         layerSourceWithName }
       from '../../../../services/VisibleLayer/LayerSources'
import WithCurrentChallenge
       from '../../HOCs/WithCurrentChallenge/WithCurrentChallenge'
import WithFilteredClusteredTasks
       from '../../HOCs/WithFilteredClusteredTasks/WithFilteredClusteredTasks'
import WithBoundedTasks
       from '../../HOCs/WithBoundedTasks/WithBoundedTasks'
import Sidebar from '../../../Sidebar/Sidebar'
import CommentList from '../../../CommentList/CommentList'
import MapPane from '../../../EnhancedMap/MapPane/MapPane'
import ChallengeTaskMap from '../ChallengeTaskMap/ChallengeTaskMap'
import TaskAnalysisTable from '../TaskAnalysisTable/TaskAnalysisTable'
import ChallengeOverview from '../ManageChallenges/ChallengeOverview'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import Tabs from '../../../Bulma/Tabs'
import ChallengeMetrics from '../ChallengeMetrics/ChallengeMetrics'
import ConfirmAction from '../../../ConfirmAction/ConfirmAction'
import manageMessages from '../Messages'
import messages from './Messages'
import './ViewChallenge.css'

const BoundedTaskTable =
  WithBoundedTasks(TaskAnalysisTable, 'filteredClusteredTasks', 'taskInfo')

/**
 * ViewChallenge displays various challenge details and metrics of interest
 * to challenge owners, along with a list of the challenge tasks.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ViewChallenge extends Component {
  state = {
    mapBounds: null,
    mapZoom: null,
    renderingProgress: null,
  }

  /** Invoked by the map when the user pans or zooms */
  updateMapBounds = (challengeId, bounds, zoom) =>
    this.setState({mapBounds: bounds, mapZoom: zoom})

  deleteChallenge = () => {
    this.props.deleteChallenge(this.props.challenge.parent.id,
                               this.props.challenge.id)
  }

  render() {
    if (!this.props.challenge) {
      return <BusySpinner />
    }

    const tabs = {
      [this.props.intl.formatMessage(messages.challengeOverviewTabLabel)]:
        <ChallengeOverview challenge={this.props.challenge} />,

      [this.props.intl.formatMessage(messages.challengeCommentsTabLabel)]:
        <CommentList includeTaskLinks
                               comments={_get(this.props, 'challenge.comments', [])} />,

      [this.props.intl.formatMessage(messages.challengeMetricsTabLabel)]:
        <ChallengeMetrics challenges={[this.props.challenge]} />,
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
          <input className="is-checkradio is-circle has-background-color is-success" type="checkbox"
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
      <div className="admin__manage view-challenge">
        <div className="admin__manage__header">
          <nav className="breadcrumb" aria-label="breadcrumbs">
            <ul>
              <li>
                <Link to={`/admin/manage/${this.props.challenge.parent.id}`}>
                  <FormattedMessage {...manageMessages.manageHeader} />
                </Link>
              </li>
              <li>
                <Link to={`/admin/project/${this.props.challenge.parent.id}`}>
                  {this.props.challenge.parent.displayName ||
                  this.props.challenge.parent.name}
                </Link>
              </li>
              <li className="is-active">
                <a aria-current="page">
                  {this.props.challenge.name}
                  {this.props.loadingChallenge && <BusySpinner inline />}
                </a>
              </li>
            </ul>
          </nav>

          <div className="columns admin__manage__controls">
            <div className="column is-narrow admin__manage__controls--control">
              <Link to={`/admin/project/${this.props.challenge.parent.id}/` +
                        `challenge/${this.props.challenge.id}/edit`}>
                <FormattedMessage {...messages.editTaskLabel } />
              </Link>
            </div>

            <div className="column is-narrow admin__manage__controls--control">
              <ConfirmAction>
                <a className='button is-clear' onClick={this.deleteChallenge}>
                  <SvgSymbol className='icon' sym='trash-icon' viewBox='0 0 20 20' />
                </a>
              </ConfirmAction>
            </div>
          </div>
        </div>

        <div className="admin__manage__pane-wrapper">
          <Sidebar className='admin__manage__sidebar inline' isActive={true}>
            <Tabs className='is-centered' tabs={tabs} />
          </Sidebar>

          <div className="admin__manage__primary-content">
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
          </div>
        </div>
      </div>
    )
  }
}

ViewChallenge.propTypes = {
  project: PropTypes.object,
  challenge: PropTypes.object,
  loadingTasks: PropTypes.bool.isRequired,
}

export default WithCurrentChallenge(
  WithFilteredClusteredTasks(
    injectIntl(ViewChallenge),
    'clusteredTasks',
    'filteredClusteredTasks',
  ),
  true
)
