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
import _isObject from 'lodash/isObject'
import { messagesByDifficulty }
       from '../../services/Challenge/ChallengeDifficulty/ChallengeDifficulty'
import WithStartChallenge from '../HOCs/WithStartChallenge/WithStartChallenge'
import MarkdownContent from '../MarkdownContent/MarkdownContent'
import ChallengeTaxonomy from '../ChallengeTaxonomy/ChallengeTaxonomy'
import ChallengeProgress from '../ChallengeProgress/ChallengeProgress'
// import SvgSymbol from '../SvgSymbol/SvgSymbol'
import BusySpinner from '../BusySpinner/BusySpinner'
import messages from './Messages'

export class CardChallenge extends Component {
  render() {
    const vpList = []

    // If we are searching for a project name let's also surface matching
    // virtual projects.
    if (this.props.challenge.parent && this.props.projectQuery) {
      const virtualParents = _get(this.props.challenge, 'virtualParents', [])
      for (let i = 0; i < virtualParents.length; i++) {
        const vp = virtualParents[i]
        if (_isObject(vp) && vp.enabled && vp.id !== this.props.excludeProjectId) {
          if (vp.displayName.toLowerCase().match(this.props.projectQuery.toLowerCase())) {
            vpList.push(
              <span key={vp.id}>
                {vpList.length > 0 &&
                  <span className="mr-mr-1 mr-text-grey-light mr-text-xs">,</span>}
                <span className="mr-text-grey-light mr-text-xs">
                  <Link className="hover:mr-text-white"
                    onClick={(e) => {e.stopPropagation()}}
                    to={`/browse/projects/${vp.id}`}
                  >
                    {vp.displayName}
                  </Link>
                </span>
              </span>
            )
          }
        }
      }
    }


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
            <ChallengeTaxonomy {...this.props} />
            <h3 className="mr-card-challenge__title">
              {this.props.challenge.name}
            </h3>

            {this.props.challenge.parent && // virtual challenges don't have projects
             this.props.challenge.parent.id !== this.props.excludeProjectId &&
             <Link
               className="mr-card-challenge__owner"
               onClick={(e) => {e.stopPropagation()}}
               to={`/browse/projects/${this.props.challenge.parent.id}`}
             >
               {_get(this.props, 'challenge.parent.displayName')}
             </Link>
            }
            {vpList.length > 0 &&
              <div className="mr-mt-2 mr-leading-none">
                <span className="mr-mr-1 mr-text-yellow mr-text-xs">
                  <FormattedMessage {...messages.vpListLabel}
                    values={{count:_get(vpList, 'length', 0)}} />
                </span>
                {vpList}
              </div>
            }
          </div>
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
                   value={parse(this.props.challenge.dataOriginDate)}
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
