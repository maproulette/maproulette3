import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import _map from 'lodash/map'
import _isObject from 'lodash/isObject'
import _isEmpty from 'lodash/isEmpty'
import _filter from 'lodash/filter'
import _get from 'lodash/get'
import { Link } from 'react-router-dom'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'

/**
 * ChallengeList renders the given challenges as a list. If a selectedProject
 * or filteredProjects is given, then challenges will be limited to the
 * specified project(s).
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class ChallengeList extends Component {
  render() {
    let challenges = this.props.challenges

    if (_isObject(this.props.selectedProject)) {
      challenges = _filter(challenges, {parent: this.props.selectedProject.id})
    }
    else if (!_isEmpty(this.props.filteredProjects)) {
      const projectIds = _map(this.props.filteredProjects, 'id')
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
          </div>
        </div>
      )
    })
  }
}

ChallengeList.propTypes = {
  challenges: PropTypes.array.isRequired,
  selectedProject: PropTypes.object,
  filteredProjects: PropTypes.array,
  hideControls: PropTypes.bool,
}

ChallengeList.defaultProps = {
  hideControls: false,
}
