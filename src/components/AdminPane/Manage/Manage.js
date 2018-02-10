import React, { Component } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import _get from 'lodash/get'
import _find from 'lodash/find'
import Sidebar from '../../Sidebar/Sidebar'
import WithManageableChallenges from '../HOCs/WithManageableChallenges/WithManageableChallenges'
import WithSearchResults from '../../HOCs/WithSearchResults/WithSearchResults'
import ManageChallenges from './ManageChallenges/ManageChallenges'
import ManageProjects from './ManageProjects/ManageProjects'
import messages from './Messages'
import './Manage.css'

/**
 * Manage serves a landing page for project and challenge management and
 * creation.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class Manage extends Component {
  render() {
    const selectedProjectId =
      parseInt(_get(this.props, 'match.params.projectId'), 10)

    let selectedProject = null
    if (!isNaN(selectedProjectId)) {
      selectedProject =
        _find(this.props.projects, {id: selectedProjectId})
    }
    else if (_get(this.props, 'projects.length', 0) === 1) {
      selectedProject = this.props.projects[0]
    }

    return (
      <div className="admin__manage">
        <div className="admin__manage__header">
          <nav className="breadcrumb" aria-label="breadcrumbs">
            <ul>
              <li className="is-active">
                <a aria-current="page">
                  <FormattedMessage {...messages.manageHeader} />
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="admin__manage__pane-wrapper">
          <Sidebar className="admin__manage__sidebar projects-sidebar inline"
                   isActive={true}>
            <ManageProjects selectedProject={selectedProject} {...this.props} />

            {this.props.user.isSuperUser &&
             <div className='admin__manage__sidebar__controls'>
               <button className="button is-green is-outlined new-project"
                       onClick={() => this.props.history.push('/admin/projects/new')}>
                 <FormattedMessage {...messages.newProject} />
               </button>
             </div>
            }
          </Sidebar>

          <div className="admin__manage__primary-content">
            <ManageChallenges selectedProject={selectedProject} {...this.props} />
          </div>
        </div>
      </div>
    )
  }
}

export default WithManageableChallenges(
  WithSearchResults(
    injectIntl(Manage),
    'adminProjects',
    'projects',
    'filteredProjects'
  )
)
