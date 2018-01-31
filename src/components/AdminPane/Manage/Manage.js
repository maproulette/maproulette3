import React, { Component } from 'react'
import classNames from 'classnames'
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

export class Manage extends Component {
  state = {
    sidebarMinimized: false,
  }

  toggleSidebarMinimization = () =>
    this.setState({sidebarMinimized: !this.state.sidebarMinimized})

  render() {
    const selectedProjectId = _get(this.props, 'match.params.projectId')

    const selectedProject =
      selectedProjectId ?
      _find(this.props.projects, {id: parseInt(selectedProjectId, 10)}) :
      null

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
          <Sidebar className={classNames('admin__manage__sidebar',
                                         'projects-sidebar',
                                         'inline',
                                         {'is-minimized': this.state.sidebarMinimized})}
                   isActive={true}>

            <ManageProjects selectedProject={selectedProject} {...this.props} />

            <div className='admin__manage__sidebar__controls'>
              <button className="button is-green is-outlined new-project"
                      onClick={() => this.props.history.push('/admin/projects/new')}>
                <FormattedMessage {...messages.newProject} />
              </button>
            </div>
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
