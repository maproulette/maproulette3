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
import WithWidgetWorkspaces
       from '../../../HOCs/WithWidgetWorkspaces/WithWidgetWorkspaces'
import WithDashboardEntityFilter
       from '../../HOCs/WithDashboardEntityFilter/WithDashboardEntityFilter'
import WithProjectReviewMetrics
      from '../../HOCs/WithProjectReviewMetrics/WithProjectReviewMetrics'
import WidgetWorkspace from '../../../WidgetWorkspace/WidgetWorkspace'
import ChallengeFilterGroup from '../ChallengeFilterGroup/ChallengeFilterGroup'
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
      {i: generateWidgetId(), x: 0, y: 7, w: 4, h: 7},
      {i: generateWidgetId(), x: 0, y: 14, w: 4, h: 12},
      {i: generateWidgetId(), x: 0, y: 26, w: 4, h: 10},
      {i: generateWidgetId(), x: 0, y: 36, w: 4, h: 8},
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
    const isVirtual = this.props.project.isVirtual

    const pageHeader = (
      <div className="admin__manage__header admin__manage__header--flush">
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
                {isVirtual ?
                  <span className="mr-mx-4 mr-text-yellow mr-text-sm">
                    <FormattedMessage {...manageMessages.virtualHeader} />
                  </span> : null}
                {this.props.loadingProject && <BusySpinner inline />}
              </a>
            </li>
          </ul>
        </nav>

        <div className="admin__manage__controls mr-flex">
          {manager.canWriteProject(this.props.project) && !isVirtual &&
            <Link to={`/admin/project/${this.props.project.id}/challenges/new`}
                  className="mr-text-green-lighter hover:mr-text-white mr-mr-4">
              <FormattedMessage {...messages.addChallengeLabel } />
            </Link>
          }

          {manager.canWriteProject(this.props.project) && isVirtual &&
            <Link to={`/admin/virtual/project/${this.props.project.id}/challenges/manage`}
                  className="mr-text-green-lighter hover:mr-text-white mr-mr-4">
              <FormattedMessage {...messages.manageChallengesLabel } />
            </Link>
          }

          {manager.canWriteProject(this.props.project) &&
            <Link to={`/admin/project/${this.props.project.id}/edit`}
                  className="mr-text-green-lighter hover:mr-text-white mr-mr-4">
              <FormattedMessage {...messages.editProjectLabel } />
            </Link>
          }

          {manager.canAdministrateProject(this.props.project) &&
            <ConfirmAction>
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a onClick={this.deleteProject}
                  className="mr-text-green-lighter hover:mr-text-white mr-mr-4">
                <FormattedMessage {...messages.deleteProjectLabel } />
              </a>
            </ConfirmAction>
          }
        </div>
      </div>
    )

    return (
      <div className="admin__manage project-dashboard">
        <WidgetWorkspace
          {...this.props}
          lightMode
          className="mr-mt-4"
          workspaceEyebrow={pageHeader}
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
        WithProjectReviewMetrics(
          injectIntl(ProjectDashboard)),
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
