import React from 'react'
import classNames from 'classnames'
import _map from 'lodash/map'
import _get from 'lodash/get'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import messages from './Messages'

/**
 * ProjectList renders the given list of projects.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const ProjectList = function(props) {
  return _map(props.projects, project => {
    // If there's more than one project, highlight the selected project
    // and link its name to displaying that project's challenges. But if
    // there's only one project in the list, just show its name.
    let projectNameColumn = null
    if (props.projects.length > 1) {
      projectNameColumn = (
        <div className={classNames(
          'column item-link',
          {'is-active': project.id === _get(props, 'selectedProject.id')})}
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
                          {'is-active': project.id === _get(props, 'selectedProject.id')})}>
          <div className='column is-narrow item-visibility'
              title={project.enabled ?
                      props.intl.formatMessage(messages.enabledTooltip) :
                      props.intl.formatMessage(messages.disabledTooltip)}>
            <SvgSymbol className={classNames('icon', {enabled: project.enabled})}
                      viewBox='0 0 20 20'
                      sym={project.enabled ? 'visible-icon' : 'hidden-icon'} />
          </div>

          {projectNameColumn}

          <div className='column is-narrow has-text-right controls view-control'>
            <Link to={`/admin/project/${project.id}`}
                  title={props.intl.formatMessage(messages.viewProjectTooltip)}>
              <FormattedMessage {...messages.viewProjectLabel} />
            </Link>
          </div>
        </div>
      </div>
    )
  })
}

export default ProjectList
