import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _isObject from 'lodash/isObject'
import _findIndex from 'lodash/findIndex'
import _isEqual from 'lodash/isEqual'
import _get from 'lodash/get'
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
    /**
     * Keep track of browsing locally, making UI more responsive. isBrowsing is based
     * on the browsedChallenge prop, and rendering off that prop would work correctly.
     * But in a long list of challenge results, there can be a small delay between
     * updates to the prop and re-renders, which makes the toggle control feel sluggish.
     * So we instead render based off local state, and toggle local state, while issuing
     * the prop updates in the background. We implement componentWillReceiveProps to
     * ensure our state is synced up with any prop changes.
     **/
    isBrowsing: _get(this.props, 'browsedChallenge.id') === this.props.challenge.id,
    /** Set to true when the user indicates they wish to start the challenge */
    isStarting: false,
  }

  componentDidMount() {
    if (_get(this.props, 'browsedChallenge.id') === this.props.challenge.id) {
      if (this.node) {
        this.node.scrollIntoView()
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Only re-render under specific conditions:

    // if our state changed, or
    if (!_isEqual(nextState, this.state)) {
      return true
    }

    // if the user has changed or
    if (_get(nextProps, 'user.id') !== _get(this.props, 'user.id')) {
      return true
    }

    // if the user's savedChallenges have changed
    if (_get(nextProps.user, 'savedChallenges.length') !==
        _get(this.props.user, 'savedChallenges.length')) {
      return true
    }

    // if the challenge object itself changed, or
    if (!_isEqual(nextProps.challenge, this.props.challenge)) {
      return true
    }

    // if the browsedChallenge changed and it either references our challenge now
    // or used to before.
    if (_get(nextProps, 'browsedChallenge.id') !== _get(this.props, 'browsedChallenge.id') &&
        (_get(nextProps, 'browsedChallenge.id') === this.props.challenge.id ||
         _get(this.props, 'browsedChallenge.id') === this.props.challenge.id)) {
      return true
    }

    return false
  }

  componentWillReceiveProps(nextProps) {
    // Ensure isBrowsing state stays synced with browsedChallenge prop.
    const isBrowsing =
      _get(nextProps, 'browsedChallenge.id') === this.props.challenge.id

    if (this.state.isBrowsing !== isBrowsing) {
      this.setState({isBrowsing})
    }
  }

  /**
   * Invoke to begin browsing this challenge. It will immediately update local state
   * used for rendering so that the UI is responsive, and then asynchronously
   * invoke startBrowsingChallenge.
   *
   * @private
   */
  startBrowsing = () => {
    this.setState({isBrowsing: true})
    setTimeout(() => {
      this.props.startBrowsingChallenge(this.props.challenge)
    }, 0)
  }

  /**
   * Invoke to stop browsing this challenge. It will immediately update local state
   * used for rendering so that the UI is responsive, and then asynchronously
   * invoke stopBrowsingChallenge.
   *
   * @private
   */
  stopBrowsing = () => {
    this.setState({isBrowsing: false})
    setTimeout(() => this.props.stopBrowsingChallenge(), 0)
  }

  /**
   * Toggle whether this challeng is being actively browsed
   *
   * @private
   */
  toggleActive = () => {
    this.state.isBrowsing ? this.stopBrowsing() : this.startBrowsing()
  }

  /**
   * Begin the challenge
   *
   * @private
   */
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

    if (_isObject(this.props.user) && !this.props.challenge.isVirtual) {
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
      <div ref={node => this.node = node}
           className={classNames('card', 'challenge-list__item',
                                 {'is-active': this.state.isBrowsing})}>
        {featuredIndicator}
        <header className="card-header" onClick={this.toggleActive}>
          <div>
            <div className="challenge-list__item-title">
              {!this.props.challenge.isVirtual &&
              <div className="challenge-list__item-indicator-icon saved"
                   title={this.props.intl.formatMessage(messages.saved)}>
                {savedIcon}
              </div>
              }
              {this.props.challenge.isVirtual &&
               <div className="challenge-list__item-indicator-icon virtual"
                    title={this.props.intl.formatMessage(messages.virtualChallengeTooltip)}>
                <SvgSymbol viewBox='0 0 20 20' sym="shuffle-icon" />
               </div>
              }
              <div className="challenge-list__item__name">
                {this.props.challenge.name}
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
          {this.state.isBrowsing &&
          <React.Fragment>
            <div className="challenge-list__item__difficulty">
              <span className="challenge-list__item__field-label">
                <FormattedMessage {...messages.difficulty} />
              </span>
              <span className="challenge-list__item__field-value">
                <FormattedMessage {...messagesByDifficulty[this.props.challenge.difficulty]} />
              </span>
            </div>

            <div className="challenge-list__item__blurb">
              <MarkdownContent markdown={this.props.challenge.description ||
                                        this.props.challenge.blurb} />
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
          </React.Fragment>
          }
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
  /** The challenge being actively browsed by the user, if any */
  browsedChallenge: PropTypes.object,
  /** Invoked when the user wishes to browse details of this challenge */
  startBrowsingChallenge: PropTypes.func.isRequired,
  /** Invoked if the user explicitly minimizes this challenge's details */
  stopBrowsingChallenge: PropTypes.func.isRequired,
  /** Invoked when user indicates they wish to start work on a challenge */
  startChallenge: PropTypes.func.isRequired,
  /** Invoked when a user indicates they wish to save/bookmark a challenge */
  saveChallenge: PropTypes.func.isRequired,
  /** Invoked when a user indicates they wish to unsave/bookmark a challenge */
  unsaveChallenge: PropTypes.func.isRequired,
}

export default injectIntl(ChallengeResultItem)
