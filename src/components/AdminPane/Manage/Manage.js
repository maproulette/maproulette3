import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import _get from 'lodash/get'
import Sidebar from '../../Sidebar/Sidebar'
import WithManageableProjects from '../HOCs/WithManageableProjects/WithManageableProjects'
import WithCurrentProject from '../HOCs/WithCurrentProject/WithCurrentProject'
import ManageProjects from './ManageProjects/ManageProjects'
import ProjectMetrics from './ProjectMetrics/ProjectMetrics'
import messages from './Messages'
import './Manage.css'

/**
 * Manage serves as the landing page for project and challenge management.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class Manage extends Component {
  render() {
    const manageBreadcrumb = this.props.project ? (
      <li>
        <Link to={`/admin/projects`}>
          <FormattedMessage {...messages.manageHeader} />
        </Link>
      </li>
    ) : (
      <li className="is-active">
        <a aria-current="page">
          <FormattedMessage {...messages.manageHeader} />
        </a>
      </li>
    )

    return (
      <div className="admin__manage">
        <div className="admin__manage__header">
          <nav className="breadcrumb" aria-label="breadcrumbs">
            <ul>
              {manageBreadcrumb}
              {this.props.project &&
               <li className="is-active">
                 <a aria-current="page">
                   {_get(this.props, 'project.displayName', this.props.project.name)} 
                 </a>
               </li>
              }
            </ul>
          </nav>
        </div>

        <div className="admin__manage__pane-wrapper">
          <Sidebar className="admin__manage__sidebar projects-sidebar inline"
                   isActive={true}>
            <ManageProjects {...this.props} />
          </Sidebar>

          <div className="admin__manage__primary-content">
            <ProjectMetrics {...this.props} />
          </div>
        </div>
      </div>
    )
  }
}

export default
  WithManageableProjects(
    WithCurrentProject(Manage, {
      defaultToOnlyProject: true,
      restrictToGivenProjects: true,
    })
  )
