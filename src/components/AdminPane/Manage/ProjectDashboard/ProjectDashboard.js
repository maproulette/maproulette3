import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import AsManager from '../../../../interactions/User/AsManager'
import { generateDashboardId, DashboardDataTarget }
       from '../../../../services/Dashboard/Dashboard'
import { challengePassesFilters, defaultChallengeFilters }
       from '../../../../services/Dashboard/ChallengeFilter/ChallengeFilter'
import WithManageableProjects
       from '../../HOCs/WithManageableProjects/WithManageableProjects'
import WithCurrentProject
       from '../../HOCs/WithCurrentProject/WithCurrentProject'
import WithChallengeMetrics
       from '../../HOCs/WithChallengeMetrics/WithChallengeMetrics'
import WithDashboards from '../../HOCs/WithDashboards/WithDashboards'
import WithDashboardEntityFilter
       from '../../HOCs/WithDashboardEntityFilter/WithDashboardEntityFilter'
import Dashboard from '../Dashboard/Dashboard'
import { blockDescriptor } from '../GridBlocks/BlockTypes'
import ChallengeFilterGroup from '../ChallengeFilterGroup/ChallengeFilterGroup'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import ConfirmAction from '../../../ConfirmAction/ConfirmAction'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import manageMessages from '../Messages'
import messages from './Messages'
import './ProjectDashboard.css'

// The name of this dashboard.
const DASHBOARD_NAME = "project"

export const defaultDashboardSetup = function() {
  return {
    dataModelVersion: 1,
    name: DASHBOARD_NAME,
    label: "View Project",
    filters: defaultChallengeFilters(),
    blocks: [
      blockDescriptor('ProjectOverviewBlock'),
      blockDescriptor('CompletionProgressBlock'),
      blockDescriptor('BurndownChartBlock'),
      blockDescriptor('CommentsBlock'),
      blockDescriptor('ChallengeListBlock'),
    ],
    layout: [
      {i: generateDashboardId(), x: 0, y: 0, w: 4, h: 7},
      {i: generateDashboardId(), x: 0, y: 7, w: 4, h: 5},
      {i: generateDashboardId(), x: 0, y: 12, w: 4, h: 12},
      {i: generateDashboardId(), x: 0, y: 24, w: 4, h: 10},
      {i: generateDashboardId(), x: 8, y: 0, w: 8, h: 34},
    ],
  }
}

export class ProjectDashboard extends Component {
  deleteProject = () => {
    this.props.deleteProject(this.props.project.id).then(() => {
      this.props.history.replace('/admin/projects')
    })
  }

  render() {
    if (!this.props.project) {
      return <BusySpinner />
    }

    const manager = AsManager(this.props.user)

    return (
      <div className="admin__manage project-dashboard">
        <div className="admin__manage__header">
          <nav className="breadcrumb" aria-label="breadcrumbs">
            <ul>
              <li>
                <Link to='/admin/projects'>
                  <FormattedMessage {...manageMessages.manageHeader} />
                </Link>
              </li>
              <li className="is-active">
                <a aria-current="page">
                  {this.props.project.displayName || this.props.project.name}
                  {this.props.loadingProject && <BusySpinner inline />}
                </a>
              </li>
            </ul>
          </nav>

          <div className="columns admin__manage__controls">
            {manager.canWriteProject(this.props.project) &&
             <div className="column is-narrow admin__manage__controls--control">
               <Link to={`/admin/project/${this.props.project.id}/challenges/new`}>
                 <FormattedMessage {...messages.addChallengeLabel } />
               </Link>
             </div>
            }

            {manager.canWriteProject(this.props.project) &&
             <div className="column is-narrow admin__manage__controls--control">
               <Link to={`/admin/project/${this.props.project.id}/edit`}>
                 <FormattedMessage {...messages.editProjectLabel } />
               </Link>
             </div>
            }

            {manager.canAdministrateProject(this.props.project) &&
             <div className="column is-narrow admin__manage__controls--control">
               <ConfirmAction>
                 <a className='button is-clear' onClick={this.deleteProject}>
                   <SvgSymbol sym='trash-icon' className='icon' viewBox='0 0 20 20' />
                 </a>
               </ConfirmAction>
             </div>
            }
          </div>
        </div>

        <Dashboard {...this.props}
                   filterComponent={ChallengeFilterGroup}
                   activity={this.props.project.activity} />
      </div>
    )
  }
}

ProjectDashboard.propTypes = {
  /** The parent project of the challenge */
  project: PropTypes.object,
  /** Set to true if the project data is still being retrieved */
  loadingProject: PropTypes.bool,
  /** Set to true if the challenges data are still being retrieved */
  loadingChallenges: PropTypes.bool,
}

export default
WithManageableProjects(
  WithCurrentProject(
    WithDashboards(
      WithDashboardEntityFilter(
        WithChallengeMetrics(
          injectIntl(ProjectDashboard),
        ),
        'challenge',
        'challenges',
        'pinnedChallenges',
        'challenges',
        challengePassesFilters
      ),
      [DashboardDataTarget.project, DashboardDataTarget.challenges],
      DASHBOARD_NAME,
      defaultDashboardSetup
    ),
    {
      restrictToGivenProjects: true,
      includeChallenges: true,
      includeActivity: true,
      includeComments: true,
    }
  )
)
