import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import _map from 'lodash/map'
import _differenceBy from 'lodash/differenceBy'
import classNames from 'classnames'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import messages from './Messages'
import './AssociatedChallengeList.scss'

/**
 * AssociatedChallengeList renders the given challenges as two lists with add/remove
 * buttons.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class AssociatedChallengeList extends Component {
  render() {
    const challenges =
      _differenceBy(this.props.challenges, this.props.excludeChallenges, 'id')

    const challengeCards =
      _map(challenges, challenge => (
        <div className='item-entry' key={challenge.id}>
          <div className='columns challenge-list-item'>
            <div className='column is-narrow item-visibility'>
              <SvgSymbol className={classNames('icon', {enabled: challenge.enabled})}
                          viewBox='0 0 20 20'
                          sym={challenge.enabled ? 'visible-icon' : 'hidden-icon'} />
            </div>

            <div className='column challenge-name mr-text-black'>
              {challenge.name}
            </div>

            <div className='column is-narrow item-pinned mr-mr-10'>
              {this.props.toBeAdded ?
                <div className="clickable mr-text-green"
                     onClick={() => this.props.addChallenge(challenge.id)}>
                  <FormattedMessage {...messages.addLabel} />
                </div> :
                <div className="clickable mr-text-green"
                     onClick={() => this.props.removeChallenge(challenge.id)}>
                  <FormattedMessage {...messages.removeLabel} />
                </div>
              }
            </div>
          </div>
        </div>
      ))

    return (
      <div className='admin__manage__managed-item-list challenge-list'>
        {!this.props.loadingChallenges && challengeCards.length === 0 ?
         <div className="challenge-list__no-results">
           <FormattedMessage {...messages.noChallenges} />
         </div> :
         challengeCards
        }
      </div>
    )
  }
}

AssociatedChallengeList.propTypes = {
  challenges: PropTypes.array.isRequired,
}
