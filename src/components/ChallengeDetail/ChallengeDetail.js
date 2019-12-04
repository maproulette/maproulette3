import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { FormattedMessage, FormattedRelative, injectIntl } from 'react-intl'
import _isObject from 'lodash/isObject'
import _get from 'lodash/get'
import _findIndex from 'lodash/findIndex'
import parse from 'date-fns/parse'
import MapPane from '../EnhancedMap/MapPane/MapPane'
import TaskClusterMap from '../TaskClusterMap/TaskClusterMap'
import { messagesByDifficulty } from '../../services/Challenge/ChallengeDifficulty/ChallengeDifficulty'
import { isUsableChallengeStatus } from '../../services/Challenge/ChallengeStatus/ChallengeStatus'
import messages from './Messages'
import BusySpinner from '../BusySpinner/BusySpinner'
import ChallengeTaxonomy from '../ChallengeTaxonomy/ChallengeTaxonomy'
import ChallengeProgress from '../ChallengeProgress/ChallengeProgress'
import MarkdownContent from '../MarkdownContent/MarkdownContent'
import SignInButton from '../SignInButton/SignInButton'
import AsManager from '../../interactions/User/AsManager'
import WithStartChallenge from '../HOCs/WithStartChallenge/WithStartChallenge'
import WithBrowsedChallenge from '../HOCs/WithBrowsedChallenge/WithBrowsedChallenge'
import WithClusteredTasks from '../HOCs/WithClusteredTasks/WithClusteredTasks'
import WithCurrentUser from '../HOCs/WithCurrentUser/WithCurrentUser'
import WithChallengeTaskClusters from '../HOCs/WithChallengeTaskClusters/WithChallengeTaskClusters'
import WithTaskClusterMarkers from '../HOCs/WithTaskClusterMarkers/WithTaskClusterMarkers'
import { fromLatLngBounds } from '../../services/MapBounds/MapBounds'

const ClusterMap = WithChallengeTaskClusters(
                     WithTaskClusterMarkers(TaskClusterMap('challengeDetail')))


/**
 * ChallengeDetail represents a specific challenge view. It presents an
 * overview of the challenge and allows the user to choose to start
 * working on the challenge.
 *
 * @author [Ryan Scherler](https://github.com/ryanscherler)
 */
export class ChallengeDetail extends Component {
  state = {
  }

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

    const startableChallenge = !challenge.deleted && isUsableChallengeStatus(challenge.status)

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

    const dataOriginDateText = !challenge.dataOriginDate ? null :
      this.props.intl.formatMessage(messages.dataOriginDateLabel,
        {refreshDate: this.props.intl.formatDate(parse(challenge.lastTaskRefresh)),
         sourceDate: this.props.intl.formatDate(parse(challenge.dataOriginDate))})

   const map =
       <ClusterMap
         className="split-pane"
         onTaskClick={taskId => this.props.startChallengeWithTask(challenge.id, false, taskId)}
         challenge={challenge}
         allowClusterToggle={false}
         criteria={{boundingBox: fromLatLngBounds(this.state.bounds), zoom: this.state.zoom}}
         updateTaskFilterBounds={(bounds, zoom) => this.setState({bounds, zoom})}
         skipRefreshTasks
         {...this.props}
       />

    return (
      <div className="mr-bg-gradient-r-green-dark-blue mr-text-white lg:mr-flex">
        <div className="mr-flex-1">
          <MapPane>{map}</MapPane>
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
                      &larr; <FormattedMessage {...messages.goBack} />
                    </button>
                  </div>
                )}
                <ChallengeTaxonomy challenge={challenge} isSaved={isSaved} />
                <h1 className="mr-card-challenge__title">{challenge.name}</h1>

                {challenge.parent && ( // virtual challenges don't have projects
                  <Link
                    className="mr-card-challenge__owner"
                    onClick={e => {
                      e.stopPropagation()
                    }}
                    to={`/browse/projects/${challenge.parent.id}`}
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
                      <li title={dataOriginDateText}>
                        <strong className="mr-text-yellow">
                          <FormattedMessage
                            {...messages.lastTaskRefreshLabel}
                          />
                          :
                        </strong>{' '}
                        <FormattedRelative
                          value={parse(challenge.dataOriginDate)}
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
                    {startableChallenge && startControl && <li>{startControl}</li>}
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
