import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import _map from 'lodash/map'
import _sortBy from 'lodash/sortBy'
import AsManager from '../../../../interactions/User/AsManager'
import ChallengeCard from '../ChallengeCard/ChallengeCard'
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

    // Show pinned challenges first
    const challengeCards = _sortBy(
      _map(this.props.challenges, challenge => (
        <ChallengeCard {...this.props}
                       key={challenge.id}
                       challenge={challenge}
                       isPinned={this.props.pinnedChallenges.indexOf(challenge.id) !== -1} />
      )),
      challengeCard => !challengeCard.props.isPinned
    )

    return (
      <div className='admin__manage__managed-item-list challenge-list'>
        {!this.props.loadingChallenges && challengeCards.length === 0 ?
         <div className="challenge-list__no-results">
           <FormattedMessage {...messages.noChallenges} />
         </div> :
         challengeCards
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
