import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import _isObject from 'lodash/isObject'
import _findIndex from 'lodash/findIndex'
import _isEqual from 'lodash/isEqual'
import _get from 'lodash/get'
import { FormattedMessage, injectIntl } from 'react-intl'
import AsManager
       from '../../../interactions/User/AsManager'
import CardChallenge from '../../CardChallenge/CardChallenge'
import SignInButton from '../../SignInButton/SignInButton'
import messages from './Messages'
import './ChallengeResultItem.scss'

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
  constructor(props) {
    super(props)
    this.itemRef = React.createRef()
  }

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
  }

  reposition = (delay=0) => {
    if (this.itemRef.current && this.props.listRef.current) {
      setTimeout(() => {
        window.scrollTo(0, 0)
        this.props.listRef.current.scrollTop = this.itemRef.current.offsetTop
      }, delay)
    }
  }

  componentDidMount() {
    if (_get(this.props, 'browsedChallenge.id') === this.props.challenge.id) {
      // Scroll this item into view. Wait a second so that other items have a chance
      // to load, or else they may push us back out of view again
      this.reposition(1000)
    }
  }

  componentDidUpdate(prevProps) {
    if (_get(this.props, 'browsedChallenge.id') === this.props.challenge.id &&
        _get(prevProps, 'browsedChallenge.id') !== this.props.challenge.id) {
      this.reposition()
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

    // if the browsedChallenge or its loading status changed and it either
    // references our challenge now or used to before.
    if (_get(nextProps, 'browsedChallenge.id') === this.props.challenge.id ||
        _get(this.props, 'browsedChallenge.id') === this.props.challenge.id) {
      if (_get(nextProps, 'browsedChallenge.id') !==
          _get(this.props, 'browsedChallenge.id')) {
        return true
      }

      if (nextProps.loadingBrowsedChallenge !== this.props.loadingBrowsedChallenge) {
        return true
      }
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
    this.props.startChallenge(this.props.challenge)
  }

  render() {
    // Setup saved status and controls based on whether the user has saved this
    // challenge
    let isSaved = false
    let unsaveChallengeControl = null
    let saveChallengeControl = null
    let startControl = null

    if (_isObject(this.props.user) && !this.props.challenge.isVirtual) {
      if (_findIndex(this.props.user.savedChallenges,
                     {id: this.props.challenge.id}) !== -1) {
        isSaved = true
        unsaveChallengeControl = (
          <Link
            to={{}}
            onClick={() => this.props.unsaveChallenge(this.props.user.id, this.props.challenge.id)}
            className="mr-button mr-button--small"
          >
            <FormattedMessage {...messages.unsave} />
          </Link>
        )
      }
      else {
        saveChallengeControl = (
          <Link
            to={{}}
            onClick={() => this.props.saveChallenge(this.props.user.id, this.props.challenge.id)}
            className="mr-button mr-button--small"
          >
            <FormattedMessage {...messages.save} />
          </Link>
        )
      }
    }

    // Users need to be signed in to start a challenge
    if (!_isObject(this.props.user)) {
      startControl = <SignInButton {...this.props} longForm className='' />
    }
    else {
      startControl = (
        <Link
          to={{}}
          className="mr-button mr-button--small"
          onClick={() => this.props.startChallenge(this.props.challenge)}
        >
          <FormattedMessage {...messages.start} />
        </Link>
      )
    }

    // Does this user own (or can manage) the current challenge?
    const isManageable =
      AsManager(this.props.user).canManageChallenge(this.props.challenge)

    const manageControl = !isManageable ? null : (
      <Link
        to={`/admin/project/${this.props.challenge.parent.id}/challenge/${this.props.challenge.id}`}
        className="mr-text-green-lighter mr-text-sm hover:mr-text-white"
      >
        <FormattedMessage {...messages.manageLabel} />
      </Link>
    )

    return (
      <div ref={this.itemRef}>
        <CardChallenge
          className="mr-mb-4"
          challenge={this.props.challenge}
          isExpanded={this.state.isBrowsing}
          toggleExpanded={this.toggleActive}
          isSaved={isSaved}
          isLoading={this.props.isStarting}
          saveControl={saveChallengeControl}
          unsaveControl={unsaveChallengeControl}
          startControl={startControl}
          manageControl={manageControl}
          projectQuery={_get(this.props, 'searchFilters.project')}
          excludeProjectId={this.props.excludeProjectId}
        />
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
  /** Indicates whether the challenge is in the middle of being started */
  isStarting: PropTypes.bool.isRequired,
}

export default injectIntl(ChallengeResultItem)
