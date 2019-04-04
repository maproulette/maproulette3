import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, FormattedRelative } from 'react-intl'
import { Link } from 'react-router-dom'
import AnimateHeight from 'react-animate-height'
import classNames from 'classnames'
import parse from 'date-fns/parse'
import _isUndefined from 'lodash/isUndefined'
import _noop from 'lodash/noop'
import _get from 'lodash/get'
import { messagesByDifficulty }
       from '../../services/Challenge/ChallengeDifficulty/ChallengeDifficulty'
import WithStartChallenge from '../HOCs/WithStartChallenge/WithStartChallenge'
import MarkdownContent from '../MarkdownContent/MarkdownContent'
import ChallengeProgress from '../ChallengeProgress/ChallengeProgress'
// import SvgSymbol from '../SvgSymbol/SvgSymbol'
import BusySpinner from '../BusySpinner/BusySpinner'
import messages from './Messages'

export class CardChallenge extends Component {
  render() {
    return (
      <article
        ref={node => this.node = node}
        className={classNames(
          "mr-card-challenge",
          this.props.className,
          {'is-active': this.props.isExpanded}
        )}
      >
        <header className="mr-card-challenge__header" onClick={this.props.toggleExpanded}>
          <div>
            {(this.props.isSaved || this.props.challenge.featured ||
              this.props.challenge.popular || this.props.challenge.newest) &&
             <ul className="mr-card-challenge__taxonomy">
               {this.props.isSaved &&
                <li>
                  <span className="mr-text-pink-light">Saved</span>
                </li>
               }
               {this.props.challenge.featured &&
                <li>
                  <span className="mr-text-turquoise">Featured</span>
                </li>
               }
               {this.props.challenge.popular &&
                <li>
                  <span className="mr-text-orange">Popular</span>
                </li>
               }
               {this.props.challenge.newest &&
                <li>
                  <span className="mr-text-yellow">Newest</span>
                </li>
               }
             </ul>
            }
            <h3 className="mr-card-challenge__title">
              {this.props.challenge.name}
            </h3>

            {this.props.challenge.parent && // virtual challenges don't have projects
             <Link 
               className="mr-card-challenge__owner"
               onClick={(e) => {e.stopPropagation()}}
               to={`/project/${this.props.challenge.parent.id}/leaderboard`}
             >
               {_get(this.props, 'challenge.parent.displayName')}
             </Link>
            }
          </div>
          {/*
          {!this.props.permanentlyExpanded &&
           <SvgSymbol
             sym="icon-cheveron-down"
             viewBox="0 0 20 20"
             className={classNames(
               'mr-transition mr-fill-green-lighter mr-min-w-6 mr-w-6 mr-h-6',
               { 'mr-rotate-180': !this.props.isExpanded }
             )}
           />
          }
          */}
        </header>

        <AnimateHeight duration={500} height={this.props.isExpanded ? 'auto' : 0}>
          {this.props.isExpanded &&
          <div className="mr-card-challenge__content">
            {!this.props.challenge.isVirtual &&
             <ol className="mr-card-challenge__meta">
               <li>
                 <strong className="mr-text-yellow">
                   <FormattedMessage {...messages.difficulty} />:
                 </strong> <FormattedMessage
                   {...messagesByDifficulty[this.props.challenge.difficulty]}
                 />
               </li>
               <li>
                 <strong className="mr-text-yellow">
                   <FormattedMessage {...messages.lastTaskRefreshLabel} />:
                 </strong> <FormattedRelative
                   value={parse(this.props.challenge.lastTaskRefresh)}
                 />
               </li>
               <li>
                 <Link
                   className="mr-text-green-lighter hover:mr-text-white"
                   to={`/challenge/${this.props.challenge.id}/leaderboard`}
                 >
                   <FormattedMessage {...messages.viewLeaderboard} />
                 </Link>
               </li>
             </ol>
            }

            <div className="mr-card-challenge__description">
              <MarkdownContent
                markdown={this.props.challenge.description || this.props.challenge.blurb}
              />
            </div>

            <ChallengeProgress className="mr-mt-4 mr-mb-12" challenge={this.props.challenge} />

            <ul className="mr-card-challenge__actions">
              {!_isUndefined(this.props.startControl) &&
               <li>
                 {this.props.isLoading ?
                  <BusySpinner inline /> :
                  this.props.startControl
                 }
               </li>
              }
              {(!_isUndefined(this.props.saveControl) || !_isUndefined(this.props.unsaveControl)) &&
               <li>
                 {this.props.saveControl}
                 {this.props.unsaveControl}
               </li>
              }
              {!_isUndefined(this.props.manageControl) &&
                <li>{this.props.manageControl}</li>
              }
            </ul>
          </div>
          }
        </AnimateHeight>
      </article>
    )
  }
}

CardChallenge.propTypes = {
  /** The challenge to display */
  challenge: PropTypes.object.isRequired,
  /** Invoked if the user wants to start working on the challenge */
  startChallenge: PropTypes.func.isRequired,
  /** Set to true if card should be in expanded view */
  isExpanded: PropTypes.bool,
  /** Invoked to toggle expansion of the card, if provided */
  toggleExpanded: PropTypes.func,
  /** Set to true if this challenge has been saved by the user */
  isSaved: PropTypes.bool,
  /** Optional control to be used for saving the challenge */
  saveControl: PropTypes.node,
  /** Optional control to be used for unsaving the challenge */
  unsaveControl: PropTypes.node,
  /** Optional control to be used for starting the challenge */
  startControl: PropTypes.node,
  /** Optional control to be used to manage the challenge as an owner */
  manageControl: PropTypes.node,
  /** Set to true if challenge data is still being loaded */
  isLoading: PropTypes.bool,
}

CardChallenge.defaultProps = {
  isExpanded: true,
  isSaved: false,
  isLoading: false,
  toggleExpanded: _noop,
}

export default WithStartChallenge(CardChallenge)
