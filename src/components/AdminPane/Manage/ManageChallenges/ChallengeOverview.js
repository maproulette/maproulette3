import React, { Component } from 'react'
import { FormattedMessage,
         FormattedDate } from 'react-intl'
import { get as _get } from 'lodash'
import { CHALLENGE_STATUS_NONE,
         messagesByStatus }
       from  '../../../../services/Challenge/ChallengeStatus/ChallengeStatus'
import ChallengeActivityTimeline
       from '../../../ActivityTimeline/ChallengeActivityTimeline/ChallengeActivityTimeline'
import WithComputedMetrics from '../../HOCs/WithComputedMetrics/WithComputedMetrics'
import CompletionMetrics from '../../MetricsOverview/CompletionMetrics'
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
    const status = _get(this.props,
                        'challenge.status', CHALLENGE_STATUS_NONE)

    return (
      <div className="challenge-overview">
        <section className="challenge-overview--status">
          <div className="columns">
            <div className="column is-narrow status-label">
              <FormattedMessage {...messages.creationDate} />
            </div>

            <div className="column is-narrow">
              <FormattedDate value={new Date(this.props.challenge.created)}
                             year='numeric'
                             month='long'
                             day='2-digit' />
            </div>
          </div>
          <div className="columns">
            <div className="column is-narrow status-label">
              <FormattedMessage {...messages.status} />
            </div>

            <div className="column is-narrow">
              <FormattedMessage {...messagesByStatus[status]} />
            </div>
          </div>
          <CompletionMetrics onlyCompleted
                             challenges={this.props.challenge}
                             {...this.props} />
        </section>

        <section className="challenge-overview--activity">
          <h3 className="subtitle">
            <FormattedMessage {...messages.activity} />
          </h3>
          <ChallengeActivityTimeline activity={_get(this.props,
                                                    'challenge.activity', [])} />
        </section>
      </div>
    )
  }
}

export default WithComputedMetrics(ChallengeOverview)
