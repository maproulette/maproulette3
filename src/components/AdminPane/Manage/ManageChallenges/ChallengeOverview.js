import React, { Component } from 'react'
import { FormattedMessage,
         FormattedDate } from 'react-intl'
import { Link } from 'react-router-dom'
import _get from 'lodash/get'
import _takeRight from 'lodash/takeRight'
import { ChallengeStatus,
         isUsableChallengeStatus,
         messagesByStatus }
       from  '../../../../services/Challenge/ChallengeStatus/ChallengeStatus'
import AsManager from '../../../../interactions/User/AsManager'
import ChallengeProgress
       from '../../../ChallengeProgress/ChallengeProgress'
import ChallengeLeaderboard
       from '../ChallengeLeaderboard/ChallengeLeaderboard'
import ChallengeKeywords from '../ChallengeKeywords/ChallengeKeywords'
import VisibilitySwitch from '../VisibilitySwitch/VisibilitySwitch'
import ChallengeActivityTimeline
       from '../../../ActivityTimeline/ChallengeActivityTimeline/ChallengeActivityTimeline'
import WithComputedMetrics from '../../HOCs/WithComputedMetrics/WithComputedMetrics'
import messages from './Messages'

/**
 * ChallengeOverview displays some basic at-a-glance information about a
 * Challenge intended for the challenge owner, such as its creation date,
 * status, and a timeline of recent activity.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ChallengeOverview extends Component {
  render() {
    const manager = AsManager(this.props.user)

    const status = _get(this.props,
                        'challenge.status', ChallengeStatus.none)
    const hasTasks = _get(this.props, 'challenge.actions.total', 0) > 0

    return (
      <div className="challenge-overview">
        <section className="challenge-overview__status">
          <div className="columns">
            <div className="column is-one-quarter status-label">
              <FormattedMessage {...messages.creationDate} />
            </div>

            <div className="column is-narrow status-value">
              <FormattedDate value={new Date(this.props.challenge.created)}
                             year='numeric'
                             month='long'
                             day='2-digit' />
            </div>
          </div>
          <div className="columns">
            <div className="column is-one-quarter status-label">
              <FormattedMessage {...messages.lastModifiedDate} />
            </div>

            <div className="column is-narrow status-value">
              <FormattedDate value={new Date(this.props.challenge.modified)}
                             year='numeric'
                             month='long'
                             day='2-digit' />
            </div>
          </div>

          <div className="columns">
            <div className="column is-one-quarter status-label">
              <FormattedMessage {...messages.status} />
            </div>

            <div className="column is-narrow status-value">
              <FormattedMessage {...messagesByStatus[status]} />
            </div>
          </div>

          <div className="columns">
            <div className="column is-one-quarter status-label">
              <FormattedMessage {...messages.visibleLabel} />
            </div>

            <div className="column is-narrow status-value">
              <VisibilitySwitch {...this.props}
                                disabled={!manager.canWriteProject(this.props.challenge.parent)} />
            </div>
          </div>

          <ChallengeKeywords challenge={this.props.challenge} />

          {hasTasks && isUsableChallengeStatus(status, true) &&
           <div className="view-challenge">
             <Link to={`/challenge/${this.props.challenge.id}`}
                   className="button is-outlined is-primary start-challenge-control">
               <FormattedMessage {...messages.startChallengeLabel} />
             </Link>
           </div>
          }

          {hasTasks &&
           <ChallengeProgress challenge={this.props.challenge} />
          }
        </section>

        <section className="challenge-overview__leaderboard">
          <ChallengeLeaderboard {...this.props} />
        </section>

        <section className="challenge-overview--activity">
          <h3 className="subtitle">
            <FormattedMessage {...messages.activity} />
          </h3>
          <ChallengeActivityTimeline activity={
            _takeRight(_get(this.props, 'challenge.activity', []), 90)
          } maxEntries={14} />
        </section>
      </div>
    )
  }
}

export default WithComputedMetrics(ChallengeOverview)
