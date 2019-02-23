import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import _map from 'lodash/map'
import _filter from 'lodash/filter'
import _differenceBy from 'lodash/differenceBy'
import ProjectCard from '../ProjectCard/ProjectCard'
import PageResultsButton from '../../../LoadMoreButton/PageResultsButton'
import './ProjectList.scss'

/**
 * ProjectList renders the given list of projects. It supports an expanded view
 * with projects rendered as cards (the default), a compact view with projects
 * rendered as a list, and a mixed view with pinned projects rendered as cards
 * and the remaining projects rendered as a list.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class ProjectList extends Component {
  asCard = (project, isPinned) => (
    <ProjectCard
      {...this.props}
      key={project.id}
      project={project}
      loadingChallenges={this.props.loadingChallenges}
      isExpanded={this.props.expandedView || (this.props.mixedView && isPinned)}
      isPinned={isPinned} />
  )

  render() {
    // Show pinned projects first
    const pinnedProjects = _filter(
      this.props.projects,
      project => this.props.pinnedProjects.indexOf(project.id) !== -1
    )
    const unpinnedProjects = _differenceBy(this.props.projects, pinnedProjects, 'id')

    const pinnedCards = _map(pinnedProjects, project => this.asCard(project, true))
    const unpinnedCards = _map(unpinnedProjects, project => this.asCard(project, false))

    // For mixed view we display pinned as cards and then others as list
    if (this.props.mixedView) {
      return (
        <React.Fragment>
          <div className='admin__manage__managed-item-list project-list'>
            {pinnedCards}
          </div>

          <div className='admin__manage__managed-item-list project-list compact-view'>
            {unpinnedCards}

            <div className="after-results">
              <PageResultsButton {...this.props} />
            </div>
          </div>
        </React.Fragment>
      )
    }
    else {
      return (
        <div className={classNames('admin__manage__managed-item-list project-list',
                                  {"compact-view": !this.props.expandedView})}>
          {pinnedCards.concat(unpinnedCards)}

          <div className="after-results">
            <PageResultsButton {...this.props} className="mr-button--green" />
          </div>
        </div>
      )
    }
  }
}

ProjectList.propTypes = {
  /** The projects to consider for display */
  projects: PropTypes.array,
  /** Set to true if challenges are still loading */
  loadingChallenges: PropTypes.bool,
  /** Set to true to show projects as cards instead of list */
  expandedView: PropTypes.bool,
  /** Set to true to show pinned projects as cards and others as list */
  mixedView: PropTypes.bool,
}

ProjectList.defaultProps = {
  projects: [],
  loadingChallenges: false,
  expandedView: true,
  mixedView: false,
}
