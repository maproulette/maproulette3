import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _compact from 'lodash/compact'
import AsManager from '../../../../interactions/User/AsManager'
import { generateDashboardId, DashboardDataTarget }
       from '../../../../services/Dashboard/Dashboard'
import { ChallengeStatus, isUsableChallengeStatus }
       from  '../../../../services/Challenge/ChallengeStatus/ChallengeStatus'
import WithManageableProjects
       from '../../HOCs/WithManageableProjects/WithManageableProjects'
import WithCurrentProject
       from '../../HOCs/WithCurrentProject/WithCurrentProject'
import WithCurrentChallenge
       from '../../HOCs/WithCurrentChallenge/WithCurrentChallenge'
import WithDashboards from '../../HOCs/WithDashboards/WithDashboards'
import WithFilteredClusteredTasks
       from '../../HOCs/WithFilteredClusteredTasks/WithFilteredClusteredTasks'
import WithChallengeMetrics
       from '../../HOCs/WithChallengeMetrics/WithChallengeMetrics'
import WithDeactivateOnOutsideClick
       from '../../../HOCs/WithDeactivateOnOutsideClick/WithDeactivateOnOutsideClick'
import Dashboard from '../Dashboard/Dashboard'
import { blockDescriptor } from '../GridBlocks/BlockTypes'
import DropdownButton from '../../../Bulma/DropdownButton'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import ConfirmAction from '../../../ConfirmAction/ConfirmAction'
import manageMessages from '../Messages'
import messages from './Messages'
import './ChallengeDashboard.css'

// Setup child components with needed HOCs.
const DeactivatableDropdownButton = WithDeactivateOnOutsideClick(DropdownButton)

// The name of this dashboard.
const DASHBOARD_NAME = "challenge"

export const defaultDashboardSetup = function() {
  return {
    dataModelVersion: 1,
    name: DASHBOARD_NAME,
    label: "View Challenge",
    blocks: [
      blockDescriptor('ChallengeOverviewBlock'),
      blockDescriptor('CompletionProgressBlock'),
      blockDescriptor('LeaderboardBlock'),
      blockDescriptor('RecentActivityBlock'),
      blockDescriptor('CommentsBlock'),
      blockDescriptor('BurndownChartBlock'),
      blockDescriptor('StatusRadarBlock'),
      blockDescriptor('ChallengeTasksBlock'),
    ],
    layout: [
      {i: generateDashboardId(), x: 0, y: 0, w: 4, h: 7},
      {i: generateDashboardId(), x: 0, y: 7, w: 4, h: 5},
      {i: generateDashboardId(), x: 0, y: 12, w: 4, h: 8},
      {i: generateDashboardId(), x: 0, y: 20, w: 4, h: 14},
      {i: generateDashboardId(), x: 0, y: 34, w: 4, h: 12},
      {i: generateDashboardId(), x: 0, y: 46, w: 4, h: 12},
      {i: generateDashboardId(), x: 0, y: 58, w: 4, h: 12},
      {i: generateDashboardId(), x: 4, y: 0, w: 8, h: 49},
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

  rebuildChallenge = () => {
    this.props.rebuildChallenge(this.props.challenge.id)
  }

  moveChallenge = action => {
    this.props.moveChallenge(this.props.challenge.id, action.projectId)
  }

  render() {
    if (!this.props.challenge) {
      return <BusySpinner />
    }

    const manager = AsManager(this.props.user)
    const projectId = _get(this.props, 'challenge.parent.id')

    const managedProjectOptions = _compact(_map(this.props.projects, project => {
      if (project.id === projectId || !manager.canWriteProject(project)) {
        return null
      }

      return {
        key: `project-${project.id}`,
        text: project.displayName ? project.displayName : project.name,
        projectId: project.id,
      }
    }))

    const status = _get(this.props, 'challenge.status', ChallengeStatus.none)
    const hasTasks = _get(this.props, 'challenge.actions.total', 0) > 0

    return (
      <div className="admin__manage challenge-dashboard">
        <div className="admin__manage__header">
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
                <a aria-current="page">
                  {this.props.challenge.name}
                  {this.props.loadingChallenge && <BusySpinner inline />}
                </a>
              </li>
            </ul>
          </nav>

          <div className="columns admin__manage__controls">
            {hasTasks && isUsableChallengeStatus(status, true) &&
             <div className="column is-narrow admin__manage__controls--control">
               <Link to={`/challenge/${this.props.challenge.id}`}>
                 <FormattedMessage {...messages.startChallengeLabel} />
               </Link>
             </div>
            }

            {manager.canWriteProject(this.props.challenge.parent) &&
             <React.Fragment>
               <div className="column is-narrow admin__manage__controls--control">
                 <Link to={`/admin/project/${projectId}/` +
                           `challenge/${this.props.challenge.id}/edit`}>
                   <FormattedMessage {...messages.editChallengeLabel } />
                 </Link>
               </div>

               {_get(this.props, 'projects.length', 0) > 1 &&
                 <div className="column is-narrow admin__manage__controls--control">
                   <DeactivatableDropdownButton options={managedProjectOptions}
                                               onSelect={this.moveChallenge}
                                               emptyContent={<FormattedMessage {...messages.noProjects} />}>
                     <a>
                       <FormattedMessage {...messages.moveChallengeLabel} />
                       <div className="basic-dropdown-indicator" />
                     </a>
                   </DeactivatableDropdownButton>
                 </div>
               }

               {this.props.challenge.isRebuildable() &&
                 <div className="column is-narrow admin__manage__controls--control">
                   <ConfirmAction prompt={<FormattedMessage {...messages.rebuildChallengePrompt} />}>
                     <a onClick={this.rebuildChallenge}>
                       <FormattedMessage {...messages.rebuildChallengeLabel } />
                     </a>
                   </ConfirmAction>
                 </div>
               }

               <div className="column is-narrow admin__manage__controls--control">
                 <Link to={{pathname: `/admin/project/${projectId}/` +
                                       `challenge/${this.props.challenge.id}/clone`,
                             state: {cloneChallenge: true}}}>
                   <FormattedMessage {...messages.cloneChallengeLabel } />
                 </Link>
               </div>

               <div className="column is-narrow admin__manage__controls--control">
                 <ConfirmAction>
                   <a className='button is-clear' onClick={this.deleteChallenge}>
                     <SvgSymbol sym='trash-icon' className='icon' viewBox='0 0 20 20' />
                   </a>
                 </ConfirmAction>
               </div>
            </React.Fragment>
           }
          </div>
        </div>

        <Dashboard {...this.props} />
      </div>
    )
  }
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
    WithCurrentChallenge(
      WithDashboards(
        WithFilteredClusteredTasks(
          WithChallengeMetrics(
            injectIntl(ChallengeDashboard),
          ),
          'clusteredTasks',
          'filteredClusteredTasks',
        ),
        DashboardDataTarget.challenge,
        DASHBOARD_NAME,
        defaultDashboardSetup
      ),
      true
    )
  )
)
