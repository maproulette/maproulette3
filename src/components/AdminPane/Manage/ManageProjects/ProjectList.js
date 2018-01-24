import React from 'react'
import classNames from 'classnames'
import { map as _map,
         get as _get } from 'lodash'
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
  return _map(props.projects, project => (
    <div className='item-entry' key={project.id}>
      <div className={classNames('columns list-item project-list-item',
                                 {'is-active': project.id === _get(props, 'selectedProject.id')})}>
        <div className='column is-narrow item-visibility'
             title={project.enabled ?
                    props.intl.formatMessage(messages.enabledTooltip) :
                    props.intl.formatMessage(messages.disabledTooltip)}>
          <SvgSymbol className={classNames('icon', {enabled: project.enabled})}
                     viewBox='0 0 20 20'
                     sym={project.enabled ? 'visible-icon' : 'hidden-icon'} />
        </div>

        <div className={classNames(
          'column item-link',
          {'is-active': project.id === _get(props, 'selectedProject.id')})}
        >
          <Link to={`/admin/project/${project.id}`}>
            {project.displayName || project.name}
          </Link>
        </div>

        <div className='column is-narrow has-text-right controls edit-control'>
          <Link to={`/admin/project/${project.id}/edit`}
                title={props.intl.formatMessage(messages.editProjectTooltip)}>
            <FormattedMessage {...messages.editProjectLabel} />
          </Link>
        </div>

        <div className='column is-narrow has-text-right controls new-challenge-control'>
          <Link to={`/admin/project/${project.id}/challenges/new`}
                title={props.intl.formatMessage(messages.addChallengeTooltip)}>
            <span className='button is-clear'>
              <SvgSymbol className='icon' sym='list-add-icon' viewBox='0 0 20 20' />
            </span>
          </Link>
        </div>
      </div>
    </div>
  ))
}

export default ProjectList
