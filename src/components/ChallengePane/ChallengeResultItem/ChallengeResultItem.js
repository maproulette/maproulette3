import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { isObject as _isObject,
         findIndex as _findIndex,
         startCase as _startCase,
         get as _get } from 'lodash'
import { FormattedMessage, injectIntl } from 'react-intl'
import classNames from 'classnames'
import MarkdownContent from '../../MarkdownContent/MarkdownContent'
import { messagesByDifficulty }
       from '../../../services/Challenge/ChallengeDifficulty/ChallengeDifficulty'
import ChallengeProgress from '../../ChallengeProgress/ChallengeProgress'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import messages from './Messages'
import './ChallengeResultItem.css'

/**
 * ChallengeResultItem represents a single challenge result in a ChallengeResultList.
 * It includes status icons to indicate if that challenge is featured or has
 * been saved/bookmarked by the user, a description of the challenge, and controls
 * to start working on the challenge, save the challenge, etc., and a progress bar
 * showing completion status of the challenge's tasks.
 *
 * > Note that if a null user is provided, a SignIn control will be shown instead of
 * > the usual start and save controls.
 *
 * @see See [ChallengeResultList](#challengeresultlist)
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ChallengeResultItem extends Component {
  state = {
    /** An active item expands to show the challenge blurb and controls */
    isActive: false,
    /** Set to true when the user indicates they wish to start the challenge */
    isStarting: false,
  }

  toggleActive = () => this.setState({isActive: !this.state.isActive})

  startChallenge = () => {
    if (!this.state.isStarting) {
      this.props.startChallenge(this.props.challenge)
      this.setState({isStarting: true})
    }
  }

  render() {
    // Setup saved/bookmarked status icon and control based on whether the
    // user has saved this challenge.
    let savedIcon = null
    let unsaveChallengeButton = null
    let saveChallengeButton = null

    if (_isObject(this.props.user)) {
      if (_findIndex(this.props.user.savedChallenges,
                     {id: this.props.challenge.id}) !== -1) {
        savedIcon =
          <SvgSymbol viewBox='0 0 20 20' sym="heart-icon"  />

        unsaveChallengeButton = (
          <p className="control">
            <button className="button is-outlined save-challenge-toggle"
                    onClick={() => this.props.unsaveChallenge(this.props.user.id, this.props.challenge.id)}>
              <FormattedMessage {...messages.unsave} />
            </button>
          </p>
        )
      }
      else {
        saveChallengeButton = (
          <p className="control">
            <button className="button is-outlined save-challenge-toggle"
                    onClick={() => this.props.saveChallenge(this.props.user.id, this.props.challenge.id)}>
              <FormattedMessage {...messages.save} />
            </button>
          </p>
        )
      }
    }

    // Setup the featured status indicator
    const featuredIndicator =
      !this.props.challenge.featured ? null :
      <div className="challenge-list__item--featured-indicator">
        <FormattedMessage {...messages.featured} />
      </div>

    return (
      <div className={classNames('card', 'challenge-list__item', {'is-active': this.state.isActive})}>
        {featuredIndicator}
        <header className="card-header" onClick={this.toggleActive}>
          <div>
            <div className="challenge-list__item-title">
              <div className="challenge-list__item-indicator-icon saved"
                   title={this.props.intl.formatMessage(messages.saved)}>
                {savedIcon}
              </div>
              <div className="challenge-list__item__name">
                {_startCase(this.props.challenge.name)}
              </div>
            </div>
            <div className="challenge-list__item__project-name">
              {_get(this.props, 'challenge.parent.displayName')}
            </div>
          </div>
          <a className="card-header-icon" aria-label="more options">
            <span className="icon"></span>
          </a>
        </header>

        <div className="card-content">
          <div className="challenge-list__item__difficulty">
            <span className="challenge-list__item__field-label">
              <FormattedMessage {...messages.difficultyLabel} />
            </span>
            <span className="challenge-list__item__field-value">
              <FormattedMessage {...messagesByDifficulty[this.props.challenge.difficulty]} />
            </span>
          </div>

          <div className="challenge-list__item__blurb">
            <MarkdownContent markdown={this.props.challenge.blurb ||
                                       this.props.challenge.description} />
          </div>

          <ChallengeProgress challenge={this.props.challenge} />

          <div className="field is-grouped">
            <p className="control">
              <button className={classNames("button is-outlined start-challenge",
                                            {"is-loading": this.state.isStarting})}
                      onClick={this.startChallenge}>
                <FormattedMessage {...messages.start} />
              </button>
            </p>

            {saveChallengeButton}
            {unsaveChallengeButton}
          </div>
        </div>
      </div>
    )
  }
}

ChallengeResultItem.propTypes = {
  /** The current, logged-in user or null if the user is not signed in */
  user: PropTypes.object,
  /** The challenge represented by this item */
  challenge: PropTypes.object.isRequired,
  /** Invoked when user indicates they wish to start work on a challenge */
  startChallenge: PropTypes.func.isRequired,
  /** Invoked when a user indicates they wish to save/bookmark a challenge */
  saveChallenge: PropTypes.func.isRequired,
  /** Invoked when a user indicates they wish to unsave/bookmark a challenge */
  unsaveChallenge: PropTypes.func.isRequired,
}

export default injectIntl(ChallengeResultItem)
