import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import _map from 'lodash/map'
import _get from 'lodash/get'
import classNames from 'classnames'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import PageResultsButton from '../../../LoadMoreButton/PageResultsButton'
import messages from './Messages'

/**
 * AssociatedChallengeList renders the given challenges as two lists with add/remove
 * buttons.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class AssociatedChallengeList extends Component {
  render() {
    const challengeCards =
      _map(this.props.challenges, challenge => (
        <div className='mr-flex mr-my-4' key={challenge.id}>
          <div className='mr-w-8 mr-mr-2 mr-text-green'>
            <SvgSymbol className={classNames('icon mr-fill-current', {enabled: challenge.enabled})}
                        viewBox='0 0 20 20'
                        sym={challenge.enabled ? 'visible-icon' : 'hidden-icon'} />
          </div>

          <div className='mr-flex-grow mr-text-base mr-text-grey'>
            {challenge.name}
            <div className='mr-text-xs mr-text-grey-light'>{_get(challenge.parent, 'displayName')}</div>
          </div>

          <div className="mr-text-sm mr-text-green">
            {this.props.toBeAdded ?
              <button className="mr-text-current"
                    onClick={() => this.props.addChallenge(challenge.id, this.props.project.id)}>
                <FormattedMessage {...messages.addLabel} />
              </button> :
              <button className="mr-text-current"
                    onClick={() => this.props.removeChallenge(challenge.id, this.props.project.id)}>
                <FormattedMessage {...messages.removeLabel} />
              </button>
            }
          </div>
        </div>
      ))

    return (
      <div className=''>
        {!this.props.loadingChallenges && challengeCards.length === 0 ?
         <p className="mr-text-grey-light mr-text-base mr-my-4">
           <FormattedMessage {...messages.noChallenges} />
         </p> :
         challengeCards
        }
        {this.props.setSearchPage &&
          <div className="mr-text-center mr-mt-8">
            <PageResultsButton className="mr-button--green" {...this.props} />
          </div>
        }
      </div>
    )
  }
}

AssociatedChallengeList.propTypes = {
  challenges: PropTypes.array.isRequired,
}
