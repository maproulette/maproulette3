import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import _map from 'lodash/map'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import _filter from 'lodash/filter'
import _find from 'lodash/find'
import _uniqBy from 'lodash/uniqBy'
import _omit from 'lodash/omit'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import AsManageableProject
       from '../../../../interactions/Project/AsManageableProject'
import Tabs from '../../../Bulma/Tabs'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import ProjectOverview from '../ProjectOverview/ProjectOverview'
import ProjectManagers from '../ProjectManagers/ProjectManagers'
import ChallengeList from '../ChallengeList/ChallengeList'
import messages from './Messages'
import './ProjectList.css'

/**
 * ProjectList renders the given list of projects. The currently selected project
 * (automatically the user's home project if they only manage a single project)
 * will be expanded with a list of the project's challenges.
 *
 * If a user manages multiple projects and search results are given, then only
 * projects matching the query + projects containing challenges that match
 * the query will be displayed. Projects with matching challenges will show a
 * quick preview of the matching challenge names.
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
    const selectedProjectId = this.selectedProjectId(this.props)
    const hasSearchResults =
      this.props.filteredChallenges.length < this.props.challenges.length

    let projectsToDisplay = this.props.projects
    let projectsWithChallengeSearchResults = new Set()

    if (hasSearchResults) {
      projectsWithChallengeSearchResults =
        new Set(_map(this.props.filteredChallenges, 'parent'))

      // Display both project results and projects that have challenge results.
      projectsToDisplay = _uniqBy(
        this.props.projects.concat(
          _filter(this.props.allManageableProjects,
                  project => projectsWithChallengeSearchResults.has(project.id))
        ), 'id'
      )
    }

    // If a project is selected, make sure it's included in the display
    // regardless of whether it matches search results.
    if (_isFinite(selectedProjectId)) {
      if (!_find(projectsToDisplay, {id: selectedProjectId})) {
        projectsToDisplay.push(
          _find(this.props.allManageableProjects, {id: selectedProjectId})
        )
      }
    }

    const projectItems = _map(projectsToDisplay, managedProject => {
      const project = AsManageableProject(managedProject)
      const isSelected = project.id === selectedProjectId

      // Only show challenge preview if there are no selected projects and this
      // project has matching challenge results.
      const showChallengePreview =
        !_isFinite(selectedProjectId) &&
        projectsWithChallengeSearchResults.has(project.id)

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

      let projectBody = null
      if (isSelected) {
        const tabs = {
          [this.props.intl.formatMessage(messages.challengesTabLabel)]:
            <ChallengeList challenges={project.childChallenges(this.props.challenges)}
                          {..._omit(this.props, 'challenges')} />,
          [this.props.intl.formatMessage(messages.detailsTabLabel)]:
            <ProjectOverview managesSingleProject={this.managesSingleProject(this.props)}
                            {...this.props} />,
          [this.props.intl.formatMessage(messages.managersTabLabel)]:
            <ProjectManagers {...this.props} />,
        }

        projectBody = (
          <div className='project-list__project-content'>
            <Tabs className='is-centered' tabs={tabs} />
          </div>
        )
      }
      else if (showChallengePreview) {
        projectBody = (
          <div className="project-list__project-challenge-preview">
            <div className="project-list__project-challenge-preview__header">
              <FormattedMessage {...messages.challengePreviewHeader} />
            </div>

            <ChallengeList challenges={project.childChallenges(this.props.filteredChallenges)}
                           suppressControls
                           {..._omit(this.props, 'challenges')} />
          </div>
        )
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

          {projectBody}
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
  /** The projects to consider for display */
  projects: PropTypes.array,
  /** All projects the current user manages */
  allManageableProjects: PropTypes.array,
  /** Challenges to consider for display */
  challenges: PropTypes.array,
  /** Challenges from search results */
  filteredChallenges: PropTypes.array,
  /** True if challenges are still loading */
  loadingChallenges: PropTypes.bool,
}
