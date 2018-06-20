import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import _map from 'lodash/map'
import _get from 'lodash/get'
import _compact from 'lodash/compact'
import { Link } from 'react-router-dom'
import AsManager from '../../../../interactions/User/AsManager'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import messages from './Messages'
import './ChallengeList.css'

/**
 * ChallengeList renders the given challenges as a list. If a selectedProject
 * or filteredProjects is given, then challenges will be limited to the
 * specified project(s).
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class ChallengeList extends Component {
  render() {
    const manager = AsManager(this.props.user)

    const challengeItems = _compact(_map(this.props.challenges, challenge => {
      if (challenge.deleted) {
        return null
      }

      const projectId = _get(challenge, 'parent.id', challenge.parent)

      return (
        <div className='item-entry' key={challenge.id}>
          <div className='columns challenge-list-item'>
            <div className='column is-narrow item-visibility'>
              <SvgSymbol className={classNames('icon', {enabled: challenge.enabled})}
                         viewBox='0 0 20 20'
                         sym={challenge.enabled ? 'visible-icon' : 'hidden-icon'} />
            </div>

            <div className='column challenge-name'>
              <Link to={`/admin/project/${projectId}/challenge/${challenge.id}`}>
                {challenge.name}
              </Link>
            </div>
          </div>
        </div>
      )
    }))

    return (
      <div className='admin__manage__managed-item-list challenge-list'>
        {!this.props.loadingChallenges && challengeItems.length === 0 ?
         <div className="challenge-list__no-results">
           <FormattedMessage {...messages.noChallenges} />
         </div> :
         challengeItems
        }

        {!this.props.suppressControls && manager.canWriteProject(this.props.project) &&
         <div className="challenge-list__controls has-centered-children">
           <button className="button is-green is-outlined new-challenge"
                   onClick={() => this.props.history.push(
                     `/admin/project/${this.props.project.id}/challenges/new`)}>
             <FormattedMessage {...messages.addChallengeLabel} />
           </button>
         </div>
        }
      </div>
    )
  }
}

ChallengeList.propTypes = {
  challenges: PropTypes.array.isRequired,
  suppressControls: PropTypes.bool,
}
