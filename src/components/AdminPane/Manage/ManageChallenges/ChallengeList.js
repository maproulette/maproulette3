import React from 'react'
import classNames from 'classnames'
import { map as _map,
         isObject as _isObject,
         isEmpty as _isEmpty,
         filter as _filter,
         get as _get } from 'lodash'
import { Link } from 'react-router-dom'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'

/**
 * ChallengeList renders the given challenges as a list. If a selectedProject
 * or filteredProjects is given, then challenges will be limited to the
 * specified project(s).
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const ChallengeList = function(props) {

  let challenges = props.challenges
  if (_isObject(props.selectedProject)) {
    challenges = _filter(challenges, {parent: props.selectedProject.id})
  }
  else if (!_isEmpty(props.filteredProjects)) {
    const projectIds = _map(props.filteredProjects, 'id')
    challenges = _filter(challenges,
                         challenge => projectIds.indexOf(challenge.parent) !== -1)
  }

  return _map(challenges, challenge => {
    const projectId = _get(challenge, 'parent.id', challenge.parent)

    return (
      <div className='item-entry' key={challenge.id}>
        <div className='columns'>
          <div className='column is-narrow item-visibility'>
            <SvgSymbol className={classNames('icon', {enabled: challenge.enabled})}
                       viewBox='0 0 20 20'
                       sym={challenge.enabled ? 'visible-icon' : 'hidden-icon'} />
          </div>

          <div className='column'>
            <Link to={`/admin/project/${projectId}/challenge/${challenge.id}`}>
              {challenge.name}
            </Link>
          </div>

          <div className='column is-narrow controls'>
            <Link to={`/admin/project/${projectId}/challenge/${challenge.id}/edit`}>
              Edit
            </Link>
          </div>
        </div>
      </div>
    )
  })
}

export default ChallengeList
