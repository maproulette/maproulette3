import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { FormattedMessage, FormattedRelative, injectIntl } from 'react-intl'
import _isObject from 'lodash/isObject'
import _get from 'lodash/get'
import _findIndex from 'lodash/findIndex'
import parse from 'date-fns/parse'
import MapPane from '../EnhancedMap/MapPane/MapPane'
import ChallengeBrowseMap from '../ChallengeBrowseMap/ChallengeBrowseMap'
import { messagesByDifficulty } from '../../services/Challenge/ChallengeDifficulty/ChallengeDifficulty'
import messages from './Messages'
import BusySpinner from '../BusySpinner/BusySpinner'
import ChallengeProgress from '../ChallengeProgress/ChallengeProgress'
import MarkdownContent from '../MarkdownContent/MarkdownContent'
import SignInButton from '../SignInButton/SignInButton'
import AsManager from '../../interactions/User/AsManager'
import WithTaskMarkers from '../HOCs/WithTaskMarkers/WithTaskMarkers'
import WithStartChallenge from '../HOCs/WithStartChallenge/WithStartChallenge'
import WithBrowsedChallenge from '../HOCs/WithBrowsedChallenge/WithBrowsedChallenge'
import WithClusteredTasks from '../HOCs/WithClusteredTasks/WithClusteredTasks'
import WithCurrentUser from '../HOCs/WithCurrentUser/WithCurrentUser'

const BrowseMap = WithTaskMarkers(ChallengeBrowseMap)

/**
 * ChallengeDetail represents a specific challenge view. It presents an
 * overview of the challenge and allows the user to choose to start
 * working on the challenge.
 *
 * @author [Ryan Scherler](https://github.com/ryanscherler)
 */
export class ChallengeDetail extends Component {
  render() {
    const challenge = this.props.browsedChallenge
    if (!_isObject(challenge) || this.props.loadingBrowsedChallenge) {
      return (
        <div className="mr-bg-gradient-r-green-dark-blue mr-text-white mr-min-h-screen-50 mr-items-center mr-justify-center lg:mr-flex mr-text-center mr-py-8">
          <BusySpinner />
        </div>
      )
    }

    // Setup saved status and controls based on whether the user has saved this
    // challenge
    let isSaved = false
    let unsaveControl = null
    let saveControl = null
    let startControl = null

    if (_isObject(this.props.user) && !challenge.isVirtual) {
      if (
        _findIndex(this.props.user.savedChallenges, { id: challenge.id }) !== -1
      ) {
        isSaved = true
        unsaveControl = (
          <Link
            to={{}}
            onClick={() =>
              this.props.unsaveChallenge(this.props.user.id, challenge.id)
            }
            className="mr-button"
          >
            <FormattedMessage {...messages.unsave} />
          </Link>
        )
      } else {
        saveControl = (
          <Link
            to={{}}
            onClick={() =>
              this.props.saveChallenge(this.props.user.id, challenge.id)
            }
            className="mr-button"
          >
            <FormattedMessage {...messages.save} />
          </Link>
        )
      }
    }

    // Users need to be signed in to start a challenge
    if (!_isObject(this.props.user)) {
      startControl = <SignInButton {...this.props} longForm className="" />
    } else {
      startControl = (
        <Link
          to={{}}
          className="mr-button"
          onClick={() => this.props.startChallenge(challenge)}
        >
          <FormattedMessage {...messages.start} />
        </Link>
      )
    }

    // Does this user own (or can manage) the current challenge?
    const isManageable = AsManager(this.props.user).canManageChallenge(
      challenge
    )

    const manageControl = !isManageable ? null : (
      <Link
        to={`/admin/project/${challenge.parent.id}/challenge/${challenge.id}`}
        className="mr-text-green-lighter mr-text-sm hover:mr-text-white"
      >
        <FormattedMessage {...messages.manageLabel} />
      </Link>
    )

    return (
      <div className="mr-bg-gradient-r-green-dark-blue mr-text-white lg:mr-flex">
        <div className="mr-flex-1">
          <MapPane>
            <BrowseMap
              className="split-pane"
              challenge={challenge}
              onTaskClick={this.props.startChallengeWithTask}
              {...this.props}
            />
          </MapPane>
        </div>
        <div className="mr-flex-1">
          <div className="mr-h-content mr-overflow-auto">
            <div className="mr-max-w-md mr-mx-auto">
              <div className="mr-py-12 mr-px-8">
                {_get(this.props, 'history.location.state.fromSearch') && (
                  <div className="mr-mb-4">
                    <button
                      className="mr-text-green-lighter mr-text-sm hover:mr-text-white"
                      onClick={() => this.props.history.goBack()}
                    >
                      &larr; Go Back
                    </button>
                  </div>
                )}
                {(isSaved ||
                  challenge.featured ||
                  challenge.popular ||
                  challenge.newest) && (
                  <ul className="mr-card-challenge__taxonomy">
                    {isSaved && (
                      <li>
                        <span className="mr-text-pink-light">Saved</span>
                      </li>
                    )}
                    {challenge.featured && (
                      <li>
                        <span className="mr-text-turquoise">Featured</span>
                      </li>
                    )}
                    {challenge.popular && (
                      <li>
                        <span className="mr-text-orange">Popular</span>
                      </li>
                    )}
                    {challenge.newest && (
                      <li>
                        <span className="mr-text-yellow">Newest</span>
                      </li>
                    )}
                  </ul>
                )}
                <h1 className="mr-card-challenge__title">{challenge.name}</h1>

                {challenge.parent && ( // virtual challenges don't have projects
                  <Link
                    className="mr-card-challenge__owner"
                    onClick={e => {
                      e.stopPropagation()
                    }}
                    to={`/project/${challenge.parent.id}/leaderboard`}
                  >
                    {challenge.parent.displayName}
                  </Link>
                )}

                <div className="mr-card-challenge__content">
                  {!challenge.isVirtual && (
                    <ol className="mr-card-challenge__meta">
                      <li>
                        <strong className="mr-text-yellow">
                          <FormattedMessage {...messages.difficulty} />:
                        </strong>{' '}
                        <FormattedMessage
                          {...messagesByDifficulty[challenge.difficulty]}
                        />
                      </li>
                      <li>
                        <strong className="mr-text-yellow">
                          <FormattedMessage
                            {...messages.lastTaskRefreshLabel}
                          />
                          :
                        </strong>{' '}
                        <FormattedRelative
                          value={parse(challenge.lastTaskRefresh)}
                        />
                      </li>
                      <li>
                        <Link
                          className="mr-text-green-lighter hover:mr-text-white"
                          to={`/challenge/${challenge.id}/leaderboard`}
                        >
                          <FormattedMessage {...messages.viewLeaderboard} />
                        </Link>
                      </li>
                    </ol>
                  )}

                  <div className="mr-card-challenge__description">
                    <MarkdownContent
                      markdown={challenge.description || challenge.blurb}
                    />
                  </div>

                  <ChallengeProgress
                    className="mr-my-4"
                    challenge={challenge}
                  />

                  <ul className="mr-card-challenge__actions">
                    {startControl && <li>{startControl}</li>}
                    {(saveControl || unsaveControl) && (
                      <li>
                        {saveControl}
                        {unsaveControl}
                      </li>
                    )}
                    {manageControl && <li>{manageControl}</li>}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default WithCurrentUser(
  WithClusteredTasks(
    WithStartChallenge(WithBrowsedChallenge(injectIntl(ChallengeDetail)))
  )
)
