import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _compact from 'lodash/compact'
import _isEmpty from 'lodash/isEmpty'
import AsManager from '../../../../interactions/User/AsManager'
import { generateWidgetId, WidgetDataTarget, widgetDescriptor }
       from '../../../../services/Widget/Widget'
import { ChallengeStatus, isUsableChallengeStatus }
       from  '../../../../services/Challenge/ChallengeStatus/ChallengeStatus'
import WithManageableProjects
       from '../../HOCs/WithManageableProjects/WithManageableProjects'
import WithCurrentProject
       from '../../HOCs/WithCurrentProject/WithCurrentProject'
import WithCurrentChallenge
       from '../../HOCs/WithCurrentChallenge/WithCurrentChallenge'
import WithWidgetWorkspaces
       from '../../../HOCs/WithWidgetWorkspaces/WithWidgetWorkspaces'
import WithFilteredClusteredTasks
       from '../../../HOCs/WithFilteredClusteredTasks/WithFilteredClusteredTasks'
import WithClusteredTasks
      from '../../../HOCs/WithClusteredTasks/WithClusteredTasks'
import WithChallengeMetrics
       from '../../HOCs/WithChallengeMetrics/WithChallengeMetrics'
import WithChallengeReviewMetrics
      from '../../HOCs/WithChallengeReviewMetrics/WithChallengeReviewMetrics'
import WithSearch from '../../../HOCs/WithSearch/WithSearch'
import WidgetWorkspace from '../../../WidgetWorkspace/WidgetWorkspace'
import RebuildTasksControl from '../RebuildTasksControl/RebuildTasksControl'
import TaskUploadingProgress
       from '../TaskUploadingProgress/TaskUploadingProgress'
import TaskDeletingProgress
       from '../TaskDeletingProgress/TaskDeletingProgress'
import Dropdown from '../../../Dropdown/Dropdown'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import ConfirmAction from '../../../ConfirmAction/ConfirmAction'
import manageMessages from '../Messages'
import messages from './Messages'
import './ChallengeDashboard.scss'

// The name of this dashboard.
const DASHBOARD_NAME = "challenge"

export const defaultDashboardSetup = function() {
  return {
    dataModelVersion: 2,
    name: DASHBOARD_NAME,
    label: "View Challenge",
    widgets: [
      widgetDescriptor('ChallengeOverviewWidget'),
      widgetDescriptor('CompletionProgressWidget'),
      widgetDescriptor('LeaderboardWidget'),
      widgetDescriptor('RecentActivityWidget'),
      widgetDescriptor('CommentsWidget'),
      widgetDescriptor('BurndownChartWidget'),
      widgetDescriptor('StatusRadarWidget'),
      widgetDescriptor('ChallengeTasksWidget'),
    ],
    layout: [
      {i: generateWidgetId(), x: 0, y: 0, w: 4, h: 7},
      {i: generateWidgetId(), x: 0, y: 7, w: 4, h: 7},
      {i: generateWidgetId(), x: 0, y: 14, w: 4, h: 8},
      {i: generateWidgetId(), x: 0, y: 22, w: 4, h: 14},
      {i: generateWidgetId(), x: 0, y: 36, w: 4, h: 12},
      {i: generateWidgetId(), x: 0, y: 48, w: 4, h: 12},
      {i: generateWidgetId(), x: 0, y: 60, w: 4, h: 12},
      {i: generateWidgetId(), x: 4, y: 0, w: 8, h: 49},
    ],
  }
}

/**
 * ChallengeDashboard displays various challenge details and metrics of interest to
 * challenge owners, along with the challenge tasks.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ChallengeDashboard extends Component {
  deleteChallenge = () => {
    this.props.deleteChallenge(this.props.challenge.parent.id,
                               this.props.challenge.id)
  }

  moveChallenge = action => {
    this.props.moveChallenge(this.props.challenge.id, action.projectId)
  }

  render() {
    if (!this.props.challenge) {
      return <BusySpinner />
    }

    const isDeletingTasks = _get(this.props, 'progress.deletingTasks.inProgress', false)
    if (isDeletingTasks) {
      return <TaskDeletingProgress {...this.props} />
    }

    const isUploadingTasks = _get(this.props, 'progress.creatingTasks.inProgress', false)
    if (isUploadingTasks) {
      return <TaskUploadingProgress {...this.props} />
    }

    const manager = AsManager(this.props.user)
    const projectId = _get(this.props, 'challenge.parent.id')
    const status = _get(this.props, 'challenge.status', ChallengeStatus.none)
    const hasTasks = _get(this.props, 'challenge.actions.total', 0) > 0

    const pageHeader = (
      <div className="admin__manage__header admin__manage__header--flush">
        <nav className="breadcrumb" aria-label="breadcrumbs">
          <ul>
            <li>
              <Link to='/admin/projects'>
                <FormattedMessage {...manageMessages.manageHeader} />
              </Link>
            </li>
            <li>
              <Link to={`/admin/project/${projectId}`}>
                {_get(this.props, 'challenge.parent.displayName') ||
                  _get(this.props, 'challenge.parent.name')}
              </Link>
            </li>
            <li className="is-active">
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a aria-current="page">
                {this.props.challenge.name}
                {this.props.loadingChallenge && <BusySpinner inline />}
              </a>
            </li>
          </ul>
        </nav>

        <div className="admin__manage__controls mr-flex">
          {hasTasks && isUsableChallengeStatus(status, true) &&
            <Link to={`/challenge/${this.props.challenge.id}`}
                  className="mr-text-green-lighter hover:mr-text-white mr-mr-4">
              <FormattedMessage {...messages.startChallengeLabel} />
            </Link>
          }

          {manager.canWriteProject(this.props.challenge.parent) &&
            <React.Fragment>
              <Link to={`/admin/project/${projectId}/` +
                        `challenge/${this.props.challenge.id}/edit`}
                    className="mr-text-green-lighter hover:mr-text-white mr-mr-4">
                <FormattedMessage {...messages.editChallengeLabel } />
              </Link>

              {_get(this.props, 'projects.length', 0) > 1 &&
                <Dropdown
                  className="mr-dropdown--fixed"
                  dropdownButton={dropdown => (
                    // eslint-disable-next-line jsx-a11y/anchor-is-valid
                    <a onClick={dropdown.toggleDropdownVisible}
                       className="mr-text-green-lighter hover:mr-text-white mr-mr-4 mr-flex mr-items-center"
                    >
                      <FormattedMessage {...messages.moveChallengeLabel} />
                      <SvgSymbol
                        sym="icon-cheveron-down"
                        viewBox="0 0 20 20"
                        className="mr-fill-current mr-w-5 mr-h-5"
                      />
                    </a>
                  )}
                  dropdownContent={dropdown =>
                    <ListManagedProjectItems
                      {...this.props}
                      currentProjectId={projectId}
                      manager={manager}
                    />
                  }
                />
              }

              {this.props.challenge.isRebuildable() &&
               <RebuildTasksControl {...this.props} />
              }

              <Link to={{pathname: `/admin/project/${projectId}/` +
                                    `challenge/${this.props.challenge.id}/clone`,
                        state: {cloneChallenge: true}}}
                    className="mr-text-green-lighter hover:mr-text-white mr-mr-4">
                <FormattedMessage {...messages.cloneChallengeLabel } />
              </Link>

              <ConfirmAction>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a onClick={this.deleteChallenge}
                  className="mr-text-green-lighter hover:mr-text-white mr-mr-4">
                  <FormattedMessage {...messages.deleteChallengeLabel } />
                </a>
              </ConfirmAction>
          </React.Fragment>
          }
        </div>
      </div>
    )

    return (
      <div className="admin__manage challenge-dashboard">
        <WidgetWorkspace
          {...this.props}
          lightMode
          className=""
          workspaceEyebrow={pageHeader}
        />
      </div>
    )
  }
}

const ListManagedProjectItems = function(props) {
  const projectItems = _compact(_map(props.projects, project => {
    if (project.id === props.currentProjectId ||
        !props.manager.canWriteProject(project)) {
      return null
    }

    return (
      <li key={`project-${project.id}`}>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a
          onClick={() => props.moveChallenge(props.challenge.id, project.id)}
        >
          {project.displayName ? project.displayName : project.name}
        </a>
      </li>
    )
  }))

  return _isEmpty(projectItems) ?
    <FormattedMessage {...messages.noProjects} /> : (
    <ol className="mr-list-dropdown">
      {projectItems}
    </ol>
  )
}

ChallengeDashboard.propTypes = {
  /** The parent project of the challenge */
  project: PropTypes.object,
  /** The current challenge to view */
  challenge: PropTypes.object,
  /** Set to true if challenge data is still loading */
  loadingChallenge: PropTypes.bool.isRequired,
  /** Invoked when the user wishes to delete the challenge */
  deleteChallenge: PropTypes.func.isRequired,
  /** Invoked when the user wishes to move the challenge */
  moveChallenge: PropTypes.func.isRequired,
}

export default
WithManageableProjects(
  WithCurrentProject(
    WithSearch(
      WithCurrentChallenge(
        WithWidgetWorkspaces(
          WithClusteredTasks(
            WithFilteredClusteredTasks(
              WithChallengeMetrics(
                WithChallengeReviewMetrics(
                  injectIntl(ChallengeDashboard),
                )
              ),
              'clusteredTasks',
              'filteredClusteredTasks'
            )
          ),
          WidgetDataTarget.challenge,
          DASHBOARD_NAME,
          defaultDashboardSetup
        )
      ),
      'challengeOwner'
    )
  )
)
