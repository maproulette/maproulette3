import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import AsManager from '../../../../interactions/User/AsManager'
import { generateWidgetId, WidgetDataTarget, widgetDescriptor }
       from '../../../../services/Widget/Widget'
import { challengePassesFilters, defaultChallengeFilters }
       from '../../../../services/Widget/ChallengeFilter/ChallengeFilter'
import WithManageableProjects
       from '../../HOCs/WithManageableProjects/WithManageableProjects'
import WithCurrentProject
       from '../../HOCs/WithCurrentProject/WithCurrentProject'
import WithChallengeMetrics
       from '../../HOCs/WithChallengeMetrics/WithChallengeMetrics'
import WithWidgetWorkspaces
       from '../../../HOCs/WithWidgetWorkspaces/WithWidgetWorkspaces'
import WithDashboardEntityFilter
       from '../../HOCs/WithDashboardEntityFilter/WithDashboardEntityFilter'
import WidgetWorkspace from '../../../WidgetWorkspace/WidgetWorkspace'
import ChallengeFilterGroup from '../ChallengeFilterGroup/ChallengeFilterGroup'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import ConfirmAction from '../../../ConfirmAction/ConfirmAction'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import manageMessages from '../Messages'
import messages from './Messages'
import './ProjectDashboard.scss'

// The name of this dashboard.
const DASHBOARD_NAME = "project"

export const defaultDashboardSetup = function() {
  return {
    dataModelVersion: 2,
    name: DASHBOARD_NAME,
    label: "View Project",
    filters: defaultChallengeFilters(),
    widgets: [
      widgetDescriptor('ProjectOverviewWidget'),
      widgetDescriptor('CompletionProgressWidget'),
      widgetDescriptor('BurndownChartWidget'),
      widgetDescriptor('CommentsWidget'),
      widgetDescriptor('ProjectManagersWidget'),
      widgetDescriptor('ChallengeListWidget'),
    ],
    layout: [
      {i: generateWidgetId(), x: 0, y: 0, w: 4, h: 7},
      {i: generateWidgetId(), x: 0, y: 7, w: 4, h: 5},
      {i: generateWidgetId(), x: 0, y: 12, w: 4, h: 12},
      {i: generateWidgetId(), x: 0, y: 24, w: 4, h: 10},
      {i: generateWidgetId(), x: 0, y: 34, w: 4, h: 8},
      {i: generateWidgetId(), x: 8, y: 0, w: 8, h: 34},
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
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
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
                 {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                 <a className='button is-clear' onClick={this.deleteProject}>
                   <SvgSymbol sym='trash-icon' className='icon' viewBox='0 0 20 20' />
                 </a>
               </ConfirmAction>
             </div>
            }
          </div>
        </div>

        <WidgetWorkspace
          {...this.props}
          filterComponent={ChallengeFilterGroup}
          activity={this.props.project.activity}
        />
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
    WithWidgetWorkspaces(
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
      [WidgetDataTarget.project, WidgetDataTarget.challenges],
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
