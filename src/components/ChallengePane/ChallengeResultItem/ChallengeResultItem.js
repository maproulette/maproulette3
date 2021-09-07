import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import _isObject from 'lodash/isObject'
import _findIndex from 'lodash/findIndex'
import _isEqual from 'lodash/isEqual'
import _isFinite from 'lodash/isFinite'
import _get from 'lodash/get'
import { FormattedMessage, injectIntl } from 'react-intl'
import { messagesByDifficulty }
       from '../../../services/Challenge/ChallengeDifficulty/ChallengeDifficulty'
import AsManager
       from '../../../interactions/User/AsManager'
import CardChallenge from '../../CardChallenge/CardChallenge'
import MarkdownContent from '../../MarkdownContent/MarkdownContent'
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

  shouldComponentUpdate(nextProps, nextState) {
    // Only re-render under specific conditions:

    // if the user has changed
    if (_get(nextProps, 'user.id') !== _get(this.props, 'user.id')) {
      return true
    }

    // if the user's savedChallenges have changed
    if (_get(nextProps.user, 'savedChallenges.length') !==
        _get(this.props.user, 'savedChallenges.length')) {
      return true
    }

    // if the challenge object itself changed
    if (!_isEqual(nextProps.challenge, this.props.challenge)) {
      return true
    }

    return false
  }

  /**
   * Invoke to begin browsing this challenge
   *
   * @private
   */
  browseChallenge = () => {
    this.props.history.push(
      `/browse/${
        this.props.challenge.isVirtual ? 'virtual' : 'challenges'
      }/${this.props.challenge.id}`,
      { fromSearch: true }
    )
  }

  render() {
    // Setup saved status and controls based on whether the user has saved this
    // challenge
    let isSaved = false
    let unsaveChallengeControl = null
    let saveChallengeControl = null

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
          isExpanded={false}
          cardClicked={this.browseChallenge}
          isSaved={isSaved}
          saveControl={saveChallengeControl}
          unsaveControl={unsaveChallengeControl}
          manageControl={manageControl}
          sort={this.props.sort}
          projectQuery={_get(this.props, 'searchFilters.project')}
          excludeProjectId={this.props.excludeProjectId}
          info={
            <div className="mr-break-words">
              {_isFinite(this.props.challenge.difficulty) &&
               <div className="mr-text-sm">
                 <strong className="mr-text-yellow mr-uppercase">
                   <FormattedMessage {...messages.difficulty} />:
                 </strong>{' '}
                 <span className="mr-text-white mr-font-medium">
                   <FormattedMessage
                     {...messagesByDifficulty[this.props.challenge.difficulty]}
                   />
                 </span>
               </div>
              }
              <MarkdownContent markdown={this.props.challenge.description} lightMode={false} />
              <div>
                <button
                  type="button"
                  onClick={this.browseChallenge}
                  className="mr-button mr-button--small"
                >
                  <FormattedMessage {...messages.browseLabel} />
                </button>
              </div>
            </div>
          }
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
  /** Invoked when a user indicates they wish to save/bookmark a challenge */
  saveChallenge: PropTypes.func.isRequired,
  /** Invoked when a user indicates they wish to unsave/bookmark a challenge */
  unsaveChallenge: PropTypes.func.isRequired,
}

export default injectIntl(ChallengeResultItem)
