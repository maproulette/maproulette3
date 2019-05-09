import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import { generateWidgetId, WidgetDataTarget, widgetDescriptor }
       from '../../../../services/Widget/Widget'
import { projectPassesFilters, defaultProjectFilters }
       from '../../../../services/Widget/ProjectFilter/ProjectFilter'
import WithManageableProjects
       from '../../HOCs/WithManageableProjects/WithManageableProjects'
import WithPinned from '../../HOCs/WithPinned/WithPinned'
import WithWidgetWorkspaces
       from '../../../HOCs/WithWidgetWorkspaces/WithWidgetWorkspaces'
import WithDashboardEntityFilter
       from '../../HOCs/WithDashboardEntityFilter/WithDashboardEntityFilter'
import WidgetWorkspace from '../../../WidgetWorkspace/WidgetWorkspace'
import ProjectFilterGroup from '../ProjectFilterGroup/ProjectFilterGroup'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import manageMessages from '../Messages'
import messages from './Messages'
import './ProjectsDashboard.scss'

// The name of this dashboard.
const DASHBOARD_NAME = "projects"

export const defaultDashboardSetup = function() {
  return {
    dataModelVersion: 2,
    name: DASHBOARD_NAME,
    id: generateWidgetId(),
    label: "Projects",
    filters: defaultProjectFilters(),
    widgets: [
      widgetDescriptor('ProjectAboutWidget'),
      widgetDescriptor('ProjectListWidget'),
    ],
    layout: [
      {i: generateWidgetId(), x: 0, y: 0, w: 3, h: 18},
      {i: generateWidgetId(), x: 3, y: 0, w: 9, h: 18},
    ],
  }
}

export class ProjectsDashboard extends Component {
  render() {
    if (!this.props.projects) {
      return <BusySpinner />
    }

    const pageHeader = (
      <div className="admin__manage__header admin__manage__header--flush">
        <nav className="breadcrumb" aria-label="breadcrumbs">
          <ul>
            <li className="is-active">
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a aria-current="page">
                <FormattedMessage {...manageMessages.manageHeader} />
              </a>
            </li>
          </ul>
        </nav>

        <div className="admin__manage__controls mr-flex">
          <Link to={"/admin/projects/new"}
                className="mr-text-green-lighter hover:mr-text-white mr-mr-4">
            <FormattedMessage {...messages.newProject } />
          </Link>
        </div>
      </div>
    )

    return (
      <div className="admin__manage projects-dashboard">
        {!this.props.loadingProjects && this.props.projects.length === 0 ?
         <div className="projects-dashboard__no-projects">
           <FormattedMessage {...messages.regenerateHomeProject} />
         </div> :
         <WidgetWorkspace
           {...this.props}
           lightMode
           className="mr-mt-4"
           workspaceEyebrow={pageHeader}
           filterComponent={ProjectFilterGroup}
         />
        }
      </div>
    )
  }
}

ProjectsDashboard.propTypes = {
  /** All manageable projects */
  projects: PropTypes.array.isRequired,
  /** The projects to be actually be displayed */
  filteredProjects: PropTypes.array,
  /** True if projects are currently being fetched from the server */
  loadingProjects: PropTypes.bool,
}

ProjectsDashboard.defaultProps = {
  loadingProjects: false,
}

export default
WithWidgetWorkspaces(
  WithManageableProjects(
    WithDashboardEntityFilter(
      WithPinned(ProjectsDashboard),
      'project',
      'projects',
      'pinnedProjects',
      'filteredProjects',
      projectPassesFilters
    ),
    true // include challenges
  ),
  WidgetDataTarget.projects,
  DASHBOARD_NAME,
  defaultDashboardSetup
)
