import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import _map from 'lodash/map'
import _get from 'lodash/get'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import messages from './Messages'

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
  render() {
    return _map(this.props.projects, project => {
      let projectNameColumn = null

      // Show clickable name if user manages multiple projects.
      if (this.props.allManageableProjects.length > 1) {
        projectNameColumn = (
          <div className={classNames(
            'column item-link',
            {'is-active': project.id === _get(this.props, 'selectedProject.id')})}
          >
            <Link to={`/admin/manage/${project.id}`}>
              {project.displayName || project.name}
            </Link>
          </div>
        )
      }
      else {
        projectNameColumn = (
          <div className="column item-link is-active">
            {project.displayName || project.name}
          </div>
        )
      }

      return (
        <div className='item-entry' key={project.id}>
          <div className={classNames(
                            'columns list-item project-list-item',
                            {'is-active': project.id === _get(this.props, 'selectedProject.id')})}>
            <div className='column is-narrow item-visibility'
                title={project.enabled ?
                        this.props.intl.formatMessage(messages.enabledTooltip) :
                        this.props.intl.formatMessage(messages.disabledTooltip)}>
              <SvgSymbol className={classNames('icon', {enabled: project.enabled})}
                        viewBox='0 0 20 20'
                        sym={project.enabled ? 'visible-icon' : 'hidden-icon'} />
            </div>

            {projectNameColumn}

            <div className='column is-narrow has-text-right controls view-control'>
              <Link to={`/admin/project/${project.id}`}
                    title={this.props.intl.formatMessage(messages.viewProjectTooltip)}>
                <FormattedMessage {...messages.viewProjectLabel} />
              </Link>
            </div>
          </div>
        </div>
      )
    })
  }
}

ProjectList.propTypes = {
  /** The projects to display */
  projects: PropTypes.array,
  /** All projects the current user manages */
  allManageableProjects: PropTypes.array,
}
