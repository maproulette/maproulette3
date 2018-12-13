import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import { generateDashboardId, DashboardDataTarget }
       from '../../../../services/Dashboard/Dashboard'
import { projectPassesFilters, defaultProjectFilters }
       from '../../../../services/Dashboard/ProjectFilter/ProjectFilter'
import WithManageableProjects
       from '../../HOCs/WithManageableProjects/WithManageableProjects'
import WithPinned from '../../HOCs/WithPinned/WithPinned'
import WithDashboards from '../../HOCs/WithDashboards/WithDashboards'
import WithDashboardEntityFilter
       from '../../HOCs/WithDashboardEntityFilter/WithDashboardEntityFilter'
import Dashboard from '../Dashboard/Dashboard'
import { blockDescriptor } from '../GridBlocks/BlockTypes'
import ProjectFilterGroup from '../ProjectFilterGroup/ProjectFilterGroup'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import manageMessages from '../Messages'
import messages from './Messages'
import './ProjectsDashboard.css'

// The name of this dashboard.
const DASHBOARD_NAME = "projects"

export const defaultDashboardSetup = function() {
  return {
    dataModelVersion: 1,
    name: DASHBOARD_NAME,
    id: generateDashboardId(),
    label: "Projects",
    filters: defaultProjectFilters(),
    blocks: [
      blockDescriptor('ProjectAboutBlock'),
      blockDescriptor('ProjectCountBlock'),
      blockDescriptor('ProjectListBlock'),
    ],
    layout: [
      {i: generateDashboardId(), x: 0, y: 0, w: 4, h: 10},
      {i: generateDashboardId(), x: 0, y: 10, w: 4, h: 10},
      {i: generateDashboardId(), x: 8, y: 4, w: 8, h: 20},
    ],
  }
}

export class ProjectsDashboard extends Component {
  render() {
    if (!this.props.projects) {
      return <BusySpinner />
    }

    return (
      <div className="admin__manage projects-dashboard">
        <div className="admin__manage__header">
          <nav className="breadcrumb" aria-label="breadcrumbs">
            <ul>
              <li className="is-active">
                <a aria-current="page">
                  <FormattedMessage {...manageMessages.manageHeader} />
                </a>
              </li>
            </ul>
          </nav>

          <div className="columns admin__manage__controls">
            <div className="column is-narrow admin__manage__controls--control">
              <Link to={"/admin/projects/new"}>
                <FormattedMessage {...messages.newProject } />
              </Link>
            </div>
          </div>
        </div>

        {!this.props.loadingProjects && this.props.projects.length === 0 ?
         <div className="projects-dashboard__no-projects">
           <FormattedMessage {...messages.regenerateHomeProject} />
         </div> :
         <Dashboard {...this.props} filterComponent={ProjectFilterGroup} />
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
WithManageableProjects(
  WithPinned(
    WithDashboards(
      WithDashboardEntityFilter(
        ProjectsDashboard,
        'project',
        'projects',
        'pinnedProjects',
        'filteredProjects',
        projectPassesFilters
      ),
      DashboardDataTarget.projects,
      DASHBOARD_NAME,
      defaultDashboardSetup
    )
  ),
  true // include challenges
)
