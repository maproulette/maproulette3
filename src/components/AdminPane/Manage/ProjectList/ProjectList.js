import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import _map from 'lodash/map'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import Tabs from '../../../Bulma/Tabs'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import ProjectOverview from '../ProjectOverview/ProjectOverview'
import ChallengeList from '../ChallengeList/ChallengeList'
import messages from './Messages'
import './ProjectList.css'

/**
 * ProjectList renders the given list of projects. If the user is able to
 * manage more than one project, then the currently selected project (if any)
 * will be highlighted and clicking its name will display the quick-view of
 * that project's challenges. Otherwise, if the user only manages a single
 * project, then the project name is simply shown without being highlighted
 * or clickable.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class ProjectList extends Component {
  nodes = new Map()

  managesSingleProject = props =>
    _get(this.props, 'allManageableProjects.length', 0) === 1

  selectedProjectId = props => {
    // If the user only manages a single project, go with it.
    if (this.managesSingleProject(props)) {
      return _get(props, 'project.id')
    }
    else {
      return props.routedProjectId
    }
  }

  ensureProjectIsVisible = projectId => {
    if (_isFinite(projectId) && this.nodes.has(projectId)) {
      this.nodes.get(projectId).scrollIntoView()
      window.scrollTo(0, 0)
    }
  }

  toggleRoute = projectId => {
    if (projectId === this.selectedProjectId(this.props)) {
      this.props.history.push('/admin/projects')
    }
    else {
      this.props.history.push(`/admin/project/${projectId}`)
    }
  }

  componentDidMount() {
    this.ensureProjectIsVisible(this.selectedProjectId(this.props))
  }

  render() {
    const projectItems = _map(this.props.projects, project => {
      // Expand the currently-selected project.
      const isSelected = project.id === this.selectedProjectId(this.props)

      let projectNameColumn = null
      let collapsibleControl = null

      // If user only manages a single project, don't let it be collapsed.
      if (this.managesSingleProject(this.props) && isSelected) {
        projectNameColumn = (
          <div className="column item-link project-list-item__project-name is-active">
            <div className="level">
              {project.displayName || project.name}
              {isSelected && this.props.loadingChallenges && <BusySpinner inline />}
            </div>
          </div>
        )
      }
      else {
        projectNameColumn = (
          <div className={classNames('column item-link',
                                     {'is-active': isSelected})}>
            <div className="level">
              <a onClick={() => this.toggleRoute(project.id)}>
                {project.displayName || project.name}
              </a>
              {isSelected && this.props.loadingChallenges && <BusySpinner inline />}
            </div>
          </div>
        )

        collapsibleControl = (
          <a onClick={() => this.toggleRoute(project.id)}>
            <span className="collapsible-icon"><span className="icon"></span></span>
          </a>
        )
      }

      const tabs = {
        [this.props.intl.formatMessage(messages.challengesTabLabel)]:
          <ChallengeList {...this.props} />,
        [this.props.intl.formatMessage(messages.detailsTabLabel)]:
          <ProjectOverview {...this.props} />,
      }

      return (
        <div ref={node => this.nodes.set(project.id, node)}
             className='item-entry' key={project.id}>
          <div className={classNames('columns list-item project-list-item',
                                     {'is-expanded': isSelected,
                                      'is-active': isSelected})}>
            <div className='column is-narrow item-visibility'
                title={project.enabled ?
                        this.props.intl.formatMessage(messages.enabledTooltip) :
                        this.props.intl.formatMessage(messages.disabledTooltip)}>
              <SvgSymbol className={classNames('icon', {enabled: project.enabled})}
                        viewBox='0 0 20 20'
                        sym={project.enabled ? 'visible-icon' : 'hidden-icon'} />
            </div>

            {projectNameColumn}

            <div className='column is-narrow has-text-right controls edit-control'>
              <Link to={`/admin/project/${project.id}/edit`}
                    title={this.props.intl.formatMessage(messages.editProjectTooltip)}>
                <FormattedMessage {...messages.editProjectLabel} />
              </Link>
            </div>

            {collapsibleControl}
          </div>

          {isSelected &&
            <div className='project-list__project-content'>
              <Tabs className='is-centered' tabs={tabs} />
            </div>
          }
        </div>
      )
    })

    return (
      <div className='admin__manage__managed-item-list project-list'>
        {projectItems}
      </div>
    )
  }
}

ProjectList.propTypes = {
  /** The projects to display */
  projects: PropTypes.array,
  /** All projects the current user manages */
  allManageableProjects: PropTypes.array,
}
